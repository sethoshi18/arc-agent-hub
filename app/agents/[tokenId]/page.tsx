"use client";
import { useParams } from "next/navigation";
import { useReadContract } from "wagmi";
import { CONTRACTS, IDENTITY_ABI, MARKET_ABI, formatUsdc, shortAddr, arcScan, repPct } from "@/lib/contracts";
import { ReputationBadge } from "@/components/ReputationBadge";
import Link from "next/link";

export default function AgentDetailPage() {
  const params = useParams();
  const tokenId = BigInt(params.tokenId as string);
  const { data: agent } = useReadContract({ address: CONTRACTS.agentIdentity, abi: IDENTITY_ABI, functionName: "getAgent", args: [tokenId] });
  const { data: listing } = useReadContract({ address: CONTRACTS.agentMarket, abi: MARKET_ABI, functionName: "getListing", args: [tokenId] });

  if (!agent) return <div style={{ maxWidth: 1100, margin: "0 auto", padding: "64px 24px", textAlign: "center", color: "var(--muted)" }}>Loading agent #{tokenId.toString()}...</div>;

  return (
    <div style={{ maxWidth: 700, margin: "0 auto", padding: "40px 24px" }}>
      <Link href="/agents" style={{ fontSize: 13, color: "var(--muted)", textDecoration: "none", marginBottom: 20, display: "inline-block" }}>← Back to agents</Link>

      <div className="card" style={{ padding: 28 }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 20 }}>
          <div>
            <h1 style={{ fontWeight: 700, fontSize: 24, color: "var(--text)", letterSpacing: "-0.02em", marginBottom: 4 }}>{agent.name}</h1>
            <a href={arcScan(agent.owner)} target="_blank" style={{ fontSize: 12, color: "var(--muted)", fontFamily: "JetBrains Mono,monospace", textDecoration: "none" }}>
              {shortAddr(agent.owner)} ↗
            </a>
          </div>
          <ReputationBadge bps={agent.reputation} size="lg" />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, borderTop: "1px solid var(--border)", paddingTop: 20 }}>
          <div>
            <p style={{ fontSize: 11, color: "var(--muted)", marginBottom: 4, textTransform: "uppercase", letterSpacing: ".08em" }}>Token ID</p>
            <p style={{ fontWeight: 600, color: "var(--text)", fontFamily: "JetBrains Mono,monospace", fontSize: 14 }}>#{tokenId.toString()}</p>
          </div>
          <div>
            <p style={{ fontSize: 11, color: "var(--muted)", marginBottom: 4, textTransform: "uppercase", letterSpacing: ".08em" }}>Status</p>
            <span className={`badge ${agent.active ? "badge-dark" : "badge-gray"}`}>{agent.active ? "Active" : "Inactive"}</span>
          </div>
          <div>
            <p style={{ fontSize: 11, color: "var(--muted)", marginBottom: 4, textTransform: "uppercase", letterSpacing: ".08em" }}>Reputation</p>
            <p style={{ fontWeight: 600, color: "var(--text)", fontSize: 14 }}>{repPct(agent.reputation)}%</p>
          </div>
          <div>
            <p style={{ fontSize: 11, color: "var(--muted)", marginBottom: 4, textTransform: "uppercase", letterSpacing: ".08em" }}>Hourly Rate</p>
            <p style={{ fontWeight: 600, color: "var(--text)", fontSize: 14 }}>{listing?.active ? `${formatUsdc(listing.hourlyRateUsdc)} USDC` : "Not listed"}</p>
          </div>
        </div>

        <div style={{ borderTop: "1px solid var(--border)", paddingTop: 16, marginTop: 20 }}>
          <a href={`https://testnet.arcscan.app/address/${CONTRACTS.agentIdentity}`} target="_blank"
            style={{ fontSize: 12, color: "var(--muted)", textDecoration: "none" }}>
            View contract on ArcScan ↗
          </a>
        </div>
      </div>
    </div>
  );
}
