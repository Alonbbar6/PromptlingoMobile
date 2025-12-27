/**
 * WASM Demo Component
 * Demonstrates the usage of WASM Text Processor in React
 */

import React, { useState } from 'react';
import { useWasmTextProcessor } from '../hooks/useWasmTextProcessor';
import type { TextAnalysis, ProcessingResult, BenchmarkResult } from '../types/wasm';

export const WasmDemo: React.FC = () => {
  const {
    isInitialized,
    isLoading,
    error,
    analyzeText,
    processText,
    benchmark,
    wordCount,
    getMemoryUsage,
  } = useWasmTextProcessor();

  const [inputText, setInputText] = useState('Hello world! This is a test of the WASM text processor.');
  const [analysis, setAnalysis] = useState<TextAnalysis | null>(null);
  const [processingResult, setProcessingResult] = useState<ProcessingResult | null>(null);
  const [benchmarkResult, setBenchmarkResult] = useState<BenchmarkResult | null>(null);
  const [wordCountResult, setWordCountResult] = useState<number | null>(null);
  const [memoryUsage, setMemoryUsage] = useState<{ buffer_size: number; pages: number } | null>(null);
  const [activeTab, setActiveTab] = useState<'analyze' | 'process' | 'benchmark' | 'utils'>('analyze');

  const handleAnalyze = async () => {
    const result = await analyzeText(inputText);
    setAnalysis(result);
  };

  const handleProcess = async () => {
    const result = await processText(inputText, true, true);
    setProcessingResult(result);
  };

  const handleBenchmark = async () => {
    const result = await benchmark(inputText, 1000);
    setBenchmarkResult(result);
  };

  const handleWordCount = async () => {
    const result = await wordCount(inputText);
    setWordCountResult(result);
  };

  const handleMemoryUsage = async () => {
    const result = await getMemoryUsage();
    setMemoryUsage(result);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading WASM module...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 m-4">
        <h3 className="text-red-800 font-semibold mb-2">Error Loading WASM</h3>
        <p className="text-red-600">{error}</p>
        <p className="text-sm text-red-500 mt-2">
          Make sure to build the WASM module first: <code>cd wasm-text-processor && ./build-all.sh</code>
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
          <h1 className="text-3xl font-bold mb-2">🦀 WASM Text Processor Demo</h1>
          <p className="text-blue-100">
            High-performance text processing powered by Rust + WebAssembly
          </p>
          <div className="mt-4 flex items-center gap-4">
            <span className={`px-3 py-1 rounded-full text-sm ${isInitialized ? 'bg-green-500' : 'bg-yellow-500'}`}>
              {isInitialized ? '✅ Initialized' : '⏳ Loading...'}
            </span>
          </div>
        </div>

        {/* Input Area */}
        <div className="p-6 border-b">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Input Text
          </label>
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={4}
            placeholder="Enter text to process..."
          />
        </div>

        {/* Tabs */}
        <div className="border-b">
          <div className="flex">
            {[
              { id: 'analyze', label: '📊 Analyze' },
              { id: 'process', label: '🔄 Process' },
              { id: 'benchmark', label: '⚡ Benchmark' },
              { id: 'utils', label: '🛠️ Utils' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-6 py-3 font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'border-b-2 border-blue-600 text-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {/* Analyze Tab */}
          {activeTab === 'analyze' && (
            <div>
              <button
                onClick={handleAnalyze}
                disabled={!isInitialized}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                Analyze Text
              </button>

              {analysis && (
                <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-sm text-gray-600">Words</div>
                    <div className="text-2xl font-bold text-gray-900">{analysis.word_count}</div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-sm text-gray-600">Characters</div>
                    <div className="text-2xl font-bold text-gray-900">{analysis.char_count}</div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-sm text-gray-600">Sentences</div>
                    <div className="text-2xl font-bold text-gray-900">{analysis.sentence_count}</div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-sm text-gray-600">Reading Time</div>
                    <div className="text-2xl font-bold text-gray-900">
                      {analysis.reading_time_minutes.toFixed(1)}m
                    </div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg col-span-2">
                    <div className="text-sm text-gray-600">Language</div>
                    <div className="text-xl font-bold text-gray-900">
                      {analysis.detected_language} ({(analysis.language_confidence * 100).toFixed(0)}%)
                    </div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-sm text-gray-600">Sentiment</div>
                    <div className="text-xl font-bold text-gray-900">
                      {analysis.sentiment_score > 0 ? '😊' : analysis.sentiment_score < 0 ? '😞' : '😐'}
                      {' '}
                      {analysis.sentiment_score.toFixed(2)}
                    </div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-sm text-gray-600">Profanity</div>
                    <div className="text-xl font-bold text-gray-900">
                      {(analysis.profanity_score * 100).toFixed(1)}%
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Process Tab */}
          {activeTab === 'process' && (
            <div>
              <button
                onClick={handleProcess}
                disabled={!isInitialized}
                className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                Process Text
              </button>

              {processingResult && (
                <div className="mt-6 space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Original Text</h3>
                    <div className="bg-gray-50 p-4 rounded-lg text-gray-900">
                      {processingResult.original_text}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Processed Text</h3>
                    <div className="bg-green-50 p-4 rounded-lg text-gray-900">
                      {processingResult.processed_text}
                    </div>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="text-sm text-gray-600">Processing Time</div>
                    <div className="text-xl font-bold text-blue-900">
                      {processingResult.processing_time_ms.toFixed(2)} ms
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Benchmark Tab */}
          {activeTab === 'benchmark' && (
            <div>
              <button
                onClick={handleBenchmark}
                disabled={!isInitialized}
                className="bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                Run Benchmark (1000 iterations)
              </button>

              {benchmarkResult && (
                <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-sm text-gray-600">Iterations</div>
                    <div className="text-2xl font-bold text-gray-900">{benchmarkResult.iterations}</div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-sm text-gray-600">Total Time</div>
                    <div className="text-2xl font-bold text-gray-900">
                      {benchmarkResult.total_time_ms.toFixed(2)} ms
                    </div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-sm text-gray-600">Average Time</div>
                    <div className="text-2xl font-bold text-gray-900">
                      {benchmarkResult.average_time_ms.toFixed(4)} ms
                    </div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-sm text-gray-600">Ops/Second</div>
                    <div className="text-2xl font-bold text-gray-900">
                      {benchmarkResult.operations_per_second.toFixed(0)}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Utils Tab */}
          {activeTab === 'utils' && (
            <div className="space-y-4">
              <div>
                <button
                  onClick={handleWordCount}
                  disabled={!isInitialized}
                  className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  Count Words
                </button>
                {wordCountResult !== null && (
                  <div className="mt-2 text-lg">
                    Word Count: <span className="font-bold">{wordCountResult}</span>
                  </div>
                )}
              </div>

              <div>
                <button
                  onClick={handleMemoryUsage}
                  disabled={!isInitialized}
                  className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  Get Memory Usage
                </button>
                {memoryUsage && (
                  <div className="mt-2 bg-gray-50 p-4 rounded-lg">
                    <div>Buffer Size: <span className="font-bold">{memoryUsage.buffer_size} bytes</span></div>
                    <div>Pages: <span className="font-bold">{memoryUsage.pages}</span></div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
