# MedMitra - AI-Powered Medical Knowledge Assistant

<div align="center">

A sophisticated medical knowledge retrieval and Q&A system powered by RAG (Retrieval Augmented Generation) architecture.

[![Next.js](https://img.shields.io/badge/Next.js-13-black)](https://nextjs.org/)
[![OpenAI](https://img.shields.io/badge/OpenAI-GPT--4-blue)](https://openai.com/)
[![Pinecone](https://img.shields.io/badge/Pinecone-Vector%20DB-purple)](https://www.pinecone.io/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)

</div>

## 🌟 Features

- **Advanced RAG Architecture**: Combines vector search with real-time web retrieval
- **Medical Knowledge Processing**: Specialized text chunking and preprocessing for medical content
- **Hybrid Search**: Integrates database knowledge with fresh web content
- **Interactive UI**: Clean, responsive interface with real-time updates
- **Follow-up Questions**: AI-generated relevant follow-up suggestions
- **Source Attribution**: Transparent citation of all information sources
- **Medical Disclaimers**: Appropriate medical advice disclaimers

## 🏗️ System Architecture

### Core Components

1. **RAG Pipeline**

   - Custom text chunking optimized for medical content
   - Advanced embedding generation using OpenAI
   - Metadata preservation and management

2. **Vector Store**

   - Pinecone integration for efficient similarity search
   - Optimized batch processing
   - Metadata-enriched vector storage

3. **Search Service**

   - Hybrid search combining vector similarity and web results
   - Real-time content fetching and processing
   - Source ranking and relevance scoring

4. **Web Interface**
   - Real-time chat interface
   - Markdown rendering for formatted responses
   - Source attribution display
   - Follow-up question suggestions

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ or Bun
- OpenAI API key
- Pinecone API key
- Google Custom Search API key (optional, for web search)

### Installation

```bash
# Clone the repository
git clone https://github.com/siddnikh/medmitra-submission.git

# Install dependencies
bun install

# Set up environment variables
cp .env.example .env.local
```

Configure your `.env` file:

```env
OPENAI_API_KEY=your_openai_key
PINECONE_API_KEY=your_pinecone_key
PINECONE_INDEX_NAME=your_index_name
GOOGLE_SEARCH_API_KEY=your_google_key
GOOGLE_SEARCH_CX=your_search_cx
```

### Running the Application

```bash
# Development
bun dev

# Production build
bun build
bun start
```

## 🧠 Prompt Engineering

### System Prompts

1. **Medical Answer Generation**

```typescript:src/lib/search/index.ts
startLine: 108
endLine: 115
```

2. **Follow-up Questions Generation**

```typescript:src/lib/search/index.ts
startLine: 160
endLine: 165
```

### Prompt Design Principles

- Medical context preservation
- Source citation requirements
- Conflict acknowledgment
- Educational focus
- Disclaimer inclusion

## 📊 Data Processing

### PubMed Data Fetching

The project includes a script to fetch and process medical research papers from PubMed Central:

```bash
# Fetch and process papers from PubMed
bun run scripts/fetch-pubmed.ts
```

This script:

- Fetches recent medical research papers from PubMed Central
- Processes and ingests them into the vector store
- Adds metadata for source tracking and categorization

### Text Chunking Strategy

```typescript:src/lib/rag/pipeline.ts
startLine: 18
endLine: 22
```

### Medical Text Preprocessing

```typescript:src/lib/rag/pipeline.ts
startLine: 88
endLine: 98
```

## 🔍 Search Implementation

### Hybrid Search Approach

```typescript:src/lib/search/index.ts
startLine: 31
endLine: 90
```

## 🛠️ Technical Details

- **Vector Dimensions**: 3072 (OpenAI text-embedding-3-large)
- **Chunk Size**: 300 tokens with 100 token overlap
- **Batch Processing**: 100 vectors per upsert
- **Rate Limiting**: Implemented for API calls
- **Error Handling**: Graceful exit with fallbacks

## 📈 Performance Optimization

- Batch processing for vector operations
- Content size limits for API compliance
- Efficient metadata management
- Response caching capabilities

## 🔐 Security Considerations

- PHI (Protected Health Information) removal
- Medical record number redaction
- Secure API key management
- Input sanitization (not a lot but yes)

## ⚠️ Possible Improvements

- Make the API calls shorter/faster. This does not seem scalable
- Cache user queries, search results, and answers
- Better display of database sourced data
- Add a way to show images from relevant sources
- Add a way to show PDF documents
- Better on-the-fly embedding generation for web content

---

Will add the whimsical link for System Design here, shortly.
