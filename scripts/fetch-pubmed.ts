import axios from "axios";
import { URLIngestion } from "../src/lib/ingestion/url";
import { DataIngestion } from "../src/lib/ingestion";
import { RAGPipeline } from "../src/lib/rag/pipeline";
import { VectorStore } from "../src/lib/vectorstore";

async function fetchPubMedPapers() {
  console.log("🚀 Starting PubMed paper fetching process...");
  const baseUrl = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils";
  const searchTerm = "medical+research";
  console.log(`🔍 Using search term: "${searchTerm}"`);

  console.log("📡 Sending search request to PubMed API...");
  const searchResponse = await axios
    .get(
      `${baseUrl}/esearch.fcgi?db=pmc&retmax=20&term=${searchTerm}&retmode=json`
    )
    .catch((error) => {
      console.error("💥 Failed to fetch paper IDs:", error.message);
      throw error;
    });

  const ids = searchResponse.data.esearchresult.idlist;
  console.log(`📚 Retrieved ${ids.length} paper IDs from PubMed`);

  console.log("⚙️  Initializing RAG pipeline and vector store...");
  const pipeline = new RAGPipeline();
  const vectorStore = new VectorStore();
  await vectorStore.initialize();
  const ingestion = new DataIngestion(pipeline, vectorStore);
  const urlIngestion = new URLIngestion(ingestion);
  console.log("✨ Pipeline initialization complete");

  console.log("🔄 Beginning paper ingestion process...");
  let successCount = 0;
  let failureCount = 0;

  for (const id of ids) {
    const url = `https://www.ncbi.nlm.nih.gov/pmc/articles/PMC${id}`;
    console.log(`\n📄 Processing paper PMC${id}`);
    console.log(`🔗 URL: ${url}`);

    try {
      console.log("📥 Starting URL ingestion...");
      const success = await urlIngestion.ingestFromURL(url, {
        category: ["medical_research"],
        source: "PubMed Central",
      });
      if (success) {
        successCount++;
        console.log(`✅ Successfully ingested paper PMC${id}`);
      } else {
        failureCount++;
        console.log(`❌ Failed to ingest paper PMC${id}`);
      }
    } catch (error: unknown) {
      failureCount++;
      console.error(
        `❌ Failed to ingest paper PMC${id}:`,
        error instanceof Error ? error.message : String(error)
      );
      continue;
    }
  }

  console.log("\n🎉 Paper fetching process complete!");
  console.log(`📊 Summary:
  - Total papers processed: ${ids.length}
  - Successfully ingested: ${successCount} ✅
  - Failed to ingest: ${failureCount} ❌`);
}

console.log("🎬 Starting script execution...");
await fetchPubMedPapers().catch((error) => {
  console.error("💥 Script failed:", error.message);
  process.exit(1);
});
console.log("🏁 Script execution completed successfully");
