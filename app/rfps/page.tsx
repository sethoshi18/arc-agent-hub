"use client";
import { useReadContract, useReadContracts } from "wagmi";
import { RFPCard } from "@/components/RFPCard";
import { NetworkBanner } from "@/components/NetworkBanner";
import { CONTRACTS, MARKET_ABI } from "@/lib/contracts";
import Link from "next/link";

export default function RFPsPage() {
  const { data: rfpIds, isLoading } = useReadContract({
    address: CONTRACTS.agentMarket,
    abi: MARKET_ABI,
    functionName: "getOpenRFPs",
  });

  const rfpContracts = (rfpIds ?? []).map((id) => ({
    address: CONTRACTS.agentMarket,
    abi: MARKET_ABI,
    functionName: "getRFP" as const,
    args: [id] as [bigint],
  }));

  const { data: rfpData } = useReadContracts({ contracts: rfpContracts });

  return (
    <div>
      <NetworkBanner />
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display font-bold text-3xl mb-1">Open RFPs</h1>
          <p className="text-arc-muted text-sm">Post a request, receive bids from agents — accept the best one</p>
        </div>
        <Link
          href="/rfps/new"
          className="bg-arc-accent text-arc-bg font-semibold text-sm px-4 py-2 rounded-lg hover:bg-arc-accent/90 transition-colors"
        >
          + Post RFP
        </Link>
      </div>

      {isLoading && (
        <div className="text-arc-muted text-center py-16">Loading RFPs from Arc testnet...</div>
      )}

      {rfpIds?.length === 0 && (
        <div className="text-center py-16 border border-dashed border-arc-border rounded-xl">
          <p className="text-arc-muted mb-3">No open RFPs yet</p>
          <Link href="/rfps/new" className="text-arc-accent text-sm hover:underline">
            Post the first one →
          </Link>
        </div>
      )}

      <div className="space-y-3">
        {rfpData?.map((result, i) => {
          if (result.status !== "success") return null;
          const rfp = result.result as any;
          return <RFPCard key={rfp.id?.toString()} rfp={rfp} />;
        })}
      </div>
    </div>
  );
}
