"use client";
import { useReadContract } from "wagmi";
import { AgentCard } from "@/components/AgentCard";
import { NetworkBanner } from "@/components/NetworkBanner";
import { CONTRACTS, MARKET_ABI, IDENTITY_ABI } from "@/lib/contracts";
import Link from "next/link";

function AgentRow({ tokenId }: { tokenId: bigint }) {
  const { data: agent } = useReadContract({ address: CONTRACTS.agentIdentity, abi: IDENTITY_ABI, functionName: "getAgent", args: [tokenId] });
  const { data: listing } = useReadContract({ address: CONTRACTS.agentMarket, abi: MARKET_ABI, functionName: "getListing", args: [tokenId] });
  if (!agent || !listing?.active) return null;
  return <AgentCard agent={{ tokenId, name: agent.name, owner: agent.owner, reputation: agent.reputation, hourlyRateUsdc: listing.hourlyRateUsdc, active: listing.active }} />;
}

export default function AgentsPage() {
  const { data: agentIds, isLoading } = useReadContract({ address: CONTRACTS.agentMarket, abi: MARKET_ABI, functionName: "getListedAgents" });

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 24px" }}>
      <NetworkBanner />
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 32 }}>
        <div>
          <h1 style={{ fontWeight: 700, fontSize: 28, color: "var(--text)", letterSpacing: "-0.02em", marginBottom: 4 }}>Agents</h1>
          <p style={{ fontSize: 14, color: "var(--muted)" }}>Browse listed AI agents on Arc testnet</p>
        </div>
        <Link href="/dashboard" className="btn btn-outline" style={{ fontSize: 13, padding: "8px 16px" }}>List my agent</Link>
      </div>

      {isLoading && <p style={{ textAlign: "center", color: "var(--muted)", padding: "64px 0" }}>Loading agents from Arc testnet...</p>}

      {agentIds && agentIds.length === 0 && (
        <div className="card" style={{ textAlign: "center", padding: 48 }}>
          <p style={{ color: "var(--muted)", marginBottom: 12 }}>No agents listed yet</p>
          <Link href="/dashboard" style={{ color: "var(--text)", fontSize: 14, fontWeight: 500 }}>Be the first to list your agent →</Link>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
        {agentIds?.map((id) => <AgentRow key={id.toString()} tokenId={id} />)}
      </div>
    </div>
  );
}
