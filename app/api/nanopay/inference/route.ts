/**
 * Paywalled AI Inference Endpoint
 *
 * Demonstrates pay-per-inference nanopayments: AI agents pay $0.001 USDC
 * per inference call via Circle Gateway on Arc Testnet.
 *
 * This is the core Track 4 demo — autonomous agents paying for AI services
 * with sub-cent stablecoin micropayments.
 */

import { NextRequest, NextResponse } from "next/server";
import { withGateway } from "@/lib/x402";

// Simulated inference responses for demo purposes.
// In production, this would call an actual LLM API.
const INFERENCE_RESPONSES: Record<string, string[]> = {
  sentiment: [
    "Sentiment analysis complete: POSITIVE (confidence: 0.92). The text expresses optimism about decentralized agent economies.",
    "Sentiment analysis complete: NEUTRAL (confidence: 0.78). The text contains balanced factual statements about stablecoin payments.",
    "Sentiment analysis complete: POSITIVE (confidence: 0.88). Strong positive signals around programmable payment infrastructure.",
  ],
  summarize: [
    "Summary: The Arc Agent Hub enables autonomous AI agents to register on-chain identities, bid on jobs, form orchestras for complex tasks, and settle payments in USDC — all governed by reputation-weighted DAO voting.",
    "Summary: Circle Nanopayments allow high-frequency, sub-cent USDC transactions ideal for pay-per-inference AI workloads, using EIP-3009 signed authorizations batched and settled via a Trusted Execution Environment.",
    "Summary: The seven-layer agentic commerce stack provides identity, escrow, marketplace, orchestration, subscriptions, staking, and governance — a complete economic system for AI agents on Arc.",
  ],
  classify: [
    "Classification: DEFI_INFRASTRUCTURE (confidence: 0.95). The input describes programmable payment rails for autonomous economic agents.",
    "Classification: AGENT_ECONOMY (confidence: 0.91). The input describes AI agents participating in on-chain marketplaces.",
    "Classification: STABLECOIN_COMMERCE (confidence: 0.89). The input describes USDC-settled commercial transactions between software agents.",
  ],
};

const handler = async (req: NextRequest) => {
  // Parse task type from query params or POST body
  let task = "sentiment";
  let input = "Autonomous AI agents settling USDC payments on Arc blockchain";

  if (req.method === "POST") {
    try {
      const body = await req.json();
      task = body.task ?? task;
      input = body.input ?? input;
    } catch {
      // Use defaults
    }
  } else {
    const url = new URL(req.url);
    task = url.searchParams.get("task") ?? task;
    input = url.searchParams.get("input") ?? input;
  }

  const responses = INFERENCE_RESPONSES[task] ?? INFERENCE_RESPONSES.sentiment;
  const result = responses[Math.floor(Math.random() * responses.length)];

  return NextResponse.json({
    model: "arc-agent-hub-inference-v1",
    task,
    input: input.slice(0, 200),
    result,
    tokens_used: Math.floor(Math.random() * 150) + 50,
    cost_usdc: "0.001",
    timestamp: new Date().toISOString(),
    network: "arc-testnet",
  });
};

// $0.001 USDC per inference call — paid via Circle Nanopayments
export const GET = withGateway(handler, "$0.001", "/api/nanopay/inference");
export const POST = withGateway(handler, "$0.001", "/api/nanopay/inference");
