"use client";
import Link from "next/link";
import { useReadContract } from "wagmi";
import { CONTRACTS, IDENTITY_ABI, PLAN_STATUS, formatUsdc } from "@/lib/contracts";

type PlanData = {
  id: bigint;
  agentTokenId: bigint;
  priceUsdc: bigint;
  intervalSeconds: bigint;
  description: string;
  status: number;
  createdAt: bigint;
  subscriberCount: bigint;
};

function formatInterval(seconds: bigint): string {
  const s = Number(seconds);
  if (s >= 86400) {
    const days = Math.floor(s / 86400);
    return days === 1 ? "1 day" : `${days} days`;
  }
  const hours = Math.floor(s / 3600);
  return hours === 1 ? "1 hour" : `${hours} hours`;
}

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

function statusBadge(status: number) {
  if (status === 0) return "badge badge-dark";
  return "badge badge-gray";
}

export function PlanCard({ plan }: { plan: PlanData }) {
  const statusLabel = PLAN_STATUS[plan.status] ?? `Status ${plan.status}`;

  return (
    <Link href={`/retainers/${plan.id.toString()}`} style={{ textDecoration: "none" }}>
      <div className="card card-hover" style={{ padding: 20, display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, color: "var(--muted)", marginBottom: 4 }}>
              Plan #{plan.id.toString()}
            </div>
            <div style={{
              fontSize: 14, color: "var(--text)", lineHeight: 1.5,
              overflow: "hidden", textOverflow: "ellipsis",
              display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as const,
            }}>
              {plan.description || "No description"}
            </div>
          </div>
          <span className={statusBadge(plan.status)} style={{ flexShrink: 0 }}>
            {statusLabel}
          </span>
        </div>

        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          paddingTop: 12, borderTop: "1px solid var(--border)", fontSize: 13,
        }}>
          <div style={{ display: "flex", gap: 16, color: "var(--muted)" }}>
            <span>
              <span style={{ color: "var(--text)", fontWeight: 600 }}>{formatUsdc(plan.priceUsdc)} USDC</span>
              {" / "}{formatInterval(plan.intervalSeconds)}
            </span>
            <span>
              Subscribers: <span style={{ color: "var(--text)", fontWeight: 500 }}>{plan.subscriberCount.toString()}</span>
            </span>
          </div>
          <div style={{ fontSize: 13 }}>
            <AgentName agentId={plan.agentTokenId} />
          </div>
        </div>
      </div>
    </Link>
  );
}
