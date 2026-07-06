/**
 * @file lib/empty-module.ts
 *
 * WALKTHROUGH — Browser stub for Node-only packages
 * ───────────────────────────────────────────────
 * Turbopack `resolveAlias` maps `onnxruntime-node` and `sharp` here on the
 * client bundle so @huggingface/transformers uses onnxruntime-web only.
 * Server builds keep the real packages via serverExternalPackages.
 */
export {};
