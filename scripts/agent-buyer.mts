/**
 * Arc Agent Hub — Nanopayments Buyer Agent
 *
 * Demonstrates autonomous AI agents paying for inference with sub-cent USDC
 * via Circle Gateway nanopayments on Arc Testnet.
 *
 * Usage:
 *   npm run agent                    # Run with no spending limit
 *   npm run agent -- --limit 0.1     # Stop after 0.1 USDC spent
 *
 * The agent:
 * 1. Generates an ephemeral wallet for this session
 * 2. Funds it from the master BUYER_PRIVATE_KEY wallet
 * 3. Deposits USDC into Circle Gateway
 * 4. Calls paywalled Arc Agent Hub endpoints at 1 req/sec
 * 5. Auto-redeposits when Gateway balance runs low
 */

import { GatewayClient } from "@circle-fin/x402-batching/client";
import {
  createWalletClient,
  createPublicClient,
  http,
  erc20Abi,
  parseUnits,
  parseEther,
} from "viem";
import { arcTestnet } from "viem/chains";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";

// --- CLI args ---
function parseArgs() {
  const args = process.argv.slice(2);
  let spendingLimit: number | null = null;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--limit" && args[i + 1]) {
      const val = parseFloat(args[i + 1]);
      if (isNaN(val) || val <= 0) {
        console.error("--limit must be a positive number (USDC amount)");
        process.exit(1);
      }
      spendingLimit = val;
      i++;
    }
  }

  return { spendingLimit };
}

const { spendingLimit } = parseArgs();
let totalSpent = 0;

if (spendingLimit !== null) {
  console.log(`Spending limit: ${spendingLimit} USDC`);
}

// --- Funder wallet ---
const funderKey = process.env.BUYER_PRIVATE_KEY as `0x${string}` | undefined;
if (!funderKey) {
  console.error("Missing BUYER_PRIVATE_KEY in .env.local");
  process.exit(1);
}

const ARC_TESTNET_USDC = "0x3600000000000000000000000000000000000000" as const;
const ARC_TESTNET_RPC = "https://rpc.testnet.arc.network";

const BASE_URL = process.env.BASE_URL ?? "http://localhost:3000";
const DEPOSIT_AMOUNT = process.env.DEPOSIT_AMOUNT ?? "1";
const GAS_FUND_AMOUNT = parseEther("0.01");

// Arc Agent Hub paywalled endpoints
const endpoints = [
  { url: `${BASE_URL}/api/nanopay/inference?task=sentiment`, method: "GET" as const },
  { url: `${BASE_URL}/api/nanopay/inference?task=summarize`, method: "GET" as const },
  { url: `${BASE_URL}/api/nanopay/inference?task=classify`, method: "GET" as const },
  { url: `${BASE_URL}/api/nanopay/data`, method: "GET" as const },
];

// --- Ephemeral wallet ---
const ephemeralKey = generatePrivateKey();
const ephemeralAccount = privateKeyToAccount(ephemeralKey);
console.log(`\nEphemeral agent wallet: ${ephemeralAccount.address}`);

// --- Fund ephemeral wallet ---
const funderAccount = privateKeyToAccount(funderKey);
const publicClient = createPublicClient({
  chain: arcTestnet,
  transport: http(ARC_TESTNET_RPC),
});
const funderWallet = createWalletClient({
  account: funderAccount,
  chain: arcTestnet,
  transport: http(ARC_TESTNET_RPC),
});

console.log(`Funding from funder ${funderAccount.address}...`);

const usdcAmount = parseUnits(DEPOSIT_AMOUNT, 6);

async function withNonceRetry<T>(fn: () => Promise<T>, label: string): Promise<T> {
  const MAX_RETRIES = 5;
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      return await fn();
    } catch (err) {
      const msg = (err as Error).message ?? "";
      const isNonceError =
        msg.includes("replacement transaction underpriced") ||
        msg.includes("nonce too low") ||
        msg.includes("already known");
      if (!isNonceError || attempt === MAX_RETRIES - 1) throw err;
      const delay = 1000 + Math.random() * 2000;
      console.log(`  ${label}: nonce collision, retrying in ${Math.round(delay)}ms...`);
      await new Promise((r) => setTimeout(r, delay));
    }
  }
  throw new Error("unreachable");
}

// Send gas + USDC to ephemeral wallet
const gasTxHash = await withNonceRetry(
  () => funderWallet.sendTransaction({ to: ephemeralAccount.address, value: GAS_FUND_AMOUNT }),
  "Gas tx",
);
await publicClient.waitForTransactionReceipt({ hash: gasTxHash });
console.log(`  Gas funded (${gasTxHash.slice(0, 10)}...)`);

const usdcTxHash = await withNonceRetry(
  () => funderWallet.writeContract({
    address: ARC_TESTNET_USDC,
    abi: erc20Abi,
    functionName: "transfer",
    args: [ephemeralAccount.address, usdcAmount],
  }),
  "USDC tx",
);
await publicClient.waitForTransactionReceipt({ hash: usdcTxHash });
console.log(`  USDC transferred (${usdcTxHash.slice(0, 10)}...)`);

// --- Create GatewayClient ---
const gateway = new GatewayClient({
  chain: "arcTestnet",
  privateKey: ephemeralKey,
});

let index = 0;
let inFlight = 0;
let redepositing = false;
const REDEPOSIT_THRESHOLD = 500_000n; // 0.5 USDC

async function depositToGateway() {
  console.log(`Depositing ${DEPOSIT_AMOUNT} USDC into Gateway...`);
  const result = await gateway.deposit(DEPOSIT_AMOUNT);
  console.log(`Deposit complete! TX: ${result.depositTxHash}`);
  const updated = await gateway.getBalances();
  console.log(`Gateway available: ${updated.gateway.formattedAvailable}`);
}

async function checkAndRedeposit() {
  if (redepositing) return;
  redepositing = true;
  try {
    const balances = await gateway.getBalances();
    if (balances.gateway.available < REDEPOSIT_THRESHOLD) {
      console.log(`\nGateway balance low (${balances.gateway.formattedAvailable}), redepositing...`);
      if (balances.wallet.balance > 0n) {
        await depositToGateway();
      } else {
        const txHash = await withNonceRetry(
          () => funderWallet.writeContract({
            address: ARC_TESTNET_USDC,
            abi: erc20Abi,
            functionName: "transfer",
            args: [ephemeralAccount.address, usdcAmount],
          }),
          "Redeposit tx",
        );
        await publicClient.waitForTransactionReceipt({ hash: txHash });
        await depositToGateway();
      }
    }
  } catch (err) {
    console.error("Balance check failed:", (err as Error).message);
  } finally {
    redepositing = false;
  }
}

// Initial deposit
await depositToGateway();

console.log(`\n--- Arc Agent Hub Nanopayments Agent ---`);
console.log(`Target: 1 tx/sec across ${endpoints.length} endpoints\n`);

// Balance check every 30s
const balanceInterval = setInterval(checkAndRedeposit, 30_000);

// Payment loop
const paymentInterval = setInterval(() => {
  if (spendingLimit !== null && totalSpent >= spendingLimit) {
    clearInterval(paymentInterval);
    clearInterval(balanceInterval);
    console.log(`\nSpending limit reached: ${totalSpent.toFixed(6)} / ${spendingLimit.toFixed(6)} USDC`);
    console.log("Agent stopped.");
    process.exit(0);
  }

  const ep = endpoints[index % endpoints.length];
  index++;
  inFlight++;

  const start = Date.now();
  gateway
    .pay(ep.url, { method: ep.method })
    .then((result) => {
      inFlight--;
      const ms = Date.now() - start;
      const amount = parseFloat(result.formattedAmount);
      totalSpent += amount;

      const limitInfo = spendingLimit !== null
        ? ` [${totalSpent.toFixed(6)}/${spendingLimit.toFixed(6)} USDC]`
        : "";
      console.log(
        `#${index} ${ep.url.split("/").pop()} -> ${result.formattedAmount} USDC (${ms}ms)${limitInfo}`,
      );
    })
    .catch((err) => {
      inFlight--;
      console.error(`#${index} ${ep.url.split("/").pop()} FAILED: ${err.message}`);
    });
}, 1000);
