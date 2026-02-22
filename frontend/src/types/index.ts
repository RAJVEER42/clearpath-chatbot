export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  metadata?: Metadata;
  sources?: Source[];
  evaluator_flags?: string[];
  is_loading?: boolean;
}

export interface TokenUsage {
  input: number;
  output: number;
}

export interface Metadata {
  model_used: string;
  classification: "simple" | "complex";
  tokens: TokenUsage;
  latency_ms: number;
  chunks_retrieved: number;
  evaluator_flags: string[];
}

export interface Source {
  document: string;
  page?: number;
  relevance_score?: number;
}

export interface QueryRequest {
  question: string;
  conversation_id?: string;
}

export interface QueryResponse {
  answer: string;
  metadata: Metadata;
  sources: Source[];
  conversation_id: string;
}
