import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  serverExternalPackages: ["mssql", "@prisma/adapter-mssql"],
};

export default nextConfig;
