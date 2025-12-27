import React, { useState, useCallback } from 'react';
import { useWasm, useTextAnalysis, usePerformanceComparison } from '../hooks/useWasm';
import { ProcessingResult } from '../services/wasmService';
import { AlertCircle, CheckCircle, Loader2, Zap, BarChart3, FileText, Filter } from 'lucide-react';

interface WasmTextProcessorProps {
  className?: string;
}

export const WasmTextProcessor: React.FC<WasmTextProcessorProps> = ({ className = '' }) => {
  const {
    isInitialized,
    isLoading,
    isSupported,
    error,
    memoryUsage,
    processText,
    batchProcess,
    reinitialize
  } = useWasm();

  const [inputText, setInputText] = useState('Hello world! This is a sample text for processing. It contains some words that might need filtering.');
  const [processingOptions, setProcessingOptions] = useState({
    filterProfanity: true,
    normalizeWhitespace: true
  });
  const [processingResult, setProcessingResult] = useState<ProcessingResult | null>(null);
  const [processing, setProcessing] = useState(false);

  const { analysis, analyzing } = useTextAnalysis(inputText);
  const { results: perfResults, running: perfRunning, runComparison } = usePerformanceComparison();

  const handleProcessText = useCallback(async () => {
    if (!inputText.trim()) return;

    setProcessing(true);
    try {
      const result = await processText(inputText, processingOptions);
      setProcessingResult(result);
    } catch (err) {
      console.error('Processing failed:', err);
    } finally {
      setProcessing(false);
    }
  }, [inputText, processingOptions, processText]);

  const handleBenchmark = useCallback(async () => {
    if (!inputText.trim()) return;
    
    try {
      await runComparison(inputText, 1000);
    } catch (err) {
      console.error('Benchmark failed:', err);
    }
  }, [inputText, runComparison]);

  if (!isSupported) {
    return (
      <div className={`p-6 bg-red-50 border border-red-200 rounded-lg ${className}`}>
        <div className="flex items-center gap-2 text-red-700">
          <AlertCircle className="w-5 h-5" />
          <span className="font-medium">WebAssembly Not Supported</span>
        </div>
        <p className="mt-2 text-red-600">
          Your browser doesn't support WebAssembly. Please use a modern browser to access WASM features.
        </p>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Status Header */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
            ) : isInitialized ? (
              <CheckCircle className="w-5 h-5 text-green-500" />
            ) : (
              <AlertCircle className="w-5 h-5 text-yellow-500" />
            )}
            <span className="font-medium">
              WASM Status: {isLoading ? 'Loading...' : isInitialized ? 'Ready' : 'Not Initialized'}
            </span>
          </div>
          
          {error && (
            <button
              onClick={reinitialize}
              className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Retry
            </button>
          )}
        </div>

        {error && (
          <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
            {error}
          </div>
        )}

        {memoryUsage && (
          <div className="mt-2 text-sm text-gray-600">
            Memory: {Math.round(memoryUsage.buffer_size / 1024)} KB ({memoryUsage.pages} pages)
          </div>
        )}
      </div>

      {/* Input Section */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-3">
          <FileText className="w-5 h-5 text-gray-600" />
          <h3 className="font-medium">Text Input</h3>
        </div>
        
        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Enter text to process..."
          className="w-full h-32 p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />

        <div className="flex items-center gap-4 mt-3">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={processingOptions.filterProfanity}
              onChange={(e) => setProcessingOptions(prev => ({
                ...prev,
                filterProfanity: e.target.checked
              }))}
              className="rounded"
            />
            <span className="text-sm">Filter Profanity</span>
          </label>
          
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={processingOptions.normalizeWhitespace}
              onChange={(e) => setProcessingOptions(prev => ({
                ...prev,
                normalizeWhitespace: e.target.checked
              }))}
              className="rounded"
            />
            <span className="text-sm">Normalize Whitespace</span>
          </label>
        </div>

        <div className="flex gap-2 mt-4">
          <button
            onClick={handleProcessText}
            disabled={!isInitialized || processing || !inputText.trim()}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {processing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Filter className="w-4 h-4" />}
            Process Text
          </button>
          
          <button
            onClick={handleBenchmark}
            disabled={!isInitialized || perfRunning || !inputText.trim()}
            className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {perfRunning ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
            Benchmark
          </button>
        </div>
      </div>

      {/* Analysis Results */}
      {analysis && (
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <BarChart3 className="w-5 h-5 text-gray-600" />
            <h3 className="font-medium">Text Analysis</h3>
            {analyzing && <Loader2 className="w-4 h-4 animate-spin text-blue-500" />}
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{analysis.word_count}</div>
              <div className="text-sm text-gray-600">Words</div>
            </div>
            
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{analysis.char_count}</div>
              <div className="text-sm text-gray-600">Characters</div>
            </div>
            
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{analysis.sentence_count}</div>
              <div className="text-sm text-gray-600">Sentences</div>
            </div>
            
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">{analysis.reading_time_minutes.toFixed(1)}m</div>
              <div className="text-sm text-gray-600">Read Time</div>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="text-sm font-medium text-gray-700">Language</div>
              <div className="text-lg capitalize">{analysis.detected_language}</div>
              <div className="text-xs text-gray-500">
                Confidence: {(analysis.language_confidence * 100).toFixed(1)}%
              </div>
            </div>
            
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="text-sm font-medium text-gray-700">Sentiment</div>
              <div className={`text-lg ${
                analysis.sentiment_score > 0.1 ? 'text-green-600' : 
                analysis.sentiment_score < -0.1 ? 'text-red-600' : 'text-gray-600'
              }`}>
                {analysis.sentiment_score > 0.1 ? 'Positive' : 
                 analysis.sentiment_score < -0.1 ? 'Negative' : 'Neutral'}
              </div>
              <div className="text-xs text-gray-500">
                Score: {analysis.sentiment_score.toFixed(2)}
              </div>
            </div>
            
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="text-sm font-medium text-gray-700">Content Filter</div>
              <div className={`text-lg ${
                analysis.profanity_score > 0.1 ? 'text-red-600' : 'text-green-600'
              }`}>
                {analysis.profanity_score > 0.1 ? 'Issues Found' : 'Clean'}
              </div>
              <div className="text-xs text-gray-500">
                Score: {(analysis.profanity_score * 100).toFixed(1)}%
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Processing Results */}
      {processingResult && (
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h3 className="font-medium mb-3">Processing Results</h3>
          
          <div className="space-y-4">
            <div>
              <div className="text-sm font-medium text-gray-700 mb-1">Original Text:</div>
              <div className="p-3 bg-gray-50 rounded border text-sm">
                {processingResult.original_text}
              </div>
            </div>
            
            <div>
              <div className="text-sm font-medium text-gray-700 mb-1">Processed Text:</div>
              <div className="p-3 bg-blue-50 rounded border text-sm">
                {processingResult.processed_text}
              </div>
            </div>
            
            <div className="text-xs text-gray-500">
              Processing completed in {processingResult.processing_time_ms.toFixed(2)}ms
            </div>
          </div>
        </div>
      )}

      {/* Performance Results */}
      {perfResults.wasm && perfResults.javascript && (
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h3 className="font-medium mb-3">Performance Comparison</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-800 mb-2">🦀 WebAssembly</h4>
              <div className="space-y-1 text-sm">
                <div>Avg Time: <span className="font-mono">{perfResults.wasm.average_time_ms.toFixed(4)}ms</span></div>
                <div>Total Time: <span className="font-mono">{perfResults.wasm.total_time_ms.toFixed(2)}ms</span></div>
                <div>Ops/sec: <span className="font-mono">{Math.round(perfResults.wasm.operations_per_second)}</span></div>
              </div>
            </div>
            
            <div className="p-4 bg-yellow-50 rounded-lg">
              <h4 className="font-medium text-yellow-800 mb-2">⚡ JavaScript</h4>
              <div className="space-y-1 text-sm">
                <div>Avg Time: <span className="font-mono">{perfResults.javascript.average_time_ms.toFixed(4)}ms</span></div>
                <div>Total Time: <span className="font-mono">{perfResults.javascript.total_time_ms.toFixed(2)}ms</span></div>
                <div>Ops/sec: <span className="font-mono">{Math.round(perfResults.javascript.operations_per_second)}</span></div>
              </div>
            </div>
          </div>
          
          {perfResults.comparison && (
            <div className={`mt-4 p-4 rounded-lg ${
              perfResults.comparison.wasmFaster ? 'bg-green-50 border border-green-200' : 'bg-orange-50 border border-orange-200'
            }`}>
              <div className={`font-medium ${
                perfResults.comparison.wasmFaster ? 'text-green-800' : 'text-orange-800'
              }`}>
                {perfResults.comparison.wasmFaster ? '🏆 WASM is faster!' : '⚡ JavaScript is faster!'}
              </div>
              <div className="text-sm mt-1">
                Speedup: {perfResults.comparison.speedup.toFixed(2)}x faster
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default WasmTextProcessor;
