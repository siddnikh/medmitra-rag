import type { NextApiRequest, NextApiResponse } from "next";
import type { Answer } from "@/types";
import { SearchService } from "@/lib/search";
import { VectorStore } from "@/lib/vectorstore";

const vectorStore = new VectorStore();
let searchService: SearchService;

// Initialize services
const initializeServices = async () => {
  await vectorStore.initialize();
  searchService = new SearchService(vectorStore);
};

// Initialize on first load
const initPromise = initializeServices();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Answer | { error: string }>
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Ensure initialization is complete
    await initPromise;

    const { message } = req.body;

    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "Message is required" });
    }

    const answer = await searchService.search(message);
    res.status(200).json(answer);
  } catch (error) {
    console.error("Chat API error:", error);
    res.status(500).json({ error: "Failed to process chat request" });
  }
}
