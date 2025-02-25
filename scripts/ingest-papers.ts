import { DataIngestion } from "../src/lib/ingestion";
import { RAGPipeline } from "../src/lib/rag/pipeline";
import { VectorStore } from "../src/lib/vectorstore";
import { MedicalDocument } from "../src/types/rag";
import fs from "fs/promises";
import path from "path";

async function ingestPapers() {
  // Initialize components
  const pipeline = new RAGPipeline();
  const vectorStore = new VectorStore();
  const ingestion = new DataIngestion(pipeline, vectorStore);

  // Initialize vector store
  await ingestion.initialize();

  // Example structure for papers directory
  const papersDir = path.join(process.cwd(), "papers");

  try {
    const files = await fs.readdir(papersDir);
    const papers: MedicalDocument[] = [];

    for (const file of files) {
      if (file.endsWith(".txt") || file.endsWith(".pdf")) {
        const content = await fs.readFile(path.join(papersDir, file), "utf-8");

        papers.push({
          content,
          metadata: {
            title: file.replace(/\.[^/.]+$/, ""),
            source: "research_paper",
            category: ["medical_research"],
            publishDate: new Date().toISOString(), // You should extract this from the paper
          },
        });
      }
    }

    // Batch ingest papers
    const results = await ingestion.ingestBatch(papers);
    console.log(`Ingested ${results.length} papers`);

    // Log results
    results.forEach((result) => {
      console.log(`${result.document}: ${result.status}`);
    });
  } catch (error) {
    console.error("Error ingesting papers:", error);
  }
}

ingestPapers();
