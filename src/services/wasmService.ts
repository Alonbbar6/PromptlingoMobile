/**
 * WASM Service - Currently Disabled
 * 
 * WebAssembly functionality is disabled and will be implemented in a future version.
 * All methods return immediately with no-op or fallback values.
 * 
 * This stub prevents 404 errors and MIME type issues while maintaining API compatibility.
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

class WasmTextService {
  private readonly WASM_DISABLED = true;

  /**
   * Initialize - Always returns immediately (WASM disabled)
   */
  async initialize(): Promise<void> {
    if (this.WASM_DISABLED) {
      console.log('ℹ️ WASM is disabled. Will be implemented in future version.');
      return;
    }
  }

  /**
   * Check if WebAssembly is supported - Always returns false (disabled)
   */
  isWasmSupported(): boolean {
    return false;
  }

  /**
   * Analyze text - Returns fallback JavaScript analysis
   */
  async analyzeText(text: string): Promise<TextAnalysis> {
    // Simple JavaScript fallback
    const words = text.split(/\s+/).filter(w => w.length > 0);
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    
    return {
      word_count: words.length,
      char_count: text.length,
      sentence_count: sentences.length,
      language_confidence: 0,
      detected_language: 'unknown',
      profanity_score: 0,
      sentiment_score: 0,
      reading_time_minutes: Math.ceil(words.length / 200)
    };
  }

  /**
   * Process text - Returns text unchanged
   */
  async processText(
    text: string,
    options: {
      filterProfanity?: boolean;
      normalizeWhitespace?: boolean;
    } = {}
  ): Promise<ProcessingResult> {
    const analysis = await this.analyzeText(text);
    
    return {
      original_text: text,
      processed_text: text,
      analysis,
      processing_time_ms: 0
    };
  }

  /**
   * Batch process - Returns texts unchanged
   */
  async batchProcess(texts: string[]): Promise<ProcessingResult[]> {
    return Promise.all(texts.map(text => this.processText(text)));
  }

  /**
   * Benchmark - Returns dummy results
   */
  async benchmark(text: string, iterations: number = 1000): Promise<BenchmarkResult> {
    return {
      iterations,
      total_time_ms: 0,
      average_time_ms: 0,
      operations_per_second: 0
    };
  }

  /**
   * Get memory usage - Returns null (not available)
   */
  getMemoryUsage(): any {
    return null;
  }

  /**
   * Get word count - JavaScript fallback
   */
  async getWordCount(text: string): Promise<number> {
    return text.split(/\s+/).filter(word => word.length > 0).length;
  }

  /**
   * Get character count - JavaScript fallback
   */
  async getCharCount(text: string): Promise<number> {
    return text.length;
  }

  /**
   * Cleanup - No-op (nothing to clean up)
   */
  cleanup(): void {
    // No-op
  }

  /**
   * Get status - Always returns disabled state
   */
  getStatus() {
    return {
      isInitialized: false,
      isLoading: false,
      isSupported: false,
      hasModule: false,
      hasProcessor: false
    };
  }
}

// Export singleton instance
export const wasmTextService = new WasmTextService();
