import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  wasmTextService, 
  TextAnalysis, 
  ProcessingResult, 
  BenchmarkResult 
} from '../services/wasmService';

export interface WasmState {
  isInitialized: boolean;
  isLoading: boolean;
  isSupported: boolean;
  error: string | null;
  memoryUsage: any;
}

export interface WasmOperations {
  analyzeText: (text: string) => Promise<TextAnalysis>;
  processText: (text: string, options?: ProcessingOptions) => Promise<ProcessingResult>;
  batchProcess: (texts: string[]) => Promise<ProcessingResult[]>;
  benchmark: (text: string, iterations?: number) => Promise<BenchmarkResult>;
  getWordCount: (text: string) => Promise<number>;
  getCharCount: (text: string) => Promise<number>;
  reinitialize: () => Promise<void>;
  cleanup: () => void;
}

export interface ProcessingOptions {
  filterProfanity?: boolean;
  normalizeWhitespace?: boolean;
}

/**
 * React hook for WebAssembly text processing
 * Provides state management and operations for WASM integration
 */
export function useWasm() {
  const [state, setState] = useState<WasmState>({
    isInitialized: false,
    isLoading: false,
    isSupported: wasmTextService.isWasmSupported(),
    error: null,
    memoryUsage: null
  });

  const initializationRef = useRef<Promise<void> | null>(null);

  // Initialize WASM on mount
  useEffect(() => {
    if (!state.isSupported) {
      setState(prev => ({
        ...prev,
        error: 'WebAssembly is not supported in this browser'
      }));
      return;
    }

    initializeWasm();

    // Cleanup on unmount
    return () => {
      wasmTextService.cleanup();
    };
  }, [state.isSupported]);

  // Update memory usage periodically
  useEffect(() => {
    if (!state.isInitialized) return;

    const updateMemoryUsage = () => {
      const usage = wasmTextService.getMemoryUsage();
      setState(prev => ({ ...prev, memoryUsage: usage }));
    };

    updateMemoryUsage();
    const interval = setInterval(updateMemoryUsage, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, [state.isInitialized]);

  const initializeWasm = useCallback(async () => {
    if (initializationRef.current) {
      return initializationRef.current;
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      initializationRef.current = wasmTextService.initialize();
      await initializationRef.current;

      setState(prev => ({
        ...prev,
        isInitialized: true,
        isLoading: false,
        memoryUsage: wasmTextService.getMemoryUsage()
      }));

      console.log('✅ WASM hook initialized successfully');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown WASM initialization error';
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage
      }));
      console.error('❌ WASM hook initialization failed:', error);
    } finally {
      initializationRef.current = null;
    }
  }, []);

  // Wrapper function for error handling
  const withErrorHandling = useCallback(
    <T>(operation: () => Promise<T>, operationName: string): Promise<T> => {
      return operation().catch(error => {
        const errorMessage = `${operationName} failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
        setState(prev => ({ ...prev, error: errorMessage }));
        throw new Error(errorMessage);
      });
    },
    []
  );

  // Operations object
  const operations: WasmOperations = {
    analyzeText: useCallback(
      (text: string) => withErrorHandling(
        () => wasmTextService.analyzeText(text),
        'Text analysis'
      ),
      [withErrorHandling]
    ),

    processText: useCallback(
      (text: string, options?: ProcessingOptions) => withErrorHandling(
        () => wasmTextService.processText(text, options),
        'Text processing'
      ),
      [withErrorHandling]
    ),

    batchProcess: useCallback(
      (texts: string[]) => withErrorHandling(
        () => wasmTextService.batchProcess(texts),
        'Batch processing'
      ),
      [withErrorHandling]
    ),

    benchmark: useCallback(
      (text: string, iterations = 1000) => withErrorHandling(
        () => wasmTextService.benchmark(text, iterations),
        'Benchmark'
      ),
      [withErrorHandling]
    ),

    getWordCount: useCallback(
      (text: string) => withErrorHandling(
        () => wasmTextService.getWordCount(text),
        'Word count'
      ),
      [withErrorHandling]
    ),

    getCharCount: useCallback(
      (text: string) => withErrorHandling(
        () => wasmTextService.getCharCount(text),
        'Character count'
      ),
      [withErrorHandling]
    ),

    reinitialize: useCallback(async () => {
      wasmTextService.cleanup();
      setState(prev => ({
        ...prev,
        isInitialized: false,
        error: null,
        memoryUsage: null
      }));
      await initializeWasm();
    }, [initializeWasm]),

    cleanup: useCallback(() => {
      wasmTextService.cleanup();
      setState(prev => ({
        ...prev,
        isInitialized: false,
        memoryUsage: null
      }));
    }, [])
  };

  return {
    ...state,
    ...operations
  };
}

/**
 * Hook for simple text analysis with automatic fallback
 */
export function useTextAnalysis(text: string, autoAnalyze = true) {
  const { analyzeText, isInitialized, isLoading } = useWasm();
  const [analysis, setAnalysis] = useState<TextAnalysis | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const performAnalysis = useCallback(async (inputText: string) => {
    if (!inputText.trim()) {
      setAnalysis(null);
      return;
    }

    setAnalyzing(true);
    setError(null);

    try {
      const result = await analyzeText(inputText);
      setAnalysis(result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Analysis failed';
      setError(errorMessage);
      
      // Fallback to JavaScript implementation
      const fallbackAnalysis: TextAnalysis = {
        word_count: inputText.split(/\s+/).filter(w => w.length > 0).length,
        char_count: inputText.length,
        sentence_count: Math.max(1, (inputText.match(/[.!?]+/g) || []).length),
        language_confidence: 0,
        detected_language: 'unknown',
        profanity_score: 0,
        sentiment_score: 0,
        reading_time_minutes: inputText.split(/\s+/).length / 200
      };
      setAnalysis(fallbackAnalysis);
    } finally {
      setAnalyzing(false);
    }
  }, [analyzeText]);

  useEffect(() => {
    if (autoAnalyze && isInitialized && text) {
      performAnalysis(text);
    }
  }, [text, isInitialized, autoAnalyze, performAnalysis]);

  return {
    analysis,
    analyzing: analyzing || isLoading,
    error,
    performAnalysis
  };
}

/**
 * Hook for performance comparison between JavaScript and WASM
 */
export function usePerformanceComparison() {
  const { benchmark, isInitialized } = useWasm();
  const [results, setResults] = useState<{
    wasm?: BenchmarkResult;
    javascript?: BenchmarkResult;
    comparison?: {
      speedup: number;
      wasmFaster: boolean;
    };
  }>({});
  const [running, setRunning] = useState(false);

  const runComparison = useCallback(async (text: string, iterations = 1000) => {
    if (!isInitialized) {
      throw new Error('WASM not initialized');
    }

    setRunning(true);
    setResults({});

    try {
      // Run WASM benchmark
      console.log('🏃 Running WASM benchmark...');
      const wasmResult = await benchmark(text, iterations);

      // Run JavaScript benchmark
      console.log('🏃 Running JavaScript benchmark...');
      const jsStartTime = performance.now();
      
      for (let i = 0; i < iterations; i++) {
        // Simple JavaScript text analysis (equivalent to WASM version)
        const words = text.split(/\s+/).filter(w => w.length > 0);
        const chars = text.length;
        const sentences = Math.max(1, (text.match(/[.!?]+/g) || []).length);
        // Simulate some processing
        const _ = { words: words.length, chars, sentences };
      }
      
      const jsEndTime = performance.now();
      const jsTotalTime = jsEndTime - jsStartTime;
      const jsAvgTime = jsTotalTime / iterations;

      const javascriptResult: BenchmarkResult = {
        iterations,
        total_time_ms: jsTotalTime,
        average_time_ms: jsAvgTime,
        operations_per_second: 1000 / jsAvgTime
      };

      // Calculate comparison
      const speedup = jsAvgTime / wasmResult.average_time_ms;
      const comparison = {
        speedup: Math.abs(speedup),
        wasmFaster: speedup > 1
      };

      setResults({
        wasm: wasmResult,
        javascript: javascriptResult,
        comparison
      });

      console.log('📊 Performance comparison completed:', {
        'WASM avg (ms)': wasmResult.average_time_ms.toFixed(4),
        'JS avg (ms)': jsAvgTime.toFixed(4),
        'Speedup': `${speedup.toFixed(2)}x ${speedup > 1 ? '(WASM faster)' : '(JS faster)'}`
      });

    } catch (error) {
      console.error('❌ Performance comparison failed:', error);
      throw error;
    } finally {
      setRunning(false);
    }
  }, [benchmark, isInitialized]);

  return {
    results,
    running,
    runComparison
  };
}
