import { MedicalDocument } from "@/types/rag";
import { RAGPipeline } from "../rag/pipeline";
import { VectorStore } from "../vectorstore";

export class DataIngestion {
  constructor(
    private pipeline: RAGPipeline,
    private vectorStore: VectorStore
  ) {}

  async initialize() {
    await this.vectorStore.initialize();
  }

  async ingestDocument(document: MedicalDocument) {
    try {
      const processed = await this.pipeline.processDocument(
        document.content,
        document.metadata
      );
      console.log("\nProcessed document sample chunks:");
      processed.chunks.slice(0, 3).forEach((chunk, i) => {
        console.log(`\nChunk ${i + 1}:`, chunk.pageContent);
      });
      console.log("\nSample embeddings (first 3):");
      processed.embeddings.slice(0, 3).forEach((embedding, i) => {
        console.log(`\nEmbedding ${i + 1} (truncated):`, embedding.slice(0, 5));
      });
      await this.vectorStore.store(processed);

      return {
        success: true,
        chunks: processed.chunks.length,
      };
    } catch (error) {
      console.error("Ingestion error:", error);
      throw new Error(`Failed to ingest document: ${document.metadata.title}`);
    }
  }

  async ingestBatch(documents: MedicalDocument[]) {
    const results = await Promise.allSettled(
      documents.map((doc) => this.ingestDocument(doc))
    );

    return results.map((result, index) => ({
      document: documents[index].metadata.title,
      status: result.status,
      ...(result.status === "fulfilled"
        ? result.value
        : { error: result.reason }),
    }));
  }
}
