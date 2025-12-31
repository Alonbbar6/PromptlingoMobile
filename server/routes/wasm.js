/**
 * WASM API Routes
 * 
 * Provides endpoints for WASM-powered text processing
 */

const express = require('express');
const router = express.Router();
const { wasmTextProcessor } = require('../services/wasmTextProcessor');

/**
 * POST /api/wasm/analyze
 * Analyze text and return metrics
 */
router.post('/analyze', async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || typeof text !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Text is required and must be a string',
      });
    }

    const analysis = await wasmTextProcessor.analyzeText(text);

    res.json({
      success: true,
      data: analysis,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error analyzing text:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to analyze text',
      message: error.message,
    });
  }
});

/**
 * POST /api/wasm/process
 * Process text with filtering and normalization
 */
router.post('/process', async (req, res) => {
  try {
    const { text, filterProfanity = true, normalizeWhitespace = true } = req.body;

    if (!text || typeof text !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Text is required and must be a string',
      });
    }

    const result = await wasmTextProcessor.processText(
      text,
      filterProfanity,
      normalizeWhitespace
    );

    res.json({
      success: true,
      data: result,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error processing text:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process text',
      message: error.message,
    });
  }
});

/**
 * POST /api/wasm/batch
 * Batch process multiple texts
 */
router.post('/batch', async (req, res) => {
  try {
    const { texts } = req.body;

    if (!Array.isArray(texts) || texts.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Texts must be a non-empty array',
      });
    }

    if (!texts.every(t => typeof t === 'string')) {
      return res.status(400).json({
        success: false,
        error: 'All texts must be strings',
      });
    }

    const results = await wasmTextProcessor.batchProcess(texts);

    res.json({
      success: true,
      data: results,
      count: results.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error batch processing:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to batch process texts',
      message: error.message,
    });
  }
});

/**
 * POST /api/wasm/benchmark
 * Run performance benchmark
 */
router.post('/benchmark', async (req, res) => {
  try {
    const { text, iterations = 1000 } = req.body;

    if (!text || typeof text !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Text is required and must be a string',
      });
    }

    if (typeof iterations !== 'number' || iterations < 1 || iterations > 10000) {
      return res.status(400).json({
        success: false,
        error: 'Iterations must be a number between 1 and 10000',
      });
    }

    const result = await wasmTextProcessor.benchmark(text, iterations);

    res.json({
      success: true,
      data: result,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error running benchmark:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to run benchmark',
      message: error.message,
    });
  }
});

/**
 * GET /api/wasm/word-count
 * Count words in text
 */
router.post('/word-count', async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || typeof text !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Text is required and must be a string',
      });
    }

    const count = await wasmTextProcessor.wordCount(text);

    res.json({
      success: true,
      data: { word_count: count },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error counting words:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to count words',
      message: error.message,
    });
  }
});

/**
 * GET /api/wasm/status
 * Check WASM module status
 */
router.get('/status', async (req, res) => {
  try {
    const isSupported = await wasmTextProcessor.isWasmSupported();
    const isReady = wasmTextProcessor.isReady();

    let memoryUsage = null;
    if (isReady) {
      try {
        memoryUsage = await wasmTextProcessor.getMemoryUsage();
      } catch (err) {
        console.warn('Could not get memory usage:', err);
      }
    }

    res.json({
      success: true,
      data: {
        supported: isSupported,
        initialized: isReady,
        memory: memoryUsage,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error checking WASM status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to check WASM status',
      message: error.message,
    });
  }
});

module.exports = router;
