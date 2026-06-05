/**
 * Gateway Balance Endpoint
 *
 * Returns the seller's USDC balance in both the Gateway and on-chain wallet.
 * Used by the Nanopayments dashboard to show earnings.
 */

import { NextResponse } from "next/server";
import { createPublicClient, http, formatUnits, erc20Abi } from "viem";

const GATEWAY_API = "https://gateway-api-testnet.circle.com/v1/balances";
const ARC_TESTNET_DOMAIN = 26;
const ARC_TESTNET_RPC = "https://rpc.testnet.arc.network";
const ARC_TESTNET_USDC = "0x3600000000000000000000000000000000000000" as const;

const publicClient = createPublicClient({
  transport: http(ARC_TESTNET_RPC),
});

async function getWalletUsdcBalance(address: `0x${string}`): Promise<string> {
  try {
    const balance = await publicClient.readContract({
      address: ARC_TESTNET_USDC,
      abi: erc20Abi,
      functionName: "balanceOf",
      args: [address],
    });
    return formatUnits(balance, 6);
  } catch (error) {
    console.error("Failed to fetch wallet USDC balance:", error);
    return "0";
  }
}

export async function GET() {
  const address = process.env.SELLER_ADDRESS;
  if (!address) {
    return NextResponse.json(
      { error: "SELLER_ADDRESS not configured" },
      { status: 500 },
    );
  }

  const sellerAddress = address as `0x${string}`;

  try {
    const [gatewayResponse, walletBalance] = await Promise.all([
      fetch(GATEWAY_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
        body: JSON.stringify({
          token: "USDC",
          sources: [{ domain: ARC_TESTNET_DOMAIN, depositor: sellerAddress }],
        }),
      }),
      getWalletUsdcBalance(sellerAddress),
    ]);

    if (!gatewayResponse.ok) {
      return NextResponse.json({
        seller: sellerAddress,
        wallet: { balance: walletBalance },
        gateway: { total: "0", available: "0", withdrawing: "0" },
      });
    }

    const data = await gatewayResponse.json();
    const bal = data.balances?.find(
      (b: { domain: number }) => b.domain === ARC_TESTNET_DOMAIN,
    );

    const raw = bal?.balance ?? "0";
    const withdrawingRaw = bal?.withdrawing ?? "0";
    const parse = (v: string) =>
      v.includes(".") ? v : formatUnits(BigInt(v), 6);

    const available = parse(raw);
    const withdrawing = parse(withdrawingRaw);
    const total = (parseFloat(available) + parseFloat(withdrawing)).toFixed(6);

    return NextResponse.json({
      seller: sellerAddress,
      wallet: { balance: walletBalance },
      gateway: { total, available, withdrawing },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Balance fetch error:", message);
    return NextResponse.json({
      seller: sellerAddress,
      wallet: { balance: "0" },
      gateway: { total: "0", available: "0", withdrawing: "0" },
    });
  }
}
