import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { chatCompletion } from "@/lib/groq";
import { queryDocumentChunks } from "@/lib/pdf-processor";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { message, conversationId, documentId } = body;

  let conversation;
  if (conversationId) {
    conversation = await prisma.conversation.findFirst({
      where: { id: conversationId, userId: session.user.id },
      include: { messages: { orderBy: { createdAt: "asc" }, take: 20 } },
    });
  }

  if (!conversation) {
    conversation = await prisma.conversation.create({
      data: {
        title: message.substring(0, 100),
        userId: session.user.id,
      },
      include: { messages: true },
    });
  }

  // Save user message
  await prisma.message.create({
    data: {
      role: "user",
      content: message,
      conversationId: conversation.id,
      documentId: documentId || null,
    },
  });

  // Query relevant document chunks
  let context = "";
  try {
    const relevantChunks = await queryDocumentChunks(message, documentId, 5);
    if (relevantChunks.length > 0) {
      context = "\n\nRelevant document context:\n" +
        relevantChunks.map((c, i) => `[Source ${i + 1}, Page ${c.pageNumber}]: ${c.content}`).join("\n\n");
    }
  } catch (error) {
    console.error("Error querying chunks:", error);
  }

  const systemPrompt = `You are DocuAI, an intelligent document analysis assistant. You help users understand, analyze, and extract insights from their PDF documents. Be precise, helpful, and reference specific parts of documents when possible.${context}`;

  const messages: { role: "system" | "user" | "assistant"; content: string }[] = [
    { role: "system", content: systemPrompt },
    ...conversation.messages.map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    })),
    { role: "user", content: message },
  ];

  try {
    const response = await chatCompletion(messages);

    // Save assistant message
    const assistantMessage = await prisma.message.create({
      data: {
        role: "assistant",
        content: response || "I apologize, I could not generate a response.",
        conversationId: conversation.id,
      },
    });

    // Update conversation title if it's the first message
    if (conversation.messages.length === 0) {
      await prisma.conversation.update({
        where: { id: conversation.id },
        data: { title: message.substring(0, 100) },
      });
    }

    return NextResponse.json({
      message: assistantMessage,
      conversationId: conversation.id,
    });
  } catch (error) {
    console.error("Chat error:", error);
    return NextResponse.json({ error: "Failed to generate response" }, { status: 500 });
  }
}
