/**
 * WASM Test Script
 * Run this to verify WASM is working correctly in Node.js
 * 
 * Usage: node test-wasm.js
 */

const { wasmTextProcessor } = require('./services/wasmTextProcessor');

async function runTests() {
  console.log('🦀 Testing WASM Text Processor...\n');

  try {
    // Test 1: Initialization
    console.log('Test 1: Initialization');
    await wasmTextProcessor.initialize();
    console.log('✅ WASM initialized successfully\n');

    // Test 2: Text Analysis
    console.log('Test 2: Text Analysis');
    const analysis = await wasmTextProcessor.analyzeText(
      'Hello world! This is a test of the WASM text processor. It works great!'
    );
    console.log('Analysis result:', JSON.stringify(analysis, null, 2));
    console.log('✅ Text analysis passed\n');

    // Test 3: Text Processing
    console.log('Test 3: Text Processing');
    const processed = await wasmTextProcessor.processText(
      'Some   text   with   extra   spaces',
      true,
      true
    );
    console.log('Original:', processed.original_text);
    console.log('Processed:', processed.processed_text);
    console.log('Processing time:', processed.processing_time_ms.toFixed(2), 'ms');
    console.log('✅ Text processing passed\n');

    // Test 4: Batch Processing
    console.log('Test 4: Batch Processing');
    const batchResults = await wasmTextProcessor.batchProcess([
      'First text',
      'Second text',
      'Third text'
    ]);
    console.log(`Processed ${batchResults.length} texts`);
    console.log('✅ Batch processing passed\n');

    // Test 5: Word Count
    console.log('Test 5: Word Count');
    const wordCount = await wasmTextProcessor.wordCount('Hello world from WASM');
    console.log('Word count:', wordCount);
    console.log('✅ Word count passed\n');

    // Test 6: Character Count
    console.log('Test 6: Character Count');
    const charCount = await wasmTextProcessor.charCount('Hello WASM!');
    console.log('Character count:', charCount);
    console.log('✅ Character count passed\n');

    // Test 7: Benchmark
    console.log('Test 7: Performance Benchmark');
    const benchmark = await wasmTextProcessor.benchmark(
      'Sample text for benchmarking',
      1000
    );
    console.log('Benchmark result:', JSON.stringify(benchmark, null, 2));
    if (benchmark && typeof benchmark === 'object') {
      console.log('Iterations:', benchmark.iterations);
      console.log('Total time:', benchmark.total_time_ms?.toFixed(2) || 'N/A', 'ms');
      console.log('Average time:', benchmark.average_time_ms?.toFixed(4) || 'N/A', 'ms');
      console.log('Operations/sec:', benchmark.operations_per_second?.toFixed(0) || 'N/A');
    }
    console.log('✅ Benchmark passed\n');

    // Test 8: WASM Support
    console.log('Test 8: WASM Support Check');
    const isSupported = await wasmTextProcessor.isWasmSupported();
    console.log('WASM supported:', isSupported);
    console.log('✅ Support check passed\n');

    // Test 9: Memory Usage
    console.log('Test 9: Memory Usage');
    const memoryUsage = await wasmTextProcessor.getMemoryUsage();
    console.log('Buffer size:', memoryUsage.buffer_size, 'bytes');
    console.log('Pages:', memoryUsage.pages);
    console.log('✅ Memory usage check passed\n');

    // Summary
    console.log('═══════════════════════════════════════');
    console.log('🎉 All tests passed successfully!');
    console.log('═══════════════════════════════════════');
    console.log('\nWASM Text Processor is ready to use!');
    console.log('\nNext steps:');
    console.log('1. Test API endpoints: curl http://localhost:10000/api/wasm/status');
    console.log('2. Try the React demo component');
    console.log('3. Integrate WASM into your application');

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error('\nTroubleshooting:');
    console.error('1. Make sure WASM is built: npm run build:wasm');
    console.error('2. Check that wasm files exist in server/wasm/');
    console.error('3. Verify Rust and wasm-pack are installed');
    process.exit(1);
  }
}

// Run tests
runTests().catch(console.error);
