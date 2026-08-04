import type { MetadataRoute } from "next";
import { BASE_PATH, withBasePath } from "@/lib/basePath";

// Static export emits this as `manifest.webmanifest`, and Next links it from
// <head> automatically. Everything is base-path aware because GitHub Pages
// serves the app from `/claim/`, not the domain root.
export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
  const start = `${BASE_PATH}/`;

  return {
    id: start,
    name: "Benefits Assistant",
    short_name: "Benefits",
    description:
      "Tax benefits claims assistant for reimbursements and vehicle registration.",
    start_url: start,
    scope: start,
    display: "standalone",
    orientation: "portrait",
    background_color: "#F8FAF8",
    theme_color: "#F8FAF8",
    categories: ["business", "finance", "productivity"],
    icons: [
      {
        src: withBasePath("/assets/pwa/icon-192.png"),
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: withBasePath("/assets/pwa/icon-512.png"),
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: withBasePath("/assets/pwa/icon-maskable-512.png"),
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
