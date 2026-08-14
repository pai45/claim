import type { NextConfig } from "next";

const repositoryName = process.env.GITHUB_REPOSITORY?.split("/")[1];
const isStaticExport =
  process.env.STATIC_EXPORT === "true" ||
  process.env.GITHUB_ACTIONS === "true";
const basePath =
  isStaticExport && repositoryName ? `/${repositoryName}` : "";

const nextConfig: NextConfig = {
  ...(isStaticExport ? { output: "export" as const } : {}),
  distDir: isStaticExport ? ".next-verify" : ".next",
  typescript: {
    tsconfigPath: isStaticExport ? "tsconfig.pages.json" : "tsconfig.json",
  },
  basePath,
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
  serverExternalPackages: [
    "@huggingface/transformers",
    "onnxruntime-node",
    "sharp",
  ],
};

export default nextConfig;
