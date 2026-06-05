/**
 * wagmi configuration — RainbowKit + standard wallets on Arc Testnet
 *
 * Replaces Circle Modular Wallets (passkey/SCA) which are currently broken
 * on Arc Testnet (SCA factory contracts not deployed). Standard EOA wallets
 * (MetaMask, WalletConnect, etc.) work immediately.
 */

import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { defineChain } from "viem";

export const arcTestnet = defineChain({
  id: 5042002,
  name: "Arc Testnet",
  nativeCurrency: { name: "USDC", symbol: "USDC", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://rpc.testnet.arc.network"] },
  },
  blockExplorers: {
    default: { name: "ArcScan", url: "https://testnet.arcscan.app" },
  },
  testnet: true,
});

export const wagmiConfig = getDefaultConfig({
  appName: "Arc Agent Hub",
  projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID ?? "placeholder",
  chains: [arcTestnet],
});
