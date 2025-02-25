import { load } from "cheerio";

interface SearchResult {
  title: string;
  url: string;
  snippet: string;
  source: string;
  date?: string;
}

export class WebSearchService {
  constructor(private apiKey: string = process.env.GOOGLE_SEARCH_API_KEY!) {}

  async search(query: string): Promise<SearchResult[]> {
    const endpoint = "https://www.googleapis.com/customsearch/v1";
    const response = await fetch(
      `${endpoint}?key=${this.apiKey}&cx=${
        process.env.GOOGLE_SEARCH_CX
      }&q=${encodeURIComponent(query)}`
    );

    const data = await response.json();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return data.items.map((item: any) => ({
      title: item.title,
      url: item.link,
      snippet: item.snippet,
      source: new URL(item.link).hostname,
      date: item.pagemap?.metatags?.[0]?.["article:published_time"],
    }));
  }

  async fetchContent(url: string): Promise<string> {
    const response = await fetch(url);
    const html = await response.text();
    const $ = load(html);

    // Remove unnecessary elements
    $("script, style, nav, footer, header, aside").remove();

    // Get main content
    const content = $("article, main, .content, #content, .post")
      .first()
      .text()
      .trim();

    return content || $("body").text().trim();
  }
}
