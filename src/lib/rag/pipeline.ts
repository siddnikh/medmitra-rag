import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { OpenAIEmbeddings } from "@langchain/openai";
import { DocumentMetadata } from "@/types/rag";
import { Document } from "langchain/document";

export interface ProcessedDocument {
  chunks: Document<DocumentMetadata>[];
  embeddings: number[][];
  metadata: DocumentMetadata;
}

export class RAGPipeline {
  private splitter: RecursiveCharacterTextSplitter;
  private embeddings: OpenAIEmbeddings;

  constructor() {
    // Optimized for medical text chunking
    this.splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 300, // Smaller chunks for precise medical context
      chunkOverlap: 100, // Larger overlap to maintain medical context
      separators: ["\n\n", "\n", ".", "!", "?", ";"], // Preserve medical sentence structure
    });

    this.embeddings = new OpenAIEmbeddings({
      openAIApiKey: process.env.OPENAI_API_KEY,
      modelName: "text-embedding-3-large",
    });
  }

  async processDocument(
    content: string,
    metadata: DocumentMetadata
  ): Promise<ProcessedDocument> {
    try {
      // Preprocess the content first
      const preprocessedContent = this.preprocessMedicalText(content);
      console.log(`Preprocessed content length: ${preprocessedContent.length}`);
      // Split preprocessed content into smaller chunks
      const chunks = await this.splitIntoChunks(preprocessedContent);

      // Limit the number of chunks to stay within Pinecone's limits
      // Assuming each embedding is roughly 1024 dimensions with float32 (4 bytes each)
      // Plus metadata overhead, we'll limit to 500 chunks to be safe
      const MAX_CHUNKS = 500;
      if (chunks.length > MAX_CHUNKS) {
        console.warn(
          `Truncating chunks from ${chunks.length} to ${MAX_CHUNKS}`
        );
        chunks.length = MAX_CHUNKS;
      }
      console.log("Starting embedding process for chunks");
      // Generate embeddings for each chunk
      const embeddings = await this.generateEmbeddings(chunks);

      return {
        chunks: chunks.map((chunk) => ({
          pageContent: chunk,
          metadata,
        })),
        embeddings,
        metadata,
      };
    } catch (error) {
      console.error("Pipeline processing error:", error);
      throw error;
    }
  }

  private async splitIntoChunks(content: string): Promise<string[]> {
    console.log("📄 Starting document chunking process...");
    console.log(`📏 Content length: ${content.length} characters`);

    const documents = await this.splitter.splitText(content);
    console.log(`✅ Chunking complete. Generated ${documents.length} chunks`);

    return documents;
  }

  private async generateEmbeddings(chunks: string[]): Promise<number[][]> {
    try {
      return await this.embeddings.embedDocuments(chunks);
    } catch (error) {
      console.error("Error generating embeddings:", error);
      throw error;
    }
  }

  private preprocessMedicalText(text: string): string {
    return (
      text
        // Standardize medical abbreviations
        .replace(/([A-Z]{2,})/g, (match) => `${match} `)
        // Remove PHI patterns (e.g., patient identifiers)
        .replace(/\b\d{3}-\d{2}-\d{4}\b/g, "[REDACTED]")
        .replace(/\b[A-Z]{2}\d{6}\b/g, "[REDACTED]") // Medical record numbers
        .trim()
    );
  }
}
