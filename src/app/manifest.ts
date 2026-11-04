import type { MetadataRoute } from "next";
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "GenAMR Research Demo",
    short_name: "GenAMR",
    description: "Synthetic AMR workflow demonstration",
    start_url: "/",
    display: "standalone",
    background_color: "#f5f7f8",
    theme_color: "#0c564b",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
    ],
  };
}
