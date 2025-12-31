/**
 * WASM Text Processor - Node.js Wrapper
 * Provides a clean interface for using WASM in Node.js
 */

const wasm = require('./wasm_text_processor.js');
const fs = require('fs');
const path = require('path');

let wasmModule = null;
let isInitialized = false;

/**
 * Initialize the WASM module
 */
async function initialize() {
  if (isInitialized) {
    return wasmModule;
  }

  try {
    const wasmPath = path.join(__dirname, 'wasm_text_processor_bg.wasm');
    const wasmBuffer = fs.readFileSync(wasmPath);
    wasmModule = await wasm(wasmBuffer);
    isInitialized = true;
    console.log('🦀 WASM Text Processor initialized for Node.js');
    return wasmModule;
  } catch (error) {
    console.error('Failed to initialize WASM module:', error);
    throw error;
  }
}

/**
 * Get the initialized WASM module
 */
function getModule() {
  if (!isInitialized) {
    throw new Error('WASM module not initialized. Call initialize() first.');
  }
  return wasmModule;
}

/**
 * Create a new TextProcessor instance
 */
async function createTextProcessor() {
  await initialize();
  const module = getModule();
  return new module.TextProcessor();
}

/**
 * Utility function: Count words
 */
async function wordCount(text) {
  await initialize();
  return getModule().word_count(text);
}

/**
 * Utility function: Count characters
 */
async function charCount(text) {
  await initialize();
  return getModule().char_count(text);
}

/**
 * Check if WASM is supported
 */
async function isWasmSupported() {
  try {
    await initialize();
    return getModule().is_wasm_supported();
  } catch {
    return false;
  }
}

/**
 * Get memory usage statistics
 */
async function getMemoryUsage() {
  await initialize();
  return getModule().get_memory_usage();
}

module.exports = {
  initialize,
  getModule,
  createTextProcessor,
  wordCount,
  charCount,
  isWasmSupported,
  getMemoryUsage,
  TextProcessor: null, // Will be set after initialization
};

// Auto-initialize on first require (optional)
// Uncomment if you want automatic initialization
// initialize().catch(console.error);
