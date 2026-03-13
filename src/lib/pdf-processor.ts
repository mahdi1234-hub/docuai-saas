import { getEmbedding } from "@/lib/groq";
import { getPineconeIndex, PINECONE_NAMESPACE } from "@/lib/pinecone";
import prisma from "@/lib/prisma";

export function splitTextIntoChunks(text: string, chunkSize = 1000, overlap = 200): string[] {
  const chunks: string[] = [];
  let start = 0;
  while (start < text.length) {
    const end = Math.min(start + chunkSize, text.length);
    chunks.push(text.slice(start, end));
    start += chunkSize - overlap;
  }
  return chunks;
}

export async function processAndEmbedPdf(
  documentId: string,
  pdfText: string,
  pageCount: number
) {
  const chunks = splitTextIntoChunks(pdfText);
  const index = await getPineconeIndex();

  const dbChunks = [];
  const vectors = [];

  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    const embedding = await getEmbedding(chunk);
    const vectorId = `${documentId}-chunk-${i}`;

    vectors.push({
      id: vectorId,
      values: embedding,
      metadata: {
        documentId,
        chunkIndex: i,
        pageNumber: Math.min(Math.floor((i * pageCount) / chunks.length) + 1, pageCount),
        content: chunk.substring(0, 1000),
      },
    });

    dbChunks.push({
      documentId,
      content: chunk,
      pageNumber: Math.min(Math.floor((i * pageCount) / chunks.length) + 1, pageCount),
      chunkIndex: i,
      vectorId,
    });
  }

  // Upsert vectors in batches of 100
  for (let i = 0; i < vectors.length; i += 100) {
    const batch = vectors.slice(i, i + 100);
    await index.namespace(PINECONE_NAMESPACE).upsert(batch);
  }

  // Save chunks to DB
  await prisma.documentChunk.createMany({ data: dbChunks });

  // Update document status
  await prisma.document.update({
    where: { id: documentId },
    data: { status: "ready", pageCount },
  });

  return { chunksProcessed: chunks.length };
}

export async function queryDocumentChunks(query: string, documentId?: string, topK = 5) {
  const queryEmbedding = await getEmbedding(query);
  const index = await getPineconeIndex();

  const filter = documentId ? { documentId } : undefined;

  const results = await index.namespace(PINECONE_NAMESPACE).query({
    vector: queryEmbedding,
    topK,
    includeMetadata: true,
    filter,
  });

  return results.matches?.map((match) => ({
    content: match.metadata?.content as string,
    score: match.score,
    documentId: match.metadata?.documentId as string,
    pageNumber: match.metadata?.pageNumber as number,
  })) || [];
}
