/**
 * WASM Text Processor Service for Node.js
 * Handles WASM module initialization and provides text processing capabilities
 */

const fs = require('fs');
const path = require('path');

class WasmTextProcessorService {
  constructor() {
    this.wasmModule = null;
    this.processor = null;
    this.isInitialized = false;
    this.initializationPromise = null;
  }

  /**
   * Initialize the WASM module
   */
  async initialize() {
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

  async _initialize() {
    try {
      console.log('🦀 Initializing WASM Text Processor for Node.js...');

      // Load the WASM module
      const wasmPath = path.join(__dirname, '../wasm');
      const wasmFile = path.join(wasmPath, 'wasm_text_processor_bg.wasm');

      // Check if WASM files exist
      if (!fs.existsSync(wasmFile)) {
        throw new Error(
          `WASM file not found at ${wasmFile}. Run 'cd wasm-text-processor && ./build-all.sh' to build.`
        );
      }

      // Load the WASM module (Node.js target auto-initializes)
      this.wasmModule = require('../wasm/wasm_text_processor.js');
      
      // Create a processor instance
      this.processor = new this.wasmModule.TextProcessor();
      
      this.isInitialized = true;
      console.log('✅ WASM Text Processor initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize WASM module:', error);
      this.isInitialized = false;
      this.initializationPromise = null;
      throw error;
    }
  }

  /**
   * Check if WASM is initialized
   */
  isReady() {
    return this.isInitialized && this.processor !== null;
  }

  /**
   * Get the processor instance (throws if not initialized)
   */
  getProcessor() {
    if (!this.isReady()) {
      throw new Error('WASM module not initialized. Call initialize() first.');
    }
    return this.processor;
  }

  /**
   * Analyze text and return metrics
   */
  async analyzeText(text) {
    await this.initialize();
    return this.getProcessor().analyze_text(text);
  }

  /**
   * Process text with filtering and normalization
   */
  async processText(text, filterProfanity = true, normalizeWhitespace = true) {
    await this.initialize();
    return this.getProcessor().process_text(text, filterProfanity, normalizeWhitespace);
  }

  /**
   * Batch process multiple texts
   */
  async batchProcess(texts) {
    await this.initialize();
    return this.getProcessor().batch_process(texts);
  }

  /**
   * Run performance benchmark
   */
  async benchmark(text, iterations = 1000) {
    await this.initialize();
    return this.getProcessor().benchmark(text, iterations);
  }

  /**
   * Utility: Count words
   */
  async wordCount(text) {
    await this.initialize();
    return this.wasmModule.word_count(text);
  }

  /**
   * Utility: Count characters
   */
  async charCount(text) {
    await this.initialize();
    return this.wasmModule.char_count(text);
  }

  /**
   * Check if WASM is supported
   */
  async isWasmSupported() {
    try {
      await this.initialize();
      return this.wasmModule.is_wasm_supported();
    } catch {
      return false;
    }
  }

  /**
   * Get memory usage statistics
   */
  async getMemoryUsage() {
    await this.initialize();
    return this.wasmModule.get_memory_usage();
  }

  /**
   * Clean up resources
   */
  cleanup() {
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
const wasmTextProcessor = new WasmTextProcessorService();

module.exports = {
  wasmTextProcessor,
  WasmTextProcessorService,
};
