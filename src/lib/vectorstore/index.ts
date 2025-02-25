import { Pinecone } from "@pinecone-database/pinecone";
import { ProcessedDocument } from "../../types/rag";

export class VectorStore {
  private client!: Pinecone;
  private index!: ReturnType<Pinecone["index"]>;

  async initialize() {
    this.client = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY!,
    });

    this.index = this.client.index(process.env.PINECONE_INDEX_NAME!);
  }

  async store(document: ProcessedDocument) {
    const MAX_METADATA_TEXT_LENGTH = 1000; // Conservative limit to ensure we stay under 4MB

    const vectors = document.chunks.map((chunk, i) => ({
      id: `${document.metadata.title}-${i}`,
      values: document.embeddings[i],
      metadata: {
        ...document.metadata,
        text: chunk.pageContent.slice(0, MAX_METADATA_TEXT_LENGTH),
        isTextTruncated: chunk.pageContent.length > MAX_METADATA_TEXT_LENGTH,
      },
    }));

    // Split into smaller batches to avoid request size limits
    const BATCH_SIZE = 100;
    for (let i = 0; i < vectors.length; i += BATCH_SIZE) {
      const batch = vectors.slice(i, i + BATCH_SIZE);
      await this.index.upsert(batch);
    }
  }

  async search(query: number[], topK: number = 3) {
    const results = await this.index.query({
      vector: query,
      topK,
      includeMetadata: true,
    });

    return results.matches.map((match) => ({
      score: match.score,
      metadata: match.metadata,
    }));
  }
}
