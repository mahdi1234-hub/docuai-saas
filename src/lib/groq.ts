import OpenAI from "openai";

export const groq = new OpenAI({
  apiKey: process.env.GROQ_API_KEY!,
  baseURL: "https://api.groq.com/openai/v1",
});

export const EMBEDDING_MODEL = "nomic-embed-text-v1.5";
export const CHAT_MODEL = "llama-3.3-70b-versatile";

export async function getEmbedding(text: string): Promise<number[]> {
  const response = await groq.embeddings.create({
    model: "nomic-embed-text-v1.5",
    input: text,
  });
  return response.data[0].embedding;
}

export async function chatCompletion(
  messages: { role: "system" | "user" | "assistant"; content: string }[]
) {
  const response = await groq.chat.completions.create({
    model: CHAT_MODEL,
    messages,
    temperature: 0.7,
    max_tokens: 2048,
  });
  return response.choices[0].message.content;
}
