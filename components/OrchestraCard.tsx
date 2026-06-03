"use client";
import Link from "next/link";
import { useReadContract } from "wagmi";
import { CONTRACTS, IDENTITY_ABI, ORCHESTRA_STATUS, bpsToPercent } from "@/lib/contracts";

type OrchestraData = {
  id: bigint;
  leadAgentId: bigint;
  description: string;
  status: number;
  createdAt: bigint;
  memberCount: bigint;
  acceptedCount: bigint;
};

function statusBadge(status: number) {
  const label = ORCHESTRA_STATUS[status] ?? `Status ${status}`;
  if (status === 1) return "badge badge-dark";
  if (status === 0) return "badge badge-purple";
  return "badge badge-gray";
}

function LeadAgentName({ agentId }: { agentId: bigint }) {
  const { data: agent } = useReadContract({
    address: CONTRACTS.agentIdentity,
    abi: IDENTITY_ABI,
    functionName: "getAgent",
    args: [agentId],
  });

  if (!agent) return <span style={{ color: "var(--muted)" }}>Agent #{agentId.toString()}</span>;
  return <span style={{ color: "var(--text)", fontWeight: 500 }}>{agent.name || `Agent #${agentId.toString()}`}</span>;
}

export function OrchestraCard({ orchestra }: { orchestra: OrchestraData }) {
  const statusLabel = ORCHESTRA_STATUS[orchestra.status] ?? `Status ${orchestra.status}`;
  const created = new Date(Number(orchestra.createdAt) * 1000);

  return (
    <Link href={`/orchestras/${orchestra.id.toString()}`} style={{ textDecoration: "none" }}>
      <div className="card card-hover" style={{ padding: 20, display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, color: "var(--muted)", marginBottom: 4 }}>
              Orchestra #{orchestra.id.toString()}
            </div>
            <div style={{
              fontSize: 14, color: "var(--text)", lineHeight: 1.5,
              overflow: "hidden", textOverflow: "ellipsis",
              display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as const,
            }}>
              {orchestra.description || "No description"}
            </div>
          </div>
          <span className={statusBadge(orchestra.status)} style={{ flexShrink: 0 }}>
            {statusLabel}
          </span>
        </div>

        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          paddingTop: 12, borderTop: "1px solid var(--border)", fontSize: 13,
        }}>
          <div style={{ display: "flex", gap: 16, color: "var(--muted)" }}>
            <span>
              Members: <span style={{ color: "var(--text)", fontWeight: 500 }}>
                {orchestra.acceptedCount.toString()}/{orchestra.memberCount.toString()}
              </span>
            </span>
            <span>
              {created.toLocaleDateString()}
            </span>
          </div>
          <div style={{ fontSize: 13 }}>
            Lead: <LeadAgentName agentId={orchestra.leadAgentId} />
          </div>
        </div>
      </div>
    </Link>
  );
}
