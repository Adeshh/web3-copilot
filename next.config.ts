import type { NextConfig } from "next";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

// Pin the workspace root. An accidental `pnpm add` run in ~ leaves a stray
// pnpm-lock.yaml there, which otherwise makes Turbopack infer /Users/jarvis
// as the project root. Uses import.meta.url rather than __dirname because
// package.json sets "type": "module".
const projectRoot = dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  turbopack: {
    root: projectRoot,
  },
};

export default nextConfig;
