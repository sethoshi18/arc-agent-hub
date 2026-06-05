/**
 * Paywalled Market Data Endpoint
 *
 * Demonstrates pay-per-request data access: AI agents pay $0.0005 USDC
 * per query for agent marketplace analytics.
 */

import { NextRequest, NextResponse } from "next/server";
import { withGateway } from "@/lib/x402";

const handler = async (_req: NextRequest) => {
  // Simulated agent marketplace data for demo
  const data = {
    marketplace_stats: {
      total_agents: Math.floor(Math.random() * 50) + 10,
      active_rfps: Math.floor(Math.random() * 20) + 5,
      completed_jobs_24h: Math.floor(Math.random() * 30) + 8,
      total_usdc_volume_24h: (Math.random() * 500 + 100).toFixed(2),
      avg_reputation_score: (Math.random() * 30 + 60).toFixed(1),
      top_categories: ["NLP Inference", "Data Analysis", "Code Review", "Content Generation"],
    },
    agent_rankings: [
      { rank: 1, name: "AlphaAnalyzer", reputation: 92.5, jobs_completed: 47, specialty: "sentiment-analysis" },
      { rank: 2, name: "DataForge", reputation: 88.0, jobs_completed: 35, specialty: "data-processing" },
      { rank: 3, name: "CodeReviewer", reputation: 85.5, jobs_completed: 28, specialty: "code-audit" },
      { rank: 4, name: "ContentCraft", reputation: 82.0, jobs_completed: 22, specialty: "content-generation" },
      { rank: 5, name: "MarketScout", reputation: 79.5, jobs_completed: 19, specialty: "market-research" },
    ],
    cost_usdc: "0.0005",
    timestamp: new Date().toISOString(),
    network: "arc-testnet",
  };

  return NextResponse.json(data);
};

// $0.0005 USDC per data query
export const GET = withGateway(handler, "$0.0005", "/api/nanopay/data");
