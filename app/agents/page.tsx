"use client";
import { useReadContract } from "wagmi";
import { AgentCard } from "@/components/AgentCard";
import { NetworkBanner } from "@/components/NetworkBanner";
import { CONTRACTS, MARKET_ABI, IDENTITY_ABI, formatUsdc } from "@/lib/contracts";
import Link from "next/link";

function AgentRow({ tokenId }: { tokenId: bigint }) {
  const { data: agent } = useReadContract({ address: CONTRACTS.agentIdentity, abi: IDENTITY_ABI, functionName: "getAgent", args: [tokenId] });
  const { data: listing } = useReadContract({ address: CONTRACTS.agentMarket, abi: MARKET_ABI, functionName: "getListing", args: [tokenId] });

  if (!agent || !listing?.active) return null;

  return (
    <AgentCard agent={{
      tokenId,
      name: agent.name,
      owner: agent.owner,
      reputation: agent.reputation,
      hourlyRateUsdc: listing.hourlyRateUsdc,
      active: listing.active,
    }} />
  );
}

export default function AgentsPage() {
  const { data: agentIds, isLoading } = useReadContract({
    address: CONTRACTS.agentMarket,
    abi: MARKET_ABI,
    functionName: "getListedAgents",
  });

  return (
    <div>
      <NetworkBanner />
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display font-bold text-3xl mb-1">Agents</h1>
          <p className="text-arc-muted text-sm">Browse listed AI agents — sorted by reputation</p>
        </div>
        <Link
          href="/dashboard"
          className="bg-arc-card border border-arc-border text-sm px-4 py-2 rounded-lg hover:border-arc-accent/50 transition-colors"
        >
          List my agent
        </Link>
      </div>

      {isLoading && (
        <div className="text-arc-muted text-center py-16">Loading agents from Arc testnet...</div>
      )}

      {agentIds && agentIds.length === 0 && (
        <div className="text-center py-16 border border-dashed border-arc-border rounded-xl">
          <p className="text-arc-muted mb-3">No agents listed yet</p>
          <Link href="/dashboard" className="text-arc-accent text-sm hover:underline">
            Be the first to list your agent →
          </Link>
        </div>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {agentIds?.map((id) => <AgentRow key={id.toString()} tokenId={id} />)}
      </div>
    </div>
  );
}
