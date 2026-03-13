import { Pinecone } from "@pinecone-database/pinecone";

const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY!,
});

export const PINECONE_INDEX_NAME = "docuai-index";
export const PINECONE_NAMESPACE = "docuai-pdf-chunks";

export async function getPineconeIndex() {
  return pinecone.index(PINECONE_INDEX_NAME);
}

export default pinecone;
