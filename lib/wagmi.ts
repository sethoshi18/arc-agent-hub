"use client";
import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { arcTestnet } from "./chains";

export const wagmiConfig = getDefaultConfig({
  appName:   "Arc Agent Hub",
  projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID ?? "demo",
  chains:    [arcTestnet],
  ssr:       true,
});
