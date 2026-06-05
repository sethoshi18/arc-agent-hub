/**
 * Circle Modular Wallets — wagmi v2 Custom Connector
 *
 * Bridges Circle's passkey-based smart accounts into wagmi so all existing
 * hooks (useAccount, useReadContract, useWriteContract) work transparently.
 *
 * Under the hood:
 *   Passkey (WebAuthn) → Circle Smart Account (ERC-4337) → EIP-1193 Provider → wagmi
 *
 * Transactions are sent as UserOperations via Circle's bundler, with the
 * paymaster covering gas (gasless UX for users).
 */

import { createConnector } from "wagmi";
import { defineChain, createPublicClient, type Chain, parseGwei } from "viem";
import { toWebAuthnAccount, createBundlerClient } from "viem/account-abstraction";
import {
  type P256Credential,
  EIP1193Provider,
  WebAuthnMode,
  toCircleSmartAccount,
  toModularTransport,
  toPasskeyTransport,
  toWebAuthnCredential,
} from "@circle-fin/modular-wallets-core";

const CREDENTIAL_STORAGE_KEY = "arc-agent-hub:circle-credential";

// Arc Testnet chain definition for Circle Modular Wallets
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

/**
 * Creates a wagmi v2 connector backed by Circle Modular Wallets + passkeys.
 *
 * Usage in wagmi config:
 *   circlePasskey({ clientUrl: "...", clientKey: "..." })
 */
export function circlePasskey({ clientUrl, clientKey }: CirclePasskeyParams) {
  // Shared state across connector lifecycle
  let provider: InstanceType<typeof EIP1193Provider> | null = null;
  let smartAccountAddress: `0x${string}` | null = null;
  let currentCredential: P256Credential | null = null;
  let connectMode: ConnectMode = "login";

  const chain = arcTestnetChain;
  const passkeyTransport = toPasskeyTransport(clientUrl, clientKey);

  /**
   * Set the connect mode before calling wagmi's connect().
   * Call this from your UI before triggering the connection.
   */
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

    const webAuthnAccount = toWebAuthnAccount({ credential });

    const circleAccount = await toCircleSmartAccount({
      client: publicClient,
      owner: webAuthnAccount,
    });

    const bundlerClient = createBundlerClient({
      account: circleAccount,
      chain,
      transport: modularTransport,
      userOperation: {
        async estimateFeesPerGas() {
          // Arc Testnet minimum base fee is ~20 gwei
          const MIN_PRIORITY_FEE = parseGwei("2");
          const block = await publicClient.getBlock();
          const baseFee = block.baseFeePerGas ?? parseGwei("25");
          return {
            maxFeePerGas: baseFee * 2n + MIN_PRIORITY_FEE,
            maxPriorityFeePerGas: MIN_PRIORITY_FEE,
          };
        },
      },
    });

    smartAccountAddress = circleAccount.address;
    provider = new EIP1193Provider({ bundlerClient, publicClient });
    currentCredential = credential;

    // Persist credential for auto-reconnect
    try {
      localStorage.setItem(CREDENTIAL_STORAGE_KEY, JSON.stringify(credential));
    } catch {
      // localStorage may be unavailable in some contexts
    }

    return { address: smartAccountAddress };
  }

  const connector = createConnector((config) => ({
    id: "circle-passkey",
    name: "Circle Passkey",
    type: "circle-passkey" as const,

    async connect({ isReconnecting } = {}) {
      try {
        // Auto-reconnect: use stored credential
        if (isReconnecting) {
          const stored = localStorage.getItem(CREDENTIAL_STORAGE_KEY);
          if (stored) {
            const credential = JSON.parse(stored) as P256Credential;
            await initializeFromCredential(credential);
            return {
              accounts: [smartAccountAddress!],
              chainId: chain.id,
            };
          }
          throw new Error("No stored credential for reconnection");
        }

        // Manual connect: register or login based on mode
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
          accounts: [smartAccountAddress!],
          chainId: chain.id,
        };
      } catch (error) {
        smartAccountAddress = null;
        provider = null;
        throw error;
      }
    },

    async disconnect() {
      provider = null;
      smartAccountAddress = null;
      currentCredential = null;
      try {
        localStorage.removeItem(CREDENTIAL_STORAGE_KEY);
      } catch {
        // Ignore
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

  // Attach setConnectMode to the connector for external access
  return Object.assign(connector, { setConnectMode });
}
