export interface Source {
  id: string;
  title: string;
  author?: string;
  link: string;
}

export interface Answer {
  text: string;
  sources: Source[];
  followUpQuestions: string[];
  disclaimer?: string;
}

export interface SearchResult {
  answer: Answer;
  isLoading: boolean;
  error?: string;
}
