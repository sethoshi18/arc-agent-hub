"use client";
import Link from "next/link";
import { useReadContract } from "wagmi";
import { CONTRACTS, IDENTITY_ABI, PROPOSAL_TYPE, PROPOSAL_STATUS } from "@/lib/contracts";

type ProposalData = {
  id: bigint;
  proposerAgentId: bigint;
  proposalType: number;
  description: string;
  status: number;
  createdAt: bigint;
  votingEndsAt: bigint;
  forVotes: bigint;
  againstVotes: bigint;
  abstainVotes: bigint;
  voterCount: bigint;
  executed: boolean;
};

function ProposerName({ agentId }: { agentId: bigint }) {
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
  if (status === 1) return "badge badge-dark";
  if (status === 3) return "badge badge-purple";
  return "badge badge-gray";
}

function typeBadge(proposalType: number) {
  if (proposalType === 1) return "badge badge-purple";
  return "badge badge-dark";
}

export function ProposalCard({ proposal }: { proposal: ProposalData }) {
  const statusLabel = PROPOSAL_STATUS[proposal.status] ?? `Status ${proposal.status}`;
  const typeLabel = PROPOSAL_TYPE[proposal.proposalType] ?? `Type ${proposal.proposalType}`;
  const totalVotes = Number(proposal.forVotes) + Number(proposal.againstVotes) + Number(proposal.abstainVotes);
  const forPct = totalVotes > 0 ? (Number(proposal.forVotes) / totalVotes) * 100 : 0;
  const againstPct = totalVotes > 0 ? (Number(proposal.againstVotes) / totalVotes) * 100 : 0;
  const abstainPct = totalVotes > 0 ? (Number(proposal.abstainVotes) / totalVotes) * 100 : 0;
  const votingEnds = new Date(Number(proposal.votingEndsAt) * 1000);
  const isExpired = votingEnds.getTime() < Date.now();

  return (
    <Link href={`/dao/${proposal.id.toString()}`} style={{ textDecoration: "none" }}>
      <div className="card card-hover" style={{ padding: 20, display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 4 }}>
              <span style={{ fontSize: 13, color: "var(--muted)" }}>
                Proposal #{proposal.id.toString()}
              </span>
              <span className={typeBadge(proposal.proposalType)} style={{ fontSize: 11 }}>
                {typeLabel}
              </span>
            </div>
            <div style={{
              fontSize: 14, color: "var(--text)", lineHeight: 1.5,
              overflow: "hidden", textOverflow: "ellipsis",
              display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as const,
            }}>
              {proposal.description || "No description"}
            </div>
          </div>
          <span className={statusBadge(proposal.status)} style={{ flexShrink: 0 }}>
            {statusLabel}
          </span>
        </div>

        {/* Vote bar */}
        {totalVotes > 0 && (
          <div>
            <div style={{
              display: "flex", height: 6, borderRadius: 3, overflow: "hidden",
              background: "var(--surface-2)",
            }}>
              {forPct > 0 && (
                <div style={{ width: `${forPct}%`, background: "var(--text)", transition: "width 0.3s" }} />
              )}
              {againstPct > 0 && (
                <div style={{ width: `${againstPct}%`, background: "#ef4444", transition: "width 0.3s" }} />
              )}
              {abstainPct > 0 && (
                <div style={{ width: `${abstainPct}%`, background: "var(--border)", transition: "width 0.3s" }} />
              )}
            </div>
            <div style={{ display: "flex", gap: 12, marginTop: 6, fontSize: 12, color: "var(--muted)" }}>
              <span>For: <span style={{ color: "var(--text)", fontWeight: 500 }}>{forPct.toFixed(0)}%</span></span>
              <span>Against: <span style={{ color: "#ef4444", fontWeight: 500 }}>{againstPct.toFixed(0)}%</span></span>
              <span>Abstain: <span style={{ fontWeight: 500 }}>{abstainPct.toFixed(0)}%</span></span>
            </div>
          </div>
        )}

        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          paddingTop: 12, borderTop: "1px solid var(--border)", fontSize: 13,
        }}>
          <div style={{ display: "flex", gap: 16, color: "var(--muted)" }}>
            <span>
              Voters: <span style={{ color: "var(--text)", fontWeight: 500 }}>{proposal.voterCount.toString()}</span>
            </span>
            <span>
              {isExpired ? "Ended" : "Ends"}: <span style={{ color: "var(--text)", fontWeight: 500 }}>{votingEnds.toLocaleDateString()}</span>
            </span>
          </div>
          <div style={{ fontSize: 13 }}>
            <ProposerName agentId={proposal.proposerAgentId} />
          </div>
        </div>
      </div>
    </Link>
  );
}
