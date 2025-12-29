/* tslint:disable */
/* eslint-disable */
/**
 * WASM Text Processor - TypeScript Definitions
 * Auto-generated type definitions for Rust WASM module
 */

export interface TextAnalysis {
  word_count: number;
  char_count: number;
  sentence_count: number;
  language_confidence: number;
  detected_language: string;
  profanity_score: number;
  sentiment_score: number;
  reading_time_minutes: number;
}

export interface ProcessingResult {
  original_text: string;
  processed_text: string;
  analysis: TextAnalysis;
  processing_time_ms: number;
}

export interface BenchmarkResult {
  iterations: number;
  total_time_ms: number;
  average_time_ms: number;
  operations_per_second: number;
}

/**
 * Main text processor class
 */
export class TextProcessor {
  free(): void;
  constructor();
  
  /**
   * Analyze text and return metrics
   * @param text - Text to analyze
   */
  analyze_text(text: string): TextAnalysis;
  
  /**
   * Process text with filtering and normalization
   * @param text - Text to process
   * @param filter_profanity - Whether to filter profanity
   * @param normalize_whitespace - Whether to normalize whitespace
   */
  process_text(
    text: string,
    filter_profanity: boolean,
    normalize_whitespace: boolean
  ): ProcessingResult;
  
  /**
   * Batch process multiple texts
   * @param texts - Array of texts to process
   */
  batch_process(texts: string[]): ProcessingResult[];
  
  /**
   * Run performance benchmark
   * @param text - Text to use for benchmark
   * @param iterations - Number of iterations
   */
  benchmark(text: string, iterations: number): BenchmarkResult;
}

/**
 * Utility functions
 */
export function word_count(text: string): number;
export function char_count(text: string): number;
export function is_wasm_supported(): boolean;
export function get_memory_usage(): { buffer_size: number; pages: number };
export function main(): void;

/**
 * Initialize the WASM module
 */
export default function init(input?: string | URL | Request | Response | BufferSource | WebAssembly.Module): Promise<void>;
