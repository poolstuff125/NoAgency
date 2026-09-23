import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // PGlite loads its WASM/data files at runtime and must not be bundled.
  serverExternalPackages: ["@electric-sql/pglite"],
};

export default nextConfig;
