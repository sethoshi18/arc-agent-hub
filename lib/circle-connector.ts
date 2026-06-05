/**
 * Circle Modular Wallets — wagmi v2 Custom Connector
 *
 * Bridges Circle's passkey-based smart accounts into wagmi so all existing
 * hooks (useAccount, useReadContract, useWriteContract) work transparently.
 *
 * All browser-only APIs (WebAuthn, localStorage) are deferred to connect()
 * to avoid SSR failures in Next.js.
 */

import { createConnector } from "wagmi";
import { defineChain, createPublicClient } from "viem";
import {
  type P256Credential,
  type WebAuthnAccount,
  toWebAuthnAccount,
  createBundlerClient,
} from "viem/account-abstraction";
import {
  EIP1193Provider,
  WebAuthnMode,
  toCircleSmartAccount,
  toModularTransport,
  toPasskeyTransport,
  toWebAuthnCredential,
} from "@circle-fin/modular-wallets-core";

const CREDENTIAL_STORAGE_KEY = "arc-agent-hub:circle-credential";

export const arcTestnetChain = defineChain({
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

interface CirclePasskeyParams {
  clientUrl: string;
  clientKey: string;
}

type ConnectMode = "register" | "login";

export function circlePasskey({ clientUrl, clientKey }: CirclePasskeyParams) {
  let provider: InstanceType<typeof EIP1193Provider> | null = null;
  let smartAccountAddress: `0x${string}` | null = null;
  let connectMode: ConnectMode = "login";

  const chain = arcTestnetChain;

  // NOTE: passkeyTransport is created lazily inside connect(), not here,
  // because toPasskeyTransport may use browser-only APIs that break SSR.

  function setConnectMode(mode: ConnectMode) {
    connectMode = mode;
  }

  async function initializeFromCredential(credential: P256Credential) {
    const modularTransport = toModularTransport(
      `${clientUrl}/arcTestnet`,
      clientKey,
    );

    const publicClient = createPublicClient({
      chain,
      transport: modularTransport,
    });

    const webAuthnAccount = toWebAuthnAccount({
      credential,
    }) as WebAuthnAccount;

    const circleAccount = await toCircleSmartAccount({
      client: publicClient,
      owner: webAuthnAccount,
    });

    const bundlerClient = createBundlerClient({
      account: circleAccount,
      chain,
      transport: modularTransport,
    });

    smartAccountAddress = circleAccount.address;
    provider = new EIP1193Provider(bundlerClient, publicClient);

    try {
      localStorage.setItem(CREDENTIAL_STORAGE_KEY, JSON.stringify(credential));
    } catch {
      // SSR or private browsing
    }

    return { address: smartAccountAddress };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const connector = createConnector((_config: any) => ({
    id: "circle-passkey",
    name: "Circle Passkey",
    type: "circle-passkey" as const,

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async connect(params?: any): Promise<any> {
      const { isReconnecting } = params ?? {};

      // Guard: skip during SSR
      if (typeof window === "undefined") {
        throw new Error("Circle Passkey connector requires a browser environment");
      }

      // Guard: skip if client key is missing
      if (!clientKey) {
        throw new Error("NEXT_PUBLIC_CIRCLE_CLIENT_KEY is not configured");
      }

      try {
        // Auto-reconnect: use stored credential
        if (isReconnecting) {
          const stored = localStorage.getItem(CREDENTIAL_STORAGE_KEY);
          if (stored) {
            const credential = JSON.parse(stored) as P256Credential;
            await initializeFromCredential(credential);
            return {
              accounts: [smartAccountAddress!] as const,
              chainId: chain.id,
            };
          }
          throw new Error("No stored credential for reconnection");
        }

        // Create passkey transport lazily (browser-only)
        const passkeyTransport = toPasskeyTransport(clientUrl, clientKey);

        let credential: P256Credential;

        if (connectMode === "register") {
          credential = await toWebAuthnCredential({
            transport: passkeyTransport,
            mode: WebAuthnMode.Register,
            username: `arc-agent-${Date.now()}`,
          });
        } else {
          credential = await toWebAuthnCredential({
            transport: passkeyTransport,
            mode: WebAuthnMode.Login,
          });
        }

        await initializeFromCredential(credential);

        return {
          accounts: [smartAccountAddress!] as const,
          chainId: chain.id,
        };
      } catch (error) {
        smartAccountAddress = null;
        provider = null;
        // Surface the error so the user can see what went wrong
        const msg = error instanceof Error ? error.message : String(error);
        console.error("[Circle Passkey] Connect failed:", msg);
        throw error;
      }
    },

    async disconnect() {
      provider = null;
      smartAccountAddress = null;
      if (typeof window !== "undefined") {
        try {
          localStorage.removeItem(CREDENTIAL_STORAGE_KEY);
        } catch {
          // Ignore
        }
      }
    },

    async getAccounts() {
      return smartAccountAddress ? [smartAccountAddress] : [];
    },

    async getChainId() {
      return chain.id;
    },

    async getProvider() {
      return provider;
    },

    async isAuthorized() {
      if (smartAccountAddress && provider) return true;
      if (typeof window === "undefined") return false;
      try {
        const stored = localStorage.getItem(CREDENTIAL_STORAGE_KEY);
        return !!stored;
      } catch {
        return false;
      }
    },

    onAccountsChanged() {},
    onChainChanged() {},
    onDisconnect() {},
  }));

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return Object.assign(connector, { setConnectMode }) as any;
}
