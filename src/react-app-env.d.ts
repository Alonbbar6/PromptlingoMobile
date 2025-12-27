/// <reference types="react-scripts" />

// WASM module declarations
declare module '*.wasm' {
  const content: string;
  export default content;
}
