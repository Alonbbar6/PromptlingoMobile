/**
 * React Hook for WASM Text Processor
 * Provides easy access to WASM functionality in React components
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { wasmTextProcessor } from '../services/wasmTextProcessor';
import type {
  TextAnalysis,
  ProcessingResult,
  BenchmarkResult,
} from '../types/wasm';

interface UseWasmTextProcessorResult {
  // State
  isInitialized: boolean;
  isLoading: boolean;
  error: string | null;

  // Methods
  analyzeText: (text: string) => Promise<TextAnalysis | null>;
  processText: (
    text: string,
    filterProfanity?: boolean,
    normalizeWhitespace?: boolean
  ) => Promise<ProcessingResult | null>;
  batchProcess: (texts: string[]) => Promise<ProcessingResult[] | null>;
  benchmark: (text: string, iterations?: number) => Promise<BenchmarkResult | null>;
  wordCount: (text: string) => Promise<number | null>;
  charCount: (text: string) => Promise<number | null>;
  getMemoryUsage: () => Promise<{ buffer_size: number; pages: number } | null>;

  // Utilities
  initialize: () => Promise<void>;
  cleanup: () => void;
}

/**
 * Hook for using WASM Text Processor in React components
 * 
 * @param autoInitialize - Whether to automatically initialize WASM on mount (default: true)
 * @returns Object with WASM methods and state
 * 
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { analyzeText, isInitialized, error } = useWasmTextProcessor();
 * 
 *   const handleAnalyze = async () => {
 *     const analysis = await analyzeText("Hello world");
 *     console.log(analysis);
 *   };
 * 
 *   return <button onClick={handleAnalyze}>Analyze</button>;
 * }
 * ```
 */
export function useWasmTextProcessor(
  autoInitialize: boolean = true
): UseWasmTextProcessorResult {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const initAttempted = useRef(false);

  // Initialize WASM module
  const initialize = useCallback(async () => {
    if (isInitialized || isLoading) return;

    setIsLoading(true);
    setError(null);

    try {
      await wasmTextProcessor.initialize();
      setIsInitialized(true);
      console.log('✅ WASM initialized via hook');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      console.error('❌ WASM initialization failed:', errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [isInitialized, isLoading]);

  // Auto-initialize on mount if enabled
  useEffect(() => {
    if (autoInitialize && !initAttempted.current) {
      initAttempted.current = true;
      initialize();
    }
  }, [autoInitialize, initialize]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Note: We don't cleanup the singleton by default
      // as it might be used by other components
      // Call cleanup() manually if needed
    };
  }, []);

  // Wrapper function to handle errors consistently
  const withErrorHandling = useCallback(
    async <T,>(fn: () => Promise<T>): Promise<T | null> => {
      try {
        setError(null);
        return await fn();
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        setError(errorMessage);
        console.error('WASM operation failed:', errorMessage);
        return null;
      }
    },
    []
  );

  // Analyze text
  const analyzeText = useCallback(
    async (text: string): Promise<TextAnalysis | null> => {
      return withErrorHandling(() => wasmTextProcessor.analyzeText(text));
    },
    [withErrorHandling]
  );

  // Process text
  const processText = useCallback(
    async (
      text: string,
      filterProfanity: boolean = true,
      normalizeWhitespace: boolean = true
    ): Promise<ProcessingResult | null> => {
      return withErrorHandling(() =>
        wasmTextProcessor.processText(text, filterProfanity, normalizeWhitespace)
      );
    },
    [withErrorHandling]
  );

  // Batch process
  const batchProcess = useCallback(
    async (texts: string[]): Promise<ProcessingResult[] | null> => {
      return withErrorHandling(() => wasmTextProcessor.batchProcess(texts));
    },
    [withErrorHandling]
  );

  // Benchmark
  const benchmark = useCallback(
    async (text: string, iterations: number = 1000): Promise<BenchmarkResult | null> => {
      return withErrorHandling(() => wasmTextProcessor.benchmark(text, iterations));
    },
    [withErrorHandling]
  );

  // Word count
  const wordCount = useCallback(
    async (text: string): Promise<number | null> => {
      return withErrorHandling(() => wasmTextProcessor.wordCount(text));
    },
    [withErrorHandling]
  );

  // Char count
  const charCount = useCallback(
    async (text: string): Promise<number | null> => {
      return withErrorHandling(() => wasmTextProcessor.charCount(text));
    },
    [withErrorHandling]
  );

  // Get memory usage
  const getMemoryUsage = useCallback(
    async (): Promise<{ buffer_size: number; pages: number } | null> => {
      return withErrorHandling(() => wasmTextProcessor.getMemoryUsage());
    },
    [withErrorHandling]
  );

  // Cleanup
  const cleanup = useCallback(() => {
    wasmTextProcessor.cleanup();
    setIsInitialized(false);
  }, []);

  return {
    // State
    isInitialized,
    isLoading,
    error,

    // Methods
    analyzeText,
    processText,
    batchProcess,
    benchmark,
    wordCount,
    charCount,
    getMemoryUsage,

    // Utilities
    initialize,
    cleanup,
  };
}
