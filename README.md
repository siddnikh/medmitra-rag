# MedMitra - AI-Powered Medical Knowledge Assistant

<div align="center">

A sophisticated medical knowledge retrieval and Q&A system powered by RAG (Retrieval Augmented Generation) architecture.

[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![OpenAI](https://img.shields.io/badge/OpenAI-GPT--4o--mini-blue)](https://openai.com/)
[![Pinecone](https://img.shields.io/badge/Pinecone-Vector%20DB-purple)](https://www.pinecone.io/)
[![LangChain](https://img.shields.io/badge/LangChain-0.3-green)](https://www.langchain.com/)

</div>

## 🌟 Features

- **Advanced RAG Architecture**: Combines vector search with real-time web retrieval
- **Medical Knowledge Processing**: Specialized text chunking and preprocessing for medical content
- **Hybrid Search**: Integrates database knowledge with fresh web content
- **Interactive UI**: Clean, responsive interface with real-time updates
- **Follow-up Questions**: AI-generated relevant follow-up suggestions
- **Source Attribution**: Transparent citation of all information sources
- **Medical Disclaimers**: Appropriate medical advice disclaimers

## 🛠️ Technology Stack

### Frontend

- **Next.js 15.1.7** - React framework with App Router and API routes
- **React 19** - UI library with latest features
- **TypeScript 5** - Type-safe development
- **Tailwind CSS 3.4** - Utility-first CSS framework
- **@tailwindcss/typography** - Typography plugin for markdown content
- **react-markdown 10.0** - Markdown rendering for AI responses
- **lucide-react 0.344** - Icon library

### Backend & AI/ML

- **Next.js API Routes** - Serverless API endpoints
- **OpenAI SDK 4.85** - GPT-4o-mini for chat completions
- **LangChain 0.3.19** - LLM orchestration framework
- **@langchain/openai 0.4.4** - OpenAI integrations for LangChain
- **text-embedding-3-large** - 3072-dimensional embeddings model

### Vector Database

- **Pinecone 5.0.2** - Managed vector database for similarity search
- **Batch Processing** - Optimized upsert operations (100 vectors per batch)

### Web Scraping & Search

- **Google Custom Search API** - Web search integration
- **Cheerio 1.0** - Server-side HTML parsing and content extraction
- **Puppeteer 24.3** - Headless browser automation
- **Axios 1.7.9** - HTTP client for API requests

### Development Tools

- **Bun** - Fast JavaScript runtime and package manager
- **ESLint 9** - Code linting with Next.js config
- **TypeScript ESLint 8.3** - TypeScript-specific linting rules
- **PostCSS 8** - CSS processing
- **Autoprefixer 10.4** - CSS vendor prefixing

## 🏗️ System Architecture

### Core Components

1. **RAG Pipeline** (`src/lib/rag/pipeline.ts`)

   - RecursiveCharacterTextSplitter with medical-optimized chunking (300 tokens, 100 token overlap)
   - OpenAI embeddings generation using text-embedding-3-large model
   - Medical text preprocessing with PHI redaction
   - Metadata preservation and document management

2. **Vector Store** (`src/lib/vectorstore/index.ts`)

   - Pinecone client integration
   - Batch upsert operations (100 vectors per batch)
   - Metadata-enriched vector storage with text truncation (1000 char limit)
   - Cosine similarity search with configurable topK

3. **Search Service** (`src/lib/search/index.ts`)

   - Hybrid search combining vector similarity and web results
   - Real-time web content fetching and processing
   - Cosine similarity scoring for relevance ranking
   - Context synthesis from top 5 sources

4. **Web Search Service** (`src/lib/search/websearch.ts`)

   - Google Custom Search API integration
   - Cheerio-based content extraction
   - HTML sanitization (removes scripts, styles, nav, footer)
   - Main content extraction from article/main/content elements

5. **API Layer** (`src/pages/api/chat.ts`)

   - Next.js API route handler
   - Request validation and error handling
   - Service initialization and singleton pattern

6. **Frontend Components**
   - Chat interface with real-time updates
   - Markdown rendering for formatted responses
   - Source attribution display
   - Follow-up question suggestions

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ or Bun runtime
- OpenAI API key
- Pinecone API key and index
- Google Custom Search API key and Custom Search Engine ID (optional, for web search)

### Installation

```bash
# Clone the repository
git clone https://github.com/siddnikh/medmitra-submission.git

# Install dependencies
bun install

# Set up environment variables
cp .env.example .env.local
```

Configure your `.env.local` file:

```env
OPENAI_API_KEY=your_openai_key
PINECONE_API_KEY=your_pinecone_key
PINECONE_INDEX_NAME=your_index_name
GOOGLE_SEARCH_API_KEY=your_google_key
GOOGLE_SEARCH_CX=your_search_cx
```

### Running the Application

```bash
# Development server
bun dev

# Production build
bun build
bun start
```

### Data Ingestion

```bash
# Fetch and process papers from PubMed Central
bun run scripts/fetch-pubmed.ts

# Ingest processed papers into vector store
bun run scripts/ingest-papers.ts
```

## 🧠 AI Model Configuration

### Embeddings

- **Model**: `text-embedding-3-large`
- **Dimensions**: 3072
- **Provider**: OpenAI via LangChain

### Chat Completions

- **Model**: `gpt-4o-mini`
- **Temperature**: 0.3 (answer generation), 0.7 (follow-up questions)
- **System Prompt**: Medical education assistant with source citation requirements

### Prompt Engineering

The system uses specialized prompts for:

- Medical answer generation with source citations
- Follow-up question generation based on context
- Conflict acknowledgment when sources disagree
- Educational focus with appropriate disclaimers

## 📊 Data Processing Pipeline

### Text Chunking Strategy

- **Chunk Size**: 300 tokens
- **Overlap**: 100 tokens
- **Separators**: `["\n\n", "\n", ".", "!", "?", ";"]`
- **Max Chunks**: 500 per document (Pinecone limit)

### Medical Text Preprocessing

- Standardizes medical abbreviations
- Removes PHI patterns (SSN, medical record numbers)
- Preserves medical sentence structure

### Vector Storage

- **Batch Size**: 100 vectors per upsert
- **Metadata Limit**: 1000 characters per chunk
- **Vector Dimensions**: 3072 (float32)

## 🔍 Search Implementation

### Hybrid Search Algorithm

1. **Web Search**: Fetches top 3 results from Google Custom Search
2. **Content Extraction**: Uses Cheerio to extract main content from URLs
3. **Vector Search**: Queries Pinecone with query embedding
4. **Embedding Generation**: Generates embeddings for web content on-the-fly
5. **Similarity Scoring**: Calculates cosine similarity for all sources
6. **Ranking**: Combines and sorts all sources by relevance score
7. **Context Synthesis**: Selects top 5 sources for answer generation

### Search Parameters

- **TopK**: Configurable (default: 3 for vector search)
- **Content Truncation**: 8000 characters for embedding generation
- **Source Limit**: Top 5 sources used for context

## 🛠️ Technical Specifications

### Performance Optimizations

- Batch processing for vector operations (100 vectors per batch)
- Content size limits for API compliance (8000 chars for embeddings)
- Efficient metadata management with truncation
- Lazy initialization of services

### Error Handling

- Graceful fallbacks for failed web content fetches
- Default answer generation when no sources found
- Input validation and sanitization
- Comprehensive error logging

### Security Features

- PHI (Protected Health Information) removal in preprocessing
- Medical record number redaction
- Secure API key management via environment variables
- Input validation on API routes

---

[View System Design on Whimsical 🚀](https://whimsical.com/medmitra-assessment-tmeKytM9a9vsijeT6Qe8j)
