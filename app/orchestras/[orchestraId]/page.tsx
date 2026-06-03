"use client";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useReadContract, useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { useState } from "react";
import {
  CONTRACTS, ORCHESTRATOR_ABI, IDENTITY_ABI,
  ORCHESTRA_STATUS, ORCH_JOB_STATUS, SUBTASK_STATUS,
  formatUsdc, bpsToPercent, shortAddr, arcScan,
} from "@/lib/contracts";

/* ---- Member Row ---- */
function MemberRow({ orchestraId, member, isLead }: {
  orchestraId: bigint;
  member: { agentTokenId: bigint; splitBps: bigint; accepted: boolean };
  isLead: boolean;
}) {
  const { data: agent } = useReadContract({
    address: CONTRACTS.agentIdentity,
    abi: IDENTITY_ABI,
    functionName: "getAgent",
    args: [member.agentTokenId],
  });

  const name = agent?.name || `Agent #${member.agentTokenId.toString()}`;
  const reputation = agent?.reputation ?? 0n;
  const repPctVal = (Number(reputation) / 100).toFixed(0);

  return (
    <div style={{
      display: "grid", gridTemplateColumns: "1fr 80px 80px 80px 90px",
      alignItems: "center", padding: "12px 16px", fontSize: 13,
      borderBottom: "1px solid var(--border)",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ color: "var(--text)", fontWeight: 500 }}>{name}</span>
        <span style={{ color: "var(--muted)" }}>#{member.agentTokenId.toString()}</span>
        {isLead && (
          <span className="badge badge-purple" style={{ fontSize: 11 }}>Lead</span>
        )}
      </div>
      <div style={{ textAlign: "center", color: "var(--text)", fontWeight: 500 }}>
        {bpsToPercent(member.splitBps)}%
      </div>
      <div style={{ textAlign: "center" }}>
        {member.accepted ? (
          <span style={{ color: "#22c55e", fontWeight: 600 }}>Yes</span>
        ) : (
          <span style={{ color: "var(--muted)" }}>No</span>
        )}
      </div>
      <div style={{ textAlign: "center", color: "var(--text)" }}>
        {repPctVal}%
      </div>
      <div style={{ textAlign: "center" }}>
        {agent?.owner && (
          <a href={arcScan(agent.owner)} target="_blank" rel="noopener noreferrer"
            style={{ color: "var(--muted)", fontSize: 12, textDecoration: "none" }}>
            {shortAddr(agent.owner)}
          </a>
        )}
      </div>
    </div>
  );
}

/* ---- Sub-task Row within a Job ---- */
function SubTaskRow({ jobId, agentTokenId }: { jobId: bigint; agentTokenId: bigint }) {
  const { data: subTask } = useReadContract({
    address: CONTRACTS.agentOrchestrator,
    abi: ORCHESTRATOR_ABI,
    functionName: "getSubTask",
    args: [jobId, agentTokenId],
  });

  const { data: agent } = useReadContract({
    address: CONTRACTS.agentIdentity,
    abi: IDENTITY_ABI,
    functionName: "getAgent",
    args: [agentTokenId],
  });

  const name = agent?.name || `Agent #${agentTokenId.toString()}`;
  const status = subTask ? (SUBTASK_STATUS[subTask.status] ?? `Status ${subTask.status}`) : "Loading...";

  const statusColor = subTask?.status === 2 ? "#22c55e" : subTask?.status === 3 ? "#ef4444" : subTask?.status === 1 ? "#eab308" : "var(--muted)";

  return (
    <div style={{
      display: "flex", justifyContent: "space-between", alignItems: "center",
      padding: "8px 16px", fontSize: 13, borderBottom: "1px solid var(--border)",
    }}>
      <span style={{ color: "var(--text)" }}>{name} <span style={{ color: "var(--muted)" }}>#{agentTokenId.toString()}</span></span>
      <span style={{ color: statusColor, fontWeight: 500 }}>{status}</span>
    </div>
  );
}

/* ---- Job Row ---- */
function JobRow({ jobId, members }: {
  jobId: bigint;
  members: readonly { agentTokenId: bigint; splitBps: bigint; accepted: boolean }[];
}) {
  const { data: job } = useReadContract({
    address: CONTRACTS.agentOrchestrator,
    abi: ORCHESTRATOR_ABI,
    functionName: "getOrchestratedJob",
    args: [jobId],
  });

  const [showTasks, setShowTasks] = useState(false);

  if (!job || job.id === 0n) return null;

  const statusLabel = ORCH_JOB_STATUS[job.status] ?? `Status ${job.status}`;
  const statusBadgeClass = job.status === 2 ? "badge badge-dark" : job.status === 3 ? "badge badge-gray" : job.status === 4 ? "badge badge-gray" : "badge badge-purple";

  return (
    <div className="card" style={{ padding: 0, overflow: "hidden" }}>
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: "16px 20px", cursor: "pointer",
      }} onClick={() => setShowTasks(!showTasks)}>
        <div>
          <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text)", marginBottom: 4 }}>
            Job #{job.id.toString()}
          </div>
          <div style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.5 }}>
            {job.description || "No description"}
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: "var(--text)" }}>
            {formatUsdc(job.totalAmount)} USDC
          </span>
          <span className={statusBadgeClass}>{statusLabel}</span>
          <span style={{ color: "var(--muted)", fontSize: 13 }}>
            {job.approvedCount.toString()}/{job.totalMembers.toString()} approved
          </span>
          <span style={{ color: "var(--muted)", fontSize: 12 }}>{showTasks ? "▲" : "▼"}</span>
        </div>
      </div>

      {showTasks && (
        <div style={{ borderTop: "1px solid var(--border)" }}>
          <div style={{
            padding: "8px 16px", fontSize: 12, fontWeight: 600,
            color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.05em",
            background: "var(--surface-2)",
          }}>
            Sub-task Status
          </div>
          {members.map(m => (
            <SubTaskRow key={m.agentTokenId.toString()} jobId={job.id} agentTokenId={m.agentTokenId} />
          ))}
        </div>
      )}
    </div>
  );
}

/* ---- Accept Role Section ---- */
function AcceptRoleSection({ orchestraId, members }: {
  orchestraId: bigint;
  members: readonly { agentTokenId: bigint; splitBps: bigint; accepted: boolean }[];
}) {
  const { address } = useAccount();
  const [agentIdInput, setAgentIdInput] = useState("");
  const [error, setError] = useState("");

  const { writeContract, data: txHash, isPending } = useWriteContract();
  const { isLoading: isTxLoading, isSuccess: isTxSuccess } = useWaitForTransactionReceipt({ hash: txHash });

  // Find unaccepted members
  const pendingMembers = members.filter(m => !m.accepted);
  if (pendingMembers.length === 0) return null;

  function handleAccept() {
    setError("");
    if (!agentIdInput.trim()) { setError("Enter your agent token ID."); return; }
    const agentId = BigInt(parseInt(agentIdInput.trim()));
    const isMember = members.some(m => m.agentTokenId === agentId);
    if (!isMember) { setError("This agent is not a member of this orchestra."); return; }

    writeContract({
      address: CONTRACTS.agentOrchestrator,
      abi: ORCHESTRATOR_ABI,
      functionName: "acceptOrchestraRole",
      args: [orchestraId, agentId],
    }, {
      onError: (err) => setError(err.message.slice(0, 200)),
    });
  }

  if (isTxSuccess) {
    return (
      <div className="card" style={{ padding: 20, textAlign: "center" }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: "#22c55e", marginBottom: 8 }}>
          Role accepted successfully!
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

  return (
    <div className="card" style={{ padding: 20 }}>
      <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text)", marginBottom: 12 }}>
        Accept Orchestra Role
      </div>
      <p style={{ fontSize: 13, color: "var(--muted)", marginBottom: 12, lineHeight: 1.5 }}>
        Pending members: {pendingMembers.map(m => `#${m.agentTokenId.toString()}`).join(", ")}
      </p>
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <input
          type="number" min="1" placeholder="Your Agent ID"
          value={agentIdInput} onChange={e => setAgentIdInput(e.target.value)}
          style={{
            flex: 1, padding: "10px 14px", fontSize: 14,
            background: "var(--surface)", border: "1px solid var(--border)",
            borderRadius: 8, color: "var(--text)", outline: "none",
          }}
        />
        <button onClick={handleAccept} className="btn btn-primary" disabled={isPending || isTxLoading}
          style={{ whiteSpace: "nowrap" }}>
          {isPending ? "Confirm..." : isTxLoading ? "Waiting..." : "Accept Role"}
        </button>
      </div>
      {error && (
        <div style={{ marginTop: 8, fontSize: 13, color: "#ef4444" }}>{error}</div>
      )}
    </div>
  );
}

/* ---- Main Page ---- */
export default function OrchestraDetailPage() {
  const params = useParams();
  const orchestraId = BigInt(params.orchestraId as string);

  const { data: orch, isLoading: orchLoading } = useReadContract({
    address: CONTRACTS.agentOrchestrator,
    abi: ORCHESTRATOR_ABI,
    functionName: "getOrchestra",
    args: [orchestraId],
  });

  const { data: members } = useReadContract({
    address: CONTRACTS.agentOrchestrator,
    abi: ORCHESTRATOR_ABI,
    functionName: "getOrchestraMembers",
    args: [orchestraId],
  });

  const { data: jobIds } = useReadContract({
    address: CONTRACTS.agentOrchestrator,
    abi: ORCHESTRATOR_ABI,
    functionName: "getJobsByOrchestra",
    args: [orchestraId],
  });

  const { data: leadAgent } = useReadContract({
    address: CONTRACTS.agentIdentity,
    abi: IDENTITY_ABI,
    functionName: "getAgent",
    args: orch ? [orch.leadAgentId] : undefined,
  });

  if (orchLoading) {
    return (
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "40px 24px", color: "var(--muted)", fontSize: 14 }}>
        Loading orchestra...
      </div>
    );
  }

  if (!orch || orch.createdAt === 0n) {
    return (
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "40px 24px" }}>
        <Link href="/orchestras" style={{ fontSize: 13, color: "var(--muted)", textDecoration: "none", display: "inline-block", marginBottom: 20 }}>
          &larr; Back to Orchestras
        </Link>
        <div className="card" style={{ padding: 32, textAlign: "center", color: "var(--muted)", fontSize: 14 }}>
          Orchestra not found.
        </div>
      </div>
    );
  }

  const statusLabel = ORCHESTRA_STATUS[orch.status] ?? `Status ${orch.status}`;
  const statusBadgeClass = orch.status === 1 ? "badge badge-dark" : orch.status === 0 ? "badge badge-purple" : "badge badge-gray";
  const created = new Date(Number(orch.createdAt) * 1000);
  const leadName = leadAgent?.name || `Agent #${orch.leadAgentId.toString()}`;

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "40px 24px" }}>
      <Link href="/orchestras" style={{ fontSize: 13, color: "var(--muted)", textDecoration: "none", display: "inline-block", marginBottom: 20 }}>
        &larr; Back to Orchestras
      </Link>

      {/* Orchestra Info Card */}
      <div className="card" style={{ padding: 24, marginBottom: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 700, color: "var(--text)", marginBottom: 4, letterSpacing: "-0.02em" }}>
              Orchestra #{orch.id.toString()}
            </h1>
            <p style={{ fontSize: 14, color: "var(--muted)", lineHeight: 1.6 }}>
              {orch.description || "No description"}
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
            <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 4 }}>Lead Agent</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text)" }}>{leadName}</div>
          </div>
          <div>
            <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 4 }}>Members</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text)" }}>
              {orch.acceptedCount.toString()}/{orch.memberCount.toString()} accepted
            </div>
          </div>
          <div>
            <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 4 }}>Created</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text)" }}>{created.toLocaleDateString()}</div>
          </div>
          <div>
            <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 4 }}>Contract</div>
            <a href={arcScan(CONTRACTS.agentOrchestrator)} target="_blank" rel="noopener noreferrer"
              style={{ fontSize: 13, color: "var(--muted)", textDecoration: "none" }}>
              {shortAddr(CONTRACTS.agentOrchestrator)}
            </a>
          </div>
        </div>
      </div>

      {/* Accept Role Section */}
      {members && orch.status === 0 && (
        <div style={{ marginBottom: 24 }}>
          <AcceptRoleSection orchestraId={orchestraId} members={members} />
        </div>
      )}

      {/* Members Table */}
      <div style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: "var(--text)", marginBottom: 12, letterSpacing: "-0.01em" }}>
          Members
        </h2>
        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          {/* Header */}
          <div style={{
            display: "grid", gridTemplateColumns: "1fr 80px 80px 80px 90px",
            padding: "10px 16px", fontSize: 12, fontWeight: 600,
            color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.05em",
            background: "var(--surface-2)", borderBottom: "1px solid var(--border)",
          }}>
            <span>Agent</span>
            <span style={{ textAlign: "center" }}>Split</span>
            <span style={{ textAlign: "center" }}>Accepted</span>
            <span style={{ textAlign: "center" }}>Rep</span>
            <span style={{ textAlign: "center" }}>Owner</span>
          </div>

          {/* Rows */}
          {members && members.length > 0 ? (
            members.map((member) => (
              <MemberRow
                key={member.agentTokenId.toString()}
                orchestraId={orchestraId}
                member={member}
                isLead={member.agentTokenId === orch.leadAgentId}
              />
            ))
          ) : (
            <div style={{ padding: 20, textAlign: "center", color: "var(--muted)", fontSize: 13 }}>
              No members found.
            </div>
          )}
        </div>
      </div>

      {/* Jobs Section */}
      <div>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: "var(--text)", marginBottom: 12, letterSpacing: "-0.01em" }}>
          Orchestrated Jobs
        </h2>

        {jobIds && jobIds.length > 0 ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {jobIds.map(jobId => (
              <JobRow key={jobId.toString()} jobId={jobId} members={members ?? []} />
            ))}
          </div>
        ) : (
          <div className="card" style={{ padding: 24, textAlign: "center", color: "var(--muted)", fontSize: 14 }}>
            No orchestrated jobs yet.
          </div>
        )}
      </div>
    </div>
  );
}
