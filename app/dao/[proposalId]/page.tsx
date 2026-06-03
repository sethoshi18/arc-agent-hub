"use client";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useReadContract, useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { useState } from "react";
import {
  CONTRACTS, DAO_ABI, IDENTITY_ABI,
  PROPOSAL_TYPE, PROPOSAL_STATUS, VOTE_CHOICE,
  formatUsdc, shortAddr, arcScan,
} from "@/lib/contracts";

/* ---- Vote Section ---- */
function VoteSection({ proposalId }: { proposalId: bigint }) {
  const { isConnected } = useAccount();
  const [agentIdInput, setAgentIdInput] = useState("");
  const [selectedChoice, setSelectedChoice] = useState<number | null>(null);
  const [error, setError] = useState("");

  const { writeContract, data: txHash, isPending } = useWriteContract();
  const { isLoading: isTxLoading, isSuccess: isTxSuccess } = useWaitForTransactionReceipt({ hash: txHash });

  if (!isConnected) return null;

  function handleVote() {
    setError("");
    if (!agentIdInput.trim()) { setError("Enter your agent token ID."); return; }
    if (selectedChoice === null) { setError("Select a vote choice."); return; }

    const agentId = BigInt(parseInt(agentIdInput.trim()));

    writeContract({
      address: CONTRACTS.agentDAO,
      abi: DAO_ABI,
      functionName: "vote",
      args: [proposalId, agentId, selectedChoice],
    }, {
      onError: (err) => setError(err.message.slice(0, 200)),
    });
  }

  if (isTxSuccess) {
    return (
      <div className="card" style={{ padding: 20, textAlign: "center" }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: "#22c55e", marginBottom: 8 }}>
          Vote submitted successfully!
        </div>
        {txHash && (
          <a href={arcScan(txHash, "tx")} target="_blank" rel="noopener noreferrer"
            style={{ fontSize: 13, color: "var(--muted)" }}>
            View on ArcScan &rarr;
          </a>
        )}
      </div>
    );
  }

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "10px 14px", fontSize: 14,
    background: "var(--surface)", border: "1px solid var(--border)",
    borderRadius: 8, color: "var(--text)", outline: "none",
  };

  const choiceButtonStyle = (choice: number): React.CSSProperties => ({
    flex: 1, padding: "10px 0", fontSize: 13, fontWeight: 600, cursor: "pointer",
    borderRadius: 8, border: selectedChoice === choice ? "2px solid var(--text)" : "1px solid var(--border)",
    background: selectedChoice === choice ? "var(--surface-2)" : "var(--surface)",
    color: choice === 1 ? "var(--text)" : choice === 0 ? "#ef4444" : "var(--muted)",
    transition: "all .15s",
  });

  return (
    <div className="card" style={{ padding: 20 }}>
      <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text)", marginBottom: 12 }}>
        Cast Your Vote
      </div>

      <div style={{ marginBottom: 12 }}>
        <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--text)", marginBottom: 6 }}>
          Agent Token ID
        </label>
        <input
          type="number" min="1" placeholder="Your Agent ID"
          value={agentIdInput} onChange={e => setAgentIdInput(e.target.value)}
          style={inputStyle}
        />
      </div>

      <div style={{ marginBottom: 12 }}>
        <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--text)", marginBottom: 6 }}>
          Vote
        </label>
        <div style={{ display: "flex", gap: 8 }}>
          <button type="button" onClick={() => setSelectedChoice(1)} style={choiceButtonStyle(1)}>
            For
          </button>
          <button type="button" onClick={() => setSelectedChoice(0)} style={choiceButtonStyle(0)}>
            Against
          </button>
          <button type="button" onClick={() => setSelectedChoice(2)} style={choiceButtonStyle(2)}>
            Abstain
          </button>
        </div>
      </div>

      <button onClick={handleVote} className="btn btn-primary" disabled={isPending || isTxLoading}
        style={{ width: "100%", padding: "10px 0", fontSize: 14, fontWeight: 600 }}>
        {isPending ? "Confirm in wallet..." : isTxLoading ? "Submitting..." : "Submit Vote"}
      </button>

      {error && (
        <div style={{ marginTop: 8, fontSize: 13, color: "#ef4444" }}>{error}</div>
      )}
    </div>
  );
}

/* ---- Dispute Info Section ---- */
function DisputeInfoSection({ proposalId }: { proposalId: bigint }) {
  const { data: dispute } = useReadContract({
    address: CONTRACTS.agentDAO,
    abi: DAO_ABI,
    functionName: "getDisputeInfo",
    args: [proposalId],
  });

  const { data: disputedAgent } = useReadContract({
    address: CONTRACTS.agentIdentity,
    abi: IDENTITY_ABI,
    functionName: "getAgent",
    args: dispute ? [dispute.disputedAgentId] : undefined,
  });

  if (!dispute) return null;

  const disputedName = disputedAgent?.name || `Agent #${dispute.disputedAgentId.toString()}`;
  const outcomeLabels: Record<number, string> = { 0: "Pending", 1: "Resolved - Client Wins", 2: "Resolved - Agent Wins", 3: "Resolved - Split" };
  const outcomeLabel = outcomeLabels[dispute.outcome] ?? `Outcome ${dispute.outcome}`;

  return (
    <div className="card" style={{ padding: 20 }}>
      <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text)", marginBottom: 12 }}>
        Dispute Details
      </div>
      <div style={{
        display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
        gap: 12, fontSize: 13,
      }}>
        <div>
          <div style={{ color: "var(--muted)", marginBottom: 4 }}>Disputed Agent</div>
          <div style={{ color: "var(--text)", fontWeight: 500 }}>{disputedName}</div>
        </div>
        <div>
          <div style={{ color: "var(--muted)", marginBottom: 4 }}>Job ID</div>
          <div style={{ color: "var(--text)", fontWeight: 500 }}>{dispute.jobId.toString()}</div>
        </div>
        <div>
          <div style={{ color: "var(--muted)", marginBottom: 4 }}>Contract Type</div>
          <div style={{ color: "var(--text)", fontWeight: 500 }}>{dispute.jobContractType.toString()}</div>
        </div>
        <div>
          <div style={{ color: "var(--muted)", marginBottom: 4 }}>Client</div>
          <a href={arcScan(dispute.client)} target="_blank" rel="noopener noreferrer"
            style={{ color: "var(--text)", fontWeight: 500, textDecoration: "none" }}>
            {shortAddr(dispute.client)}
          </a>
        </div>
        <div>
          <div style={{ color: "var(--muted)", marginBottom: 4 }}>Escrow</div>
          <div style={{ color: "var(--text)", fontWeight: 500 }}>{formatUsdc(dispute.escrowAmount)} USDC</div>
        </div>
        <div>
          <div style={{ color: "var(--muted)", marginBottom: 4 }}>Outcome</div>
          <div style={{ color: "var(--text)", fontWeight: 500 }}>{outcomeLabel}</div>
        </div>
      </div>
    </div>
  );
}

/* ---- Main Page ---- */
export default function ProposalDetailPage() {
  const params = useParams();
  const proposalId = BigInt(params.proposalId as string);

  const { data: proposal, isLoading: proposalLoading } = useReadContract({
    address: CONTRACTS.agentDAO,
    abi: DAO_ABI,
    functionName: "getProposal",
    args: [proposalId],
  });

  const { data: proposerAgent } = useReadContract({
    address: CONTRACTS.agentIdentity,
    abi: IDENTITY_ABI,
    functionName: "getAgent",
    args: proposal ? [proposal.proposerAgentId] : undefined,
  });

  const { writeContract: writeExecute, data: executeTxHash, isPending: isExecutePending } = useWriteContract();
  const { isLoading: isExecuteLoading, isSuccess: isExecuteSuccess } = useWaitForTransactionReceipt({ hash: executeTxHash });

  const { isConnected } = useAccount();

  if (proposalLoading) {
    return (
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "40px 24px", color: "var(--muted)", fontSize: 14 }}>
        Loading proposal...
      </div>
    );
  }

  if (!proposal || proposal.createdAt === 0n) {
    return (
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "40px 24px" }}>
        <Link href="/dao" style={{ fontSize: 13, color: "var(--muted)", textDecoration: "none", display: "inline-block", marginBottom: 20 }}>
          &larr; Back to Governance
        </Link>
        <div className="card" style={{ padding: 32, textAlign: "center", color: "var(--muted)", fontSize: 14 }}>
          Proposal not found.
        </div>
      </div>
    );
  }

  const statusLabel = PROPOSAL_STATUS[proposal.status] ?? `Status ${proposal.status}`;
  const statusBadgeClass = proposal.status === 0 ? "badge badge-dark" : proposal.status === 1 ? "badge badge-dark" : proposal.status === 3 ? "badge badge-purple" : "badge badge-gray";
  const typeLabel = PROPOSAL_TYPE[proposal.proposalType] ?? `Type ${proposal.proposalType}`;
  const typeBadgeClass = proposal.proposalType === 1 ? "badge badge-purple" : "badge badge-dark";
  const created = new Date(Number(proposal.createdAt) * 1000);
  const votingEnds = new Date(Number(proposal.votingEndsAt) * 1000);
  const isVotingActive = proposal.status === 0 && votingEnds.getTime() > Date.now();
  const isVotingEnded = votingEnds.getTime() <= Date.now();
  const canExecute = isConnected && (proposal.status === 1) && !proposal.executed;
  const proposerName = proposerAgent?.name || `Agent #${proposal.proposerAgentId.toString()}`;

  const totalVotes = Number(proposal.forVotes) + Number(proposal.againstVotes) + Number(proposal.abstainVotes);
  const forPct = totalVotes > 0 ? (Number(proposal.forVotes) / totalVotes) * 100 : 0;
  const againstPct = totalVotes > 0 ? (Number(proposal.againstVotes) / totalVotes) * 100 : 0;
  const abstainPct = totalVotes > 0 ? (Number(proposal.abstainVotes) / totalVotes) * 100 : 0;

  function handleExecute() {
    writeExecute({
      address: CONTRACTS.agentDAO,
      abi: DAO_ABI,
      functionName: "executeProposal",
      args: [proposalId],
    });
  }

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "40px 24px" }}>
      <Link href="/dao" style={{ fontSize: 13, color: "var(--muted)", textDecoration: "none", display: "inline-block", marginBottom: 20 }}>
        &larr; Back to Governance
      </Link>

      {/* Proposal Info Card */}
      <div className="card" style={{ padding: 24, marginBottom: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
          <div>
            <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 4 }}>
              <h1 style={{ fontSize: 20, fontWeight: 700, color: "var(--text)", letterSpacing: "-0.02em" }}>
                Proposal #{proposal.id.toString()}
              </h1>
              <span className={typeBadgeClass} style={{ fontSize: 11 }}>{typeLabel}</span>
            </div>
            <p style={{ fontSize: 14, color: "var(--muted)", lineHeight: 1.6 }}>
              {proposal.description || "No description"}
            </p>
          </div>
          <span className={statusBadgeClass} style={{ flexShrink: 0 }}>
            {statusLabel}
          </span>
        </div>

        <div style={{
          display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
          gap: 16, paddingTop: 16, borderTop: "1px solid var(--border)",
        }}>
          <div>
            <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 4 }}>Proposer</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text)" }}>{proposerName}</div>
          </div>
          <div>
            <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 4 }}>Created</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text)" }}>{created.toLocaleDateString()}</div>
          </div>
          <div>
            <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 4 }}>Voting Ends</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: isVotingEnded ? "#ef4444" : "var(--text)" }}>
              {votingEnds.toLocaleDateString()} {votingEnds.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 4 }}>Voters</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text)" }}>{proposal.voterCount.toString()}</div>
          </div>
          <div>
            <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 4 }}>Contract</div>
            <a href={arcScan(CONTRACTS.agentDAO)} target="_blank" rel="noopener noreferrer"
              style={{ fontSize: 13, color: "var(--muted)", textDecoration: "none" }}>
              {shortAddr(CONTRACTS.agentDAO)}
            </a>
          </div>
        </div>
      </div>

      {/* Vote Tally Visualization */}
      <div className="card" style={{ padding: 20, marginBottom: 24 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text)", marginBottom: 16 }}>
          Vote Tally
        </div>

        {totalVotes > 0 ? (
          <>
            {/* Bar visualization */}
            <div style={{
              display: "flex", height: 12, borderRadius: 6, overflow: "hidden",
              background: "var(--surface-2)", marginBottom: 16,
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

            {/* Vote counts */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 20, fontWeight: 700, color: "var(--text)", marginBottom: 4 }}>
                  {proposal.forVotes.toString()}
                </div>
                <div style={{ fontSize: 12, color: "var(--muted)" }}>
                  For ({forPct.toFixed(1)}%)
                </div>
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 20, fontWeight: 700, color: "#ef4444", marginBottom: 4 }}>
                  {proposal.againstVotes.toString()}
                </div>
                <div style={{ fontSize: 12, color: "var(--muted)" }}>
                  Against ({againstPct.toFixed(1)}%)
                </div>
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 20, fontWeight: 700, color: "var(--muted)", marginBottom: 4 }}>
                  {proposal.abstainVotes.toString()}
                </div>
                <div style={{ fontSize: 12, color: "var(--muted)" }}>
                  Abstain ({abstainPct.toFixed(1)}%)
                </div>
              </div>
            </div>
          </>
        ) : (
          <div style={{ textAlign: "center", color: "var(--muted)", fontSize: 14, padding: "16px 0" }}>
            No votes cast yet.
          </div>
        )}
      </div>

      {/* Vote Form (only if voting is active) */}
      {isVotingActive && (
        <div style={{ marginBottom: 24 }}>
          <VoteSection proposalId={proposalId} />
        </div>
      )}

      {/* Execute Button */}
      {canExecute && (
        <div style={{ marginBottom: 24 }}>
          <div className="card" style={{ padding: 20, textAlign: "center" }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text)", marginBottom: 8 }}>
              Proposal Passed
            </div>
            <p style={{ fontSize: 13, color: "var(--muted)", marginBottom: 12 }}>
              Voting has ended and the proposal passed. Execute it to apply the decision.
            </p>
            <button onClick={handleExecute} className="btn btn-primary" disabled={isExecutePending || isExecuteLoading}
              style={{ padding: "10px 32px", fontSize: 14, fontWeight: 600 }}>
              {isExecuteSuccess ? "Executed!" : isExecutePending ? "Confirm in wallet..." : isExecuteLoading ? "Executing..." : "Execute Proposal"}
            </button>
            {isExecuteSuccess && executeTxHash && (
              <div style={{ marginTop: 8 }}>
                <a href={arcScan(executeTxHash, "tx")} target="_blank" rel="noopener noreferrer"
                  style={{ fontSize: 13, color: "var(--muted)" }}>
                  View on ArcScan &rarr;
                </a>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Dispute Info (only for dispute proposals) */}
      {proposal.proposalType === 1 && (
        <div style={{ marginBottom: 24 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: "var(--text)", marginBottom: 12, letterSpacing: "-0.01em" }}>
            Dispute Information
          </h2>
          <DisputeInfoSection proposalId={proposalId} />
        </div>
      )}
    </div>
  );
}
