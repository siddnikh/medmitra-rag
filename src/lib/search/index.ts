import { OpenAIEmbeddings } from "@langchain/openai";
import { VectorStore } from "../vectorstore";
import { WebSearchService } from "./websearch";
import type { Answer } from "@/types";
import OpenAI from "openai";

function cosineSimilarity(a: number[], b: number[]): number {
  const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0);
  const normA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
  const normB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
  return dotProduct / (normA * normB);
}

interface SearchOptions {
  topK?: number;
  threshold?: number;
}

export class SearchService {
  private embeddings: OpenAIEmbeddings;
  private webSearch: WebSearchService;
  private openai: OpenAI;

  constructor(private vectorStore: VectorStore) {
    this.embeddings = new OpenAIEmbeddings({
      openAIApiKey: process.env.OPENAI_API_KEY,
      modelName: "text-embedding-3-large",
    });
    this.webSearch = new WebSearchService();
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async search(query: string, options: SearchOptions = {}): Promise<Answer> {
    try {
      // Perform web search
      const webResults = await this.webSearch.search(query);

      // Fetch content from top 3 results
      const webContents = await Promise.all(
        webResults.slice(0, 3).map(async (result) => {
          try {
            const content = await this.webSearch.fetchContent(result.url);
            return {
              ...result,
              content,
            };
          } catch (error) {
            console.error(`Failed to fetch content from ${result.url}:`, error);
            return null;
          }
        })
      );

      // Search existing knowledge base
      const dbResults = await this.vectorStore.search(
        await this.embeddings.embedQuery(query),
        options.topK
      );

      // Generate embeddings for web content
      const validWebContents = webContents.filter(Boolean);
      const webEmbeddings = await this.embeddings.embedDocuments(
        validWebContents.map((content) => content!.content)
      );

      // Calculate similarity scores for web content
      const queryEmbedding = await this.embeddings.embedQuery(query);
      const webScores = webEmbeddings.map((embedding) =>
        cosineSimilarity(queryEmbedding, embedding)
      );

      // Combine and rank all sources
      const allSources = [
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ...dbResults.map((r: any) => ({
          content: r.metadata.text,
          score: r.score,
          metadata: r.metadata,
          type: "database" as const,
        })),
        ...validWebContents.map((content, i) => ({
          content: content!.content,
          score: webScores[i],
          metadata: {
            title: content!.title,
            url: content!.url,
            source: content!.source,
            date: content!.date,
          },
          type: "web" as const,
        })),
      ].sort((a, b) => b.score - a.score);

      // Guard against empty results
      if (allSources.length === 0) {
        return this.generateDefaultAnswer(query);
      }

      // Create context from top sources
      const context = allSources
        .slice(0, 5)
        .map((source) => source.content)
        .join("\n\n");

      // Generate response using GPT
      const completion = await this.openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "You are a knowledgeable medical education assistant. " +
              "Synthesize information from multiple sources to provide comprehensive, " +
              "accurate answers. Format your response in markdown. " +
              "Be sure to cite sources inline using [Source: Title] format. " +
              "If sources conflict, acknowledge the differences and explain current understanding.",
          },
          {
            role: "user",
            content: `Context: ${context}\n\nQuestion: ${query}`,
          },
        ],
        temperature: 0.3,
      });

      // Format sources for display
      const sources = allSources.map((source) => ({
        title: source.metadata.title,
        author: source.metadata.author,
        link: source.metadata.url,
        type: source.type,
        date: source.metadata.date,
      }));

      return {
        text:
          completion.choices[0]?.message?.content || "No response generated",
        sources,
        followUpQuestions: await this.generateFollowUpQuestions(
          query,
          completion.choices[0]?.message?.content || "",
          context
        ),
        disclaimer:
          "This information is for educational purposes only and should not replace professional medical advice.",
      };
    } catch (error) {
      console.error("Search failed:", error);
      return this.generateDefaultAnswer(query);
    }
  }

  private async generateFollowUpQuestions(
    originalQuery: string,
    answer: string,
    context: string
  ): Promise<string[]> {
    const completion = await this.openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "Generate 3 relevant follow-up questions that would help deepen " +
            "understanding of the medical topic. Questions should be clear, " +
            "specific, and directly related to the original query and answer.",
        },
        {
          role: "user",
          content:
            `Original question: ${originalQuery}\n\n` +
            `Answer provided: ${answer}\n\n` +
            `Additional context: ${context}\n\n` +
            "Generate 3 follow-up questions:",
        },
      ],
      temperature: 0.7,
    });

    const questions =
      completion.choices[0]?.message?.content
        ?.split("\n")
        .filter((q) => q.trim())
        .slice(0, 3) || [];

    return questions;
  }

  private generateDefaultAnswer(query: string): Answer {
    console.log("Generating default answer for query:", query);
    return {
      text:
        "I apologize, but I don't have enough reliable information to provide " +
        "an accurate answer to your question. For medical inquiries, it's best " +
        "to consult with healthcare professionals or refer to peer-reviewed " +
        "medical literature.",
      sources: [],
      followUpQuestions: [
        "Could you rephrase your question?",
        "Would you like information about related medical topics?",
        "Should we explore more general aspects of this topic?",
      ],
      disclaimer:
        "This information is for educational purposes only and should not replace professional medical advice.",
    };
  }
}
