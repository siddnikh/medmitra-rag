import { WebSearchService } from "../search/websearch";
import { DataIngestion } from "./index";
import type { DocumentMetadata, MedicalDocument } from "@/types/rag";

export class URLIngestion {
  private webService: WebSearchService;

  constructor(private ingestion: DataIngestion) {
    this.webService = new WebSearchService();
  }

  async ingestFromURL(
    url: string,
    metadata?: Partial<DocumentMetadata>
  ): Promise<boolean> {
    try {
      // Fetch content from URL
      let content = await this.webService.fetchContent(url);

      // Reduce MAX_CONTENT_SIZE to 1MB to account for Pinecone's 2MB limit
      // after processing and embedding
      const MAX_CONTENT_SIZE = 1 * 1024 * 1024;
      const contentSize = Buffer.byteLength(content, "utf8");
      console.log(`Content size from ${url}: ${contentSize} bytes`);

      if (contentSize > MAX_CONTENT_SIZE) {
        console.warn(`Content from ${url} exceeds 1MB limit, truncating...`);
        // Truncate to 50% of max size to leave room for processing overhead
        const truncatedContent = content.slice(0, MAX_CONTENT_SIZE * 0.5);
        content = truncatedContent.slice(
          0,
          truncatedContent.lastIndexOf(".") + 1
        );
        const newSize = Buffer.byteLength(content, "utf8");
        console.log(`Truncated content size: ${newSize} bytes`);
      }

      // Get basic metadata from URL
      const urlObj = new URL(url);
      const baseMetadata: DocumentMetadata = {
        title:
          metadata?.title || urlObj.pathname.split("/").pop() || "Untitled",
        source: metadata?.source || urlObj.hostname,
        url: url,
        category: metadata?.category || ["web-content"],
        publishDate: metadata?.publishDate || new Date().toISOString(),
      };

      // Create medical document
      const document: MedicalDocument = {
        content,
        metadata: {
          ...baseMetadata,
          ...metadata,
        },
      };

      // Ingest the document
      const result = await this.ingestion.ingestDocument(document);
      return result.success; // Return the actual success status
    } catch (error) {
      console.error(`Failed to ingest URL ${url}:`, error);
      return false;
    }
  }

  async ingestMultipleURLs(
    urls: Array<{ url: string; metadata?: Partial<DocumentMetadata> }>
  ) {
    const results = await Promise.allSettled(
      urls.map(({ url, metadata }) => this.ingestFromURL(url, metadata))
    );

    return results.map((result, index) => ({
      url: urls[index].url,
      success: result.status === "fulfilled" && result.value,
      error: result.status === "rejected" ? result.reason : undefined,
    }));
  }
}
