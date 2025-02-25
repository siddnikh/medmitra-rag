export interface DocumentMetadata {
  title: string;
  author?: string;
  source: string;
  publishDate?: string;
  category: string[];
  url?: string;
}

export interface ProcessedDocument {
  chunks: Document<DocumentMetadata>[];
  embeddings: number[][];
  metadata: DocumentMetadata;
}

export interface MedicalDocument {
  content: string;
  metadata: DocumentMetadata;
}
