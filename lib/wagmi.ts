/**
 * wagmi configuration — Circle Modular Wallets on Arc Testnet
 *
 * Replaces the previous RainbowKit + WalletConnect setup with Circle's
 * passkey-based smart accounts. All wagmi hooks (useAccount, useReadContract,
 * useWriteContract) work transparently through the EIP-1193 bridge.
 */

import { createConfig, http } from "wagmi";
import { circlePasskey, arcTestnetChain } from "./circle-connector";

const clientUrl =
  process.env.NEXT_PUBLIC_CIRCLE_CLIENT_URL ??
  "https://modular-sdk.circle.com/v1/rpc/w3s/buidl";
const clientKey = process.env.NEXT_PUBLIC_CIRCLE_CLIENT_KEY ?? "";

export const circleConnector = circlePasskey({ clientUrl, clientKey });

export const wagmiConfig = createConfig({
  chains: [arcTestnetChain],
  connectors: [circleConnector],
  transports: {
    // Public RPC for read operations (useReadContract, useBalance, etc.)
    // Write operations go through the Circle EIP-1193 provider via the connector
    [arcTestnetChain.id]: http("https://rpc.testnet.arc.network"),
  },
});

export { arcTestnetChain };
