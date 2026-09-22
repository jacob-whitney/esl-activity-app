import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  allowedDevOrigins: [`http://${process.env.HOST_IP}:3000`]
};

/* See https://nextjs.org/docs/pages/guides/environment-variables */

export default nextConfig;
