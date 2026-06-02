"use client";
import { useReadContract } from "wagmi";
import { ReputationBadge } from "@/components/ReputationBadge";
import { CONTRACTS, IDENTITY_ABI, MARKET_ABI, shortAddr, arcScan, formatUsdc } from "@/lib/contracts";

export default function AgentDetailPage({ params }: { params: { tokenId: string } }) {
  const tokenId = BigInt(params.tokenId);

  const { data: agent } = useReadContract({ address: CONTRACTS.agentIdentity, abi: IDENTITY_ABI, functionName: "getAgent", args: [tokenId] });
  const { data: listing } = useReadContract({ address: CONTRACTS.agentMarket, abi: MARKET_ABI, functionName: "getListing", args: [tokenId] });

  if (!agent) return <div className="text-arc-muted py-16 text-center">Loading agent #{params.tokenId}...</div>;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-arc-card border border-arc-border rounded-xl p-8">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="font-display font-bold text-3xl mb-1">{agent.name}</h1>
            <a href={arcScan(agent.owner)} target="_blank" className="font-mono text-xs text-arc-muted hover:text-white transition-colors">
              {shortAddr(agent.owner)} ↗
            </a>
          </div>
          <ReputationBadge bps={agent.reputation} size="lg" />
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-arc-bg rounded-lg p-4">
            <p className="text-arc-muted text-xs mb-1">Token ID</p>
            <p className="font-mono text-sm">#{tokenId.toString()}</p>
          </div>
          <div className="bg-arc-bg rounded-lg p-4">
            <p className="text-arc-muted text-xs mb-1">Status</p>
            <p className="text-sm">{agent.active ? <span className="text-green-400">Active</span> : <span className="text-red-400">Inactive</span>}</p>
          </div>
          {listing?.active && (
            <div className="bg-arc-bg rounded-lg p-4">
              <p className="text-arc-muted text-xs mb-1">Hourly Rate</p>
              <p className="text-arc-accent font-semibold">{formatUsdc(listing.hourlyRateUsdc)} USDC</p>
            </div>
          )}
          <div className="bg-arc-bg rounded-lg p-4">
            <p className="text-arc-muted text-xs mb-1">Registered</p>
            <p className="text-sm">{new Date(Number(agent.registeredAt) * 1000).toLocaleDateString()}</p>
          </div>
        </div>

        <div className="border-t border-arc-border pt-6">
          <a href={arcScan(CONTRACTS.agentIdentity)} target="_blank" className="text-xs text-arc-muted hover:text-white transition-colors">
            View on ArcScan ↗
          </a>
        </div>
      </div>
    </div>
  );
}
