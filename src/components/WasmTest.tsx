/**
 * Simple WASM Test Component
 * Quick component to verify WASM is working
 */

import React, { useState } from 'react';
import { useWasmTextProcessor } from '../hooks/useWasmTextProcessor';

export const WasmTest: React.FC = () => {
  const {
    analyzeText,
    processText,
    wordCount,
    isInitialized,
    isLoading,
    error,
  } = useWasmTextProcessor();

  const [result, setResult] = useState<string>('');

  const runTest = async () => {
    try {
      setResult('Running tests...\n\n');

      // Test 1: Analyze
      const analysis = await analyzeText('Hello WASM from React!');
      setResult((prev) => prev + `✅ Analysis: ${analysis?.word_count} words\n`);

      // Test 2: Process
      const processed = await processText('Text   with   spaces', true, true);
      setResult((prev) => prev + `✅ Processed: "${processed?.processed_text}"\n`);

      // Test 3: Word count
      const count = await wordCount('Hello world');
      setResult((prev) => prev + `✅ Word count: ${count}\n`);

      setResult((prev) => prev + '\n🎉 All tests passed!');
    } catch (err) {
      setResult(`❌ Error: ${err}`);
    }
  };

  if (isLoading) {
    return <div className="p-4">Loading WASM...</div>;
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded">
        <p className="text-red-800 font-semibold">Error: {error}</p>
        <p className="text-sm text-red-600 mt-2">
          Run: <code>npm run build:wasm</code>
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold mb-4">🦀 WASM Test</h2>
        
        <div className="mb-4">
          <span className={`px-3 py-1 rounded-full text-sm ${
            isInitialized ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
          }`}>
            {isInitialized ? '✅ Ready' : '⏳ Loading'}
          </span>
        </div>

        <button
          onClick={runTest}
          disabled={!isInitialized}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed mb-4"
        >
          Run Tests
        </button>

        {result && (
          <pre className="bg-gray-50 p-4 rounded border border-gray-200 text-sm whitespace-pre-wrap">
            {result}
          </pre>
        )}
      </div>
    </div>
  );
};
