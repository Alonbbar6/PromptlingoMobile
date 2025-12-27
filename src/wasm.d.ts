/**
 * TypeScript declarations for WASM module imports
 * This allows TypeScript to recognize the dynamically loaded WASM files
 */

declare module '/wasm/wasm_text_processor.js' {
  export class TextProcessor {
    free(): void;
    constructor();
    analyze_text(text: string): any;
    process_text(text: string, filter_profanity: boolean, normalize_whitespace: boolean): any;
    batch_process(texts: string[]): any;
    benchmark(text: string, iterations: number): any;
  }

  export function word_count(text: string): number;
  export function char_count(text: string): number;
  export function is_wasm_supported(): boolean;
  export function get_memory_usage(): { buffer_size: number; pages: number };
  export function main(): void;

  export default function init(input?: string | URL | Request | Response | BufferSource | WebAssembly.Module): Promise<void>;
}

// Allow any imports from /wasm/ directory
declare module '/wasm/*' {
  const content: any;
  export default content;
}

// Wildcard pattern for any wasm_text_processor.js import
declare module '*/wasm_text_processor.js' {
  export class TextProcessor {
    free(): void;
    constructor();
    analyze_text(text: string): any;
    process_text(text: string, filter_profanity: boolean, normalize_whitespace: boolean): any;
    batch_process(texts: string[]): any;
    benchmark(text: string, iterations: number): any;
  }

  export function word_count(text: string): number;
  export function char_count(text: string): number;
  export function is_wasm_supported(): boolean;
  export function get_memory_usage(): { buffer_size: number; pages: number };
  export function main(): void;

  export default function init(input?: string | URL | Request | Response | BufferSource | WebAssembly.Module): Promise<void>;
}
