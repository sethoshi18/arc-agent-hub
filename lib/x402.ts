/**
 * x402 Nanopayments Middleware for Arc Agent Hub
 *
 * Wraps Next.js API routes with Circle Gateway payment verification.
 * AI agents pay sub-cent USDC per request via the x402 payment protocol.
 *
 * Flow:
 * 1. Agent calls endpoint -> receives HTTP 402 with payment requirements
 * 2. Agent signs EIP-3009 authorization via GatewayClient
 * 3. Agent retries with payment-signature header
 * 4. Middleware verifies + settles via BatchFacilitatorClient
 * 5. Original handler runs and returns response
 */

import { BatchFacilitatorClient } from "@circle-fin/x402-batching/server";
import { NextRequest, NextResponse } from "next/server";

// Arc Testnet constants
const ARC_TESTNET_NETWORK = "eip155:5042002";
const ARC_TESTNET_USDC = "0x3600000000000000000000000000000000000000";
const ARC_TESTNET_GATEWAY_WALLET = "0x0077777d7EBA4688BDeF3E311b846F25870A19B9";

export const sellerAddress = process.env.SELLER_ADDRESS as `0x${string}`;

const facilitator = new BatchFacilitatorClient();

interface PaymentPayload {
  x402Version: number;
  resource?: { url: string; description: string; mimeType: string };
  accepted?: Record<string, unknown>;
  payload: Record<string, unknown>;
  extensions?: Record<string, unknown>;
}

function buildPaymentRequirements(price: string) {
  const amount = Math.round(parseFloat(price.replace("$", "")) * 1_000_000);

  return {
    scheme: "exact" as const,
    network: ARC_TESTNET_NETWORK,
    asset: ARC_TESTNET_USDC,
    amount: amount.toString(),
    payTo: sellerAddress,
    maxTimeoutSeconds: 345600,
    extra: {
      name: "GatewayWalletBatched",
      version: "1",
      verifyingContract: ARC_TESTNET_GATEWAY_WALLET,
    },
  };
}

/**
 * Wraps a Next.js route handler with Circle Gateway nanopayment verification.
 *
 * Usage:
 *   export const GET = withGateway(handler, "$0.001", "/api/nanopay/inference");
 */
export function withGateway(
  handler: (req: NextRequest) => Promise<NextResponse>,
  price: string,
  endpoint: string,
) {
  const requirements = buildPaymentRequirements(price);

  return async (req: NextRequest) => {
    const paymentSignature = req.headers.get("payment-signature");

    // No payment — return HTTP 402 with payment requirements
    if (!paymentSignature) {
      console.log(`[x402] 402 Payment Required: ${endpoint} (${price})`);

      const paymentRequired = {
        x402Version: 2,
        resource: {
          url: endpoint,
          description: `Arc Agent Hub premium endpoint (${price} USDC)`,
          mimeType: "application/json",
        },
        accepts: [requirements],
      };

      return new NextResponse(JSON.stringify({}), {
        status: 402,
        headers: {
          "Content-Type": "application/json",
          "PAYMENT-REQUIRED": Buffer.from(
            JSON.stringify(paymentRequired),
          ).toString("base64"),
        },
      });
    }

    // Payment present — verify and settle via Circle Gateway
    try {
      const paymentPayload: PaymentPayload = JSON.parse(
        Buffer.from(paymentSignature, "base64").toString("utf-8"),
      );

      const verifyResult = await facilitator.verify(
        paymentPayload,
        requirements,
      );

      if (!verifyResult.isValid) {
        return NextResponse.json(
          { error: "Payment verification failed", reason: verifyResult.invalidReason },
          { status: 402 },
        );
      }

      const settleResult = await facilitator.settle(
        paymentPayload,
        requirements,
      );

      if (!settleResult.success) {
        console.error(`[x402] Settlement failed: ${settleResult.errorReason}`);
        return NextResponse.json(
          { error: "Payment settlement failed", reason: settleResult.errorReason },
          { status: 402 },
        );
      }

      const amountUsdc = (Number(requirements.amount) / 1e6).toString();
      const payer = settleResult.payer ?? verifyResult.payer ?? "unknown";

      console.log(
        `[x402] Payment settled: ${endpoint} — ${amountUsdc} USDC from ${payer}`,
      );

      // Execute the actual handler
      const response = await handler(req);

      // Forward settlement info to client
      const settleResponseHeader = Buffer.from(
        JSON.stringify({
          success: true,
          transaction: settleResult.transaction,
          network: requirements.network,
          payer,
        }),
      ).toString("base64");

      response.headers.set("PAYMENT-RESPONSE", settleResponseHeader);
      return response;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error("[x402] Payment processing error:", message);
      return NextResponse.json(
        { error: "Payment processing error", message },
        { status: 500 },
      );
    }
  };
}
