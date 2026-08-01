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
    // Vehicle photos are hotlinked from Commons. With `unoptimized` these are
    // not consulted today, but they keep the app working if it is ever turned
    // off. Special:FilePath redirects to upload.wikimedia.org, hence both.
    remotePatterns: [
      { protocol: "https", hostname: "commons.wikimedia.org" },
      { protocol: "https", hostname: "upload.wikimedia.org" },
    ],
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
