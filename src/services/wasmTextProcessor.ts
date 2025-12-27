/**
 * WASM Text Processor Service
 * Handles initialization and interaction with the Rust WASM module
 */

import type {
  TextAnalysis,
  ProcessingResult,
  BenchmarkResult,
} from '../types/wasm';

// Dynamic import type for the WASM module
type WasmModule = {
  TextProcessor: new () => TextProcessor;
  word_count: (text: string) => number;
  char_count: (text: string) => number;
  is_wasm_supported: () => boolean;
  get_memory_usage: () => { buffer_size: number; pages: number };
  main: () => void;
};

type TextProcessor = {
  free: () => void;
  analyze_text: (text: string) => TextAnalysis;
  process_text: (
    text: string,
    filter_profanity: boolean,
    normalize_whitespace: boolean
  ) => ProcessingResult;
  batch_process: (texts: string[]) => ProcessingResult[];
  benchmark: (text: string, iterations: number) => BenchmarkResult;
};

class WasmTextProcessorService {
  private wasmModule: WasmModule | null = null;
  private processor: TextProcessor | null = null;
  private isInitialized = false;
  private initializationPromise: Promise<void> | null = null;

  /**
   * Initialize the WASM module
   */
  async initialize(): Promise<void> {
    // Return existing promise if initialization is in progress
    if (this.initializationPromise) {
      return this.initializationPromise;
    }

    // Return immediately if already initialized
    if (this.isInitialized) {
      return Promise.resolve();
    }

    this.initializationPromise = this._initialize();
    return this.initializationPromise;
  }

  private async _initialize(): Promise<void> {
    try {
      console.log('🦀 Initializing WASM Text Processor...');

      // Load WASM module from public folder at runtime
      const wasmPath = `${process.env.PUBLIC_URL || ''}/wasm/wasm_text_processor.js`;
      
      // Create a script element to load the WASM module
      const script = document.createElement('script');
      script.src = wasmPath;
      script.type = 'module';
      
      await new Promise<void>((resolve, reject) => {
        script.onload = () => resolve();
        script.onerror = () => reject(new Error('Failed to load WASM script'));
        document.head.appendChild(script);
      });

      // Access the global wasm_bindgen object
      // @ts-ignore
      const wasmInit = window.wasm_bindgen;
      
      if (!wasmInit) {
        throw new Error('WASM module not loaded properly');
      }

      // Initialize the WASM module
      await wasmInit(`${process.env.PUBLIC_URL || ''}/wasm/wasm_text_processor_bg.wasm`);
      
      this.wasmModule = wasmInit as unknown as WasmModule;
      
      // Create a processor instance
      this.processor = new this.wasmModule.TextProcessor();
      
      this.isInitialized = true;
      console.log('✅ WASM Text Processor initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize WASM module:', error);
      this.isInitialized = false;
      this.initializationPromise = null;
      throw new Error(`WASM initialization failed: ${error}`);
    }
  }

  /**
   * Check if WASM is initialized
   */
  isReady(): boolean {
    return this.isInitialized && this.processor !== null;
  }

  /**
   * Get the processor instance (throws if not initialized)
   */
  private getProcessor(): TextProcessor {
    if (!this.isReady() || !this.processor) {
      throw new Error('WASM module not initialized. Call initialize() first.');
    }
    return this.processor;
  }

  /**
   * Analyze text and return metrics
   */
  async analyzeText(text: string): Promise<TextAnalysis> {
    await this.initialize();
    return this.getProcessor().analyze_text(text);
  }

  /**
   * Process text with filtering and normalization
   */
  async processText(
    text: string,
    filterProfanity: boolean = true,
    normalizeWhitespace: boolean = true
  ): Promise<ProcessingResult> {
    await this.initialize();
    return this.getProcessor().process_text(
      text,
      filterProfanity,
      normalizeWhitespace
    );
  }

  /**
   * Batch process multiple texts
   */
  async batchProcess(texts: string[]): Promise<ProcessingResult[]> {
    await this.initialize();
    return this.getProcessor().batch_process(texts);
  }

  /**
   * Run performance benchmark
   */
  async benchmark(text: string, iterations: number = 1000): Promise<BenchmarkResult> {
    await this.initialize();
    return this.getProcessor().benchmark(text, iterations);
  }

  /**
   * Utility: Count words
   */
  async wordCount(text: string): Promise<number> {
    await this.initialize();
    if (!this.wasmModule) throw new Error('WASM module not initialized');
    return this.wasmModule.word_count(text);
  }

  /**
   * Utility: Count characters
   */
  async charCount(text: string): Promise<number> {
    await this.initialize();
    if (!this.wasmModule) throw new Error('WASM module not initialized');
    return this.wasmModule.char_count(text);
  }

  /**
   * Check if WASM is supported
   */
  async isWasmSupported(): Promise<boolean> {
    try {
      await this.initialize();
      if (!this.wasmModule) return false;
      return this.wasmModule.is_wasm_supported();
    } catch {
      return false;
    }
  }

  /**
   * Get memory usage statistics
   */
  async getMemoryUsage(): Promise<{ buffer_size: number; pages: number }> {
    await this.initialize();
    if (!this.wasmModule) throw new Error('WASM module not initialized');
    return this.wasmModule.get_memory_usage();
  }

  /**
   * Clean up resources
   */
  cleanup(): void {
    if (this.processor) {
      this.processor.free();
      this.processor = null;
    }
    this.isInitialized = false;
    this.initializationPromise = null;
    console.log('🧹 WASM Text Processor cleaned up');
  }
}

// Export singleton instance
export const wasmTextProcessor = new WasmTextProcessorService();

// Export class for testing or multiple instances
export { WasmTextProcessorService };
