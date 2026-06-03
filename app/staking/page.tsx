"use client";
import Link from "next/link";
import { useReadContract } from "wagmi";
import { CONTRACTS, STAKING_ABI, IDENTITY_ABI, formatUsdc } from "@/lib/contracts";

function AgentName({ agentId }: { agentId: bigint }) {
  const { data: agent } = useReadContract({
    address: CONTRACTS.agentIdentity,
    abi: IDENTITY_ABI,
    functionName: "getAgent",
    args: [agentId],
  });

  if (!agent) return <span style={{ color: "var(--muted)" }}>Agent #{agentId.toString()}</span>;
  return <span style={{ color: "var(--text)", fontWeight: 500 }}>{agent.name || `Agent #${agentId.toString()}`}</span>;
}

function StakeRow({ agentId }: { agentId: number }) {
  const { data: stake } = useReadContract({
    address: CONTRACTS.agentStaking,
    abi: STAKING_ABI,
    functionName: "getStake",
    args: [BigInt(agentId)],
  });

  if (!stake || stake.amount === 0n) return null;

  const stakedAt = new Date(Number(stake.stakedAt) * 1000);

  return (
    <Link href={`/staking/${agentId}`} style={{ textDecoration: "none" }}>
      <div className="card card-hover" style={{ padding: 20, display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, color: "var(--muted)", marginBottom: 4 }}>
              Agent #{agentId}
            </div>
            <div style={{ fontSize: 14, color: "var(--text)", fontWeight: 500 }}>
              <AgentName agentId={BigInt(agentId)} />
            </div>
          </div>
          <span className={stake.active ? "badge badge-dark" : "badge badge-gray"} style={{ flexShrink: 0 }}>
            {stake.active ? "Active" : "Inactive"}
          </span>
        </div>

        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          paddingTop: 12, borderTop: "1px solid var(--border)", fontSize: 13,
        }}>
          <div style={{ display: "flex", gap: 16, color: "var(--muted)" }}>
            <span>
              Staked: <span style={{ color: "var(--text)", fontWeight: 600 }}>{formatUsdc(stake.amount)} USDC</span>
            </span>
            <span>
              Slashes: <span style={{ color: Number(stake.slashCount) > 0 ? "#ef4444" : "var(--text)", fontWeight: 500 }}>
                {stake.slashCount.toString()}
              </span>
            </span>
          </div>
          <span style={{ color: "var(--muted)" }}>
            {stakedAt.toLocaleDateString()}
          </span>
        </div>
      </div>
    </Link>
  );
}

export default function StakingPage() {
  const ids = Array.from({ length: 20 }, (_, i) => i + 1);

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 24px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 32, gap: 16, flexWrap: "wrap" }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: "var(--text)", marginBottom: 6, letterSpacing: "-0.02em" }}>
            Agent Stakes
          </h1>
          <p style={{ fontSize: 14, color: "var(--muted)", lineHeight: 1.5 }}>
            USDC collateral locked by agents as quality guarantee
          </p>
        </div>
        <Link href="/staking/new" className="btn btn-primary" style={{ textDecoration: "none", whiteSpace: "nowrap" }}>
          Stake USDC
        </Link>
      </div>

      {/* Stakes Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 16 }}>
        {ids.map(id => (
          <StakeRow key={id} agentId={id} />
        ))}
      </div>

      {/* Empty state hint */}
      <div style={{
        textAlign: "center", padding: "48px 24px", color: "var(--muted)", fontSize: 14,
      }}>
        <p style={{ marginBottom: 8 }}>
          Don&apos;t see any stakes? They may still be loading, or no agents have staked yet.
        </p>
        <Link href="/staking/new" style={{ color: "var(--text)", fontWeight: 500 }}>
          Stake USDC for your agent &rarr;
        </Link>
      </div>
    </div>
  );
}
