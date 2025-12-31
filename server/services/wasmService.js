/**
 * Node.js WebAssembly Text Processing Service
 * Provides server-side WASM text processing capabilities
 */

const fs = require('fs');
const path = require('path');

class NodeWasmService {
  constructor() {
    this.wasmModule = null;
    this.textProcessor = null;
    this.isInitialized = false;
    this.wasmPath = path.join(__dirname, '../wasm/wasm_text_processor_bg.wasm');
  }

  /**
   * Initialize the WASM module in Node.js
   */
  async initialize() {
    if (this.isInitialized) return;

    try {
      console.log('🔄 Loading WASM module in Node.js...');

      // Check if WASM file exists
      if (!fs.existsSync(this.wasmPath)) {
        throw new Error(`WASM file not found at: ${this.wasmPath}`);
      }

      // Read the WASM binary
      const wasmBuffer = fs.readFileSync(this.wasmPath);
      
      // Create import object for WASM
      const importObject = {
        env: {
          memory: new WebAssembly.Memory({ initial: 256 }),
          table: new WebAssembly.Table({ initial: 0, element: 'anyfunc' }),
          __memory_base: 0,
          __table_base: 0,
          abort: () => {
            console.error('WASM abort called');
            throw new Error('WASM execution aborted');
          }
        },
        // Console logging support
        __wbindgen_placeholder__: {
          __wbindgen_describe: () => {},
          __wbindgen_throw: (ptr, len) => {
            const memory = new Uint8Array(this.wasmModule.exports.memory.buffer);
            const message = new TextDecoder().decode(memory.slice(ptr, ptr + len));
            throw new Error(message);
          }
        }
      };

      // Instantiate the WASM module
      const wasmModule = await WebAssembly.instantiate(wasmBuffer, importObject);
      this.wasmModule = wasmModule.instance;

      // Initialize the module
      if (this.wasmModule.exports.main) {
        this.wasmModule.exports.main();
      }

      this.isInitialized = true;
      console.log('✅ WASM module initialized in Node.js');

    } catch (error) {
      console.error('❌ Failed to initialize WASM in Node.js:', error);
      throw error;
    }
  }

  /**
   * Analyze text using WASM (simplified version for Node.js)
   */
  async analyzeText(text) {
    await this.initialize();

    if (!text || typeof text !== 'string') {
      throw new Error('Invalid text input');
    }

    try {
      // For Node.js, we'll implement a simplified version
      // since the full wasm-bindgen integration is more complex
      
      // Basic text analysis using JavaScript (fallback)
      const words = text.split(/\s+/).filter(word => word.length > 0);
      const sentences = Math.max(1, (text.match(/[.!?]+/g) || []).length);
      
      // Simple language detection
      const englishWords = ['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by'];
      const creoleWords = ['ak', 'nan', 'pou', 'yo', 'li', 'nou', 'mwen', 'ou'];
      const spanishWords = ['el', 'la', 'los', 'las', 'un', 'una', 'y', 'o', 'pero'];
      
      const textLower = text.toLowerCase();
      const englishMatches = englishWords.filter(word => textLower.includes(word)).length;
      const creoleMatches = creoleWords.filter(word => textLower.includes(word)).length;
      const spanishMatches = spanishWords.filter(word => textLower.includes(word)).length;
      
      const totalMatches = englishMatches + creoleMatches + spanishMatches;
      let detectedLanguage = 'unknown';
      let confidence = 0;
      
      if (totalMatches > 0) {
        if (englishMatches >= creoleMatches && englishMatches >= spanishMatches) {
          detectedLanguage = 'english';
          confidence = englishMatches / words.length;
        } else if (creoleMatches >= spanishMatches) {
          detectedLanguage = 'creole';
          confidence = creoleMatches / words.length;
        } else {
          detectedLanguage = 'spanish';
          confidence = spanishMatches / words.length;
        }
      }

      // Simple profanity detection
      const profanityPatterns = [/\b(damn|hell|crap)\b/gi, /\b\w*f\*+\w*\b/gi];
      let profanityMatches = 0;
      profanityPatterns.forEach(pattern => {
        profanityMatches += (text.match(pattern) || []).length;
      });

      // Simple sentiment analysis
      const positiveWords = ['good', 'great', 'excellent', 'amazing', 'wonderful', 'love', 'like', 'happy'];
      const negativeWords = ['bad', 'terrible', 'awful', 'horrible', 'hate', 'dislike', 'sad', 'angry'];
      
      const positiveCount = positiveWords.filter(word => textLower.includes(word)).length;
      const negativeCount = negativeWords.filter(word => textLower.includes(word)).length;
      const totalSentimentWords = positiveCount + negativeCount;
      
      let sentimentScore = 0;
      if (totalSentimentWords > 0) {
        sentimentScore = (positiveCount - negativeCount) / totalSentimentWords;
      }

      return {
        word_count: words.length,
        char_count: text.length,
        sentence_count: sentences,
        language_confidence: Math.min(confidence, 1.0),
        detected_language: detectedLanguage,
        profanity_score: Math.min(profanityMatches / words.length, 1.0),
        sentiment_score: sentimentScore,
        reading_time_minutes: words.length / 200,
        processing_time_ms: 0 // Placeholder for actual timing
      };

    } catch (error) {
      console.error('Text analysis failed:', error);
      throw new Error(`Text analysis failed: ${error.message}`);
    }
  }

  /**
   * Process text with filtering options
   */
  async processText(text, options = {}) {
    const startTime = Date.now();
    
    const {
      filterProfanity = false,
      normalizeWhitespace = true
    } = options;

    let processedText = text;

    try {
      // Normalize whitespace
      if (normalizeWhitespace) {
        processedText = processedText.replace(/\s+/g, ' ').trim();
      }

      // Filter profanity
      if (filterProfanity) {
        const profanityPatterns = [
          /\b(damn|hell|crap)\b/gi,
          /\b\w*f\*+\w*\b/gi,
          /\b\w*\*{2,}\w*\b/gi
        ];
        
        profanityPatterns.forEach(pattern => {
          processedText = processedText.replace(pattern, '[FILTERED]');
        });
      }

      // Analyze the processed text
      const analysis = await this.analyzeText(processedText);
      const processingTime = Date.now() - startTime;

      return {
        original_text: text,
        processed_text: processedText,
        analysis: {
          ...analysis,
          processing_time_ms: processingTime
        },
        processing_time_ms: processingTime
      };

    } catch (error) {
      console.error('Text processing failed:', error);
      throw new Error(`Text processing failed: ${error.message}`);
    }
  }

  /**
   * Batch process multiple texts
   */
  async batchProcess(texts, options = {}) {
    if (!Array.isArray(texts)) {
      throw new Error('Input must be an array of texts');
    }

    const startTime = Date.now();
    const results = [];

    try {
      for (const text of texts) {
        if (typeof text === 'string' && text.trim()) {
          const result = await this.processText(text, options);
          results.push(result);
        }
      }

      const totalTime = Date.now() - startTime;
      console.log(`📦 Batch processed ${results.length} texts in ${totalTime}ms`);

      return results;

    } catch (error) {
      console.error('Batch processing failed:', error);
      throw new Error(`Batch processing failed: ${error.message}`);
    }
  }

  /**
   * Performance benchmark
   */
  async benchmark(text, iterations = 1000) {
    await this.initialize();

    console.log(`🏃 Starting Node.js benchmark with ${iterations} iterations`);
    const startTime = Date.now();

    try {
      for (let i = 0; i < iterations; i++) {
        await this.analyzeText(text);
      }

      const totalTime = Date.now() - startTime;
      const avgTime = totalTime / iterations;

      const result = {
        iterations,
        total_time_ms: totalTime,
        average_time_ms: avgTime,
        operations_per_second: 1000 / avgTime
      };

      console.log(`📈 Node.js benchmark completed: ${totalTime}ms total, ${avgTime.toFixed(4)}ms avg`);
      return result;

    } catch (error) {
      console.error('Benchmark failed:', error);
      throw new Error(`Benchmark failed: ${error.message}`);
    }
  }

  /**
   * Get memory usage (Node.js specific)
   */
  getMemoryUsage() {
    const memUsage = process.memoryUsage();
    
    return {
      rss: memUsage.rss,
      heapTotal: memUsage.heapTotal,
      heapUsed: memUsage.heapUsed,
      external: memUsage.external,
      arrayBuffers: memUsage.arrayBuffers,
      wasm_initialized: this.isInitialized
    };
  }

  /**
   * Utility functions
   */
  getWordCount(text) {
    return text.split(/\s+/).filter(word => word.length > 0).length;
  }

  getCharCount(text) {
    return text.length;
  }

  /**
   * Health check
   */
  async healthCheck() {
    try {
      await this.initialize();
      
      // Test with sample text
      const testText = "Hello world! This is a test.";
      const result = await this.analyzeText(testText);
      
      return {
        status: 'healthy',
        initialized: this.isInitialized,
        test_result: result,
        memory_usage: this.getMemoryUsage()
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message,
        initialized: this.isInitialized
      };
    }
  }

  /**
   * Cleanup resources
   */
  cleanup() {
    this.wasmModule = null;
    this.textProcessor = null;
    this.isInitialized = false;
    console.log('🧹 WASM service cleaned up');
  }
}

// Export singleton instance
module.exports = new NodeWasmService();
