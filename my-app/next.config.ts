import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Allow phones on the local network to load dev assets (HMR websocket, RSC, etc.)
  // when the app is opened via the machine's LAN IP, e.g. http://192.168.31.226:3000
  allowedDevOrigins: ["192.168.31.*"],
};

export default nextConfig;
