"use client";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useReadContract, useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { useState } from "react";
import { parseUnits } from "viem";
import {
  CONTRACTS, STAKING_ABI, IDENTITY_ABI,
  WITHDRAWAL_STATUS,
  formatUsdc, shortAddr, arcScan,
} from "@/lib/contracts";

/* ---- Withdrawal Row ---- */
function WithdrawalRow({ requestId }: { requestId: bigint }) {
  const { data: req } = useReadContract({
    address: CONTRACTS.agentStaking,
    abi: STAKING_ABI,
    functionName: "getWithdrawalRequest",
    args: [requestId],
  });

  const { writeContract: writeComplete, data: completeTxHash, isPending: isCompletePending } = useWriteContract();
  const { isLoading: isCompleteLoading, isSuccess: isCompleteSuccess } = useWaitForTransactionReceipt({ hash: completeTxHash });

  const { writeContract: writeCancel, data: cancelTxHash, isPending: isCancelPending } = useWriteContract();
  const { isLoading: isCancelLoading, isSuccess: isCancelSuccess } = useWaitForTransactionReceipt({ hash: cancelTxHash });

  if (!req || req.id === 0n) return null;

  const statusLabel = WITHDRAWAL_STATUS[req.status] ?? `Status ${req.status}`;
  const statusBadgeClass = req.status === 1 ? "badge badge-purple" : req.status === 2 ? "badge badge-dark" : "badge badge-gray";
  const requestedAt = new Date(Number(req.requestedAt) * 1000);

  function handleComplete() {
    writeComplete({
      address: CONTRACTS.agentStaking,
      abi: STAKING_ABI,
      functionName: "completeWithdrawal",
      args: [requestId],
    });
  }

  function handleCancel() {
    writeCancel({
      address: CONTRACTS.agentStaking,
      abi: STAKING_ABI,
      functionName: "cancelWithdrawal",
      args: [requestId],
    });
  }

  return (
    <div style={{
      display: "flex", justifyContent: "space-between", alignItems: "center",
      padding: "12px 16px", fontSize: 13,
      borderBottom: "1px solid var(--border)",
    }}>
      <div style={{ display: "flex", gap: 16, alignItems: "center", flex: 1 }}>
        <span style={{ color: "var(--muted)" }}>#{req.id.toString()}</span>
        <span style={{ color: "var(--text)", fontWeight: 500 }}>{formatUsdc(req.amount)} USDC</span>
        <span className={statusBadgeClass} style={{ fontSize: 11 }}>{statusLabel}</span>
        <span style={{ color: "var(--muted)" }}>{requestedAt.toLocaleDateString()}</span>
      </div>
      {req.status === 1 && (
        <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
          <button onClick={handleComplete} className="btn btn-primary" disabled={isCompletePending || isCompleteLoading}
            style={{ fontSize: 12, padding: "4px 12px" }}>
            {isCompleteSuccess ? "Done" : isCompletePending ? "Confirm..." : isCompleteLoading ? "Completing..." : "Complete"}
          </button>
          <button onClick={handleCancel} disabled={isCancelPending || isCancelLoading}
            style={{
              fontSize: 12, padding: "4px 12px", cursor: "pointer",
              background: "var(--surface)", border: "1px solid var(--border)",
              borderRadius: 6, color: "var(--muted)",
            }}>
            {isCancelSuccess ? "Cancelled" : isCancelPending ? "Confirm..." : isCancelLoading ? "Cancelling..." : "Cancel"}
          </button>
        </div>
      )}
      {(isCompleteSuccess && completeTxHash) && (
        <a href={arcScan(completeTxHash, "tx")} target="_blank" rel="noopener noreferrer"
          style={{ fontSize: 12, color: "var(--muted)", marginLeft: 8 }}>Tx &rarr;</a>
      )}
      {(isCancelSuccess && cancelTxHash) && (
        <a href={arcScan(cancelTxHash, "tx")} target="_blank" rel="noopener noreferrer"
          style={{ fontSize: 12, color: "var(--muted)", marginLeft: 8 }}>Tx &rarr;</a>
      )}
    </div>
  );
}

/* ---- Request Withdrawal Section ---- */
function RequestWithdrawalSection({ agentTokenId }: { agentTokenId: bigint }) {
  const { isConnected } = useAccount();
  const [amount, setAmount] = useState("");
  const [error, setError] = useState("");

  const { writeContract, data: txHash, isPending } = useWriteContract();
  const { isLoading: isTxLoading, isSuccess: isTxSuccess } = useWaitForTransactionReceipt({ hash: txHash });

  if (!isConnected) return null;

  function handleRequest() {
    setError("");
    if (!amount.trim() || parseFloat(amount) <= 0) { setError("Amount must be greater than 0."); return; }

    const withdrawAmount = parseUnits(amount.trim(), 6);

    writeContract({
      address: CONTRACTS.agentStaking,
      abi: STAKING_ABI,
      functionName: "requestWithdrawal",
      args: [agentTokenId, withdrawAmount],
    }, {
      onError: (err) => setError(err.message.slice(0, 200)),
    });
  }

  if (isTxSuccess) {
    return (
      <div className="card" style={{ padding: 20, textAlign: "center" }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: "#22c55e", marginBottom: 8 }}>
          Withdrawal requested successfully!
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
    flex: 1, padding: "10px 14px", fontSize: 14,
    background: "var(--surface)", border: "1px solid var(--border)",
    borderRadius: 8, color: "var(--text)", outline: "none",
  };

  return (
    <div className="card" style={{ padding: 20 }}>
      <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text)", marginBottom: 12 }}>
        Request Withdrawal
      </div>
      <p style={{ fontSize: 13, color: "var(--muted)", marginBottom: 12, lineHeight: 1.5 }}>
        Request to withdraw staked USDC. There may be a cooldown period before you can complete the withdrawal.
      </p>
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <input
          type="number" min="0.01" step="0.01" placeholder="Amount (USDC)"
          value={amount} onChange={e => setAmount(e.target.value)}
          style={inputStyle}
        />
        <button onClick={handleRequest} className="btn btn-primary" disabled={isPending || isTxLoading}
          style={{ whiteSpace: "nowrap" }}>
          {isPending ? "Confirm..." : isTxLoading ? "Requesting..." : "Request"}
        </button>
      </div>
      {error && (
        <div style={{ marginTop: 8, fontSize: 13, color: "#ef4444" }}>{error}</div>
      )}
    </div>
  );
}

/* ---- Main Page ---- */
export default function StakeDetailPage() {
  const params = useParams();
  const agentTokenId = BigInt(params.agentId as string);

  const { data: stake, isLoading: stakeLoading } = useReadContract({
    address: CONTRACTS.agentStaking,
    abi: STAKING_ABI,
    functionName: "getStake",
    args: [agentTokenId],
  });

  const { data: withdrawalIds } = useReadContract({
    address: CONTRACTS.agentStaking,
    abi: STAKING_ABI,
    functionName: "getWithdrawalsByAgent",
    args: [agentTokenId],
  });

  const { data: agent } = useReadContract({
    address: CONTRACTS.agentIdentity,
    abi: IDENTITY_ABI,
    functionName: "getAgent",
    args: [agentTokenId],
  });

  if (stakeLoading) {
    return (
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "40px 24px", color: "var(--muted)", fontSize: 14 }}>
        Loading stake...
      </div>
    );
  }

  if (!stake || stake.amount === 0n) {
    return (
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "40px 24px" }}>
        <Link href="/staking" style={{ fontSize: 13, color: "var(--muted)", textDecoration: "none", display: "inline-block", marginBottom: 20 }}>
          &larr; Back to Agent Stakes
        </Link>
        <div className="card" style={{ padding: 32, textAlign: "center", color: "var(--muted)", fontSize: 14 }}>
          No stake found for this agent.
        </div>
      </div>
    );
  }

  const stakedAt = new Date(Number(stake.stakedAt) * 1000);
  const agentName = agent?.name || `Agent #${agentTokenId.toString()}`;

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "40px 24px" }}>
      <Link href="/staking" style={{ fontSize: 13, color: "var(--muted)", textDecoration: "none", display: "inline-block", marginBottom: 20 }}>
        &larr; Back to Agent Stakes
      </Link>

      {/* Stake Info Card */}
      <div className="card" style={{ padding: 24, marginBottom: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 700, color: "var(--text)", marginBottom: 4, letterSpacing: "-0.02em" }}>
              {agentName}
            </h1>
            <p style={{ fontSize: 14, color: "var(--muted)" }}>
              Agent #{agentTokenId.toString()} &middot; Stake Details
            </p>
          </div>
          <span className={stake.active ? "badge badge-dark" : "badge badge-gray"} style={{ flexShrink: 0 }}>
            {stake.active ? "Active" : "Inactive"}
          </span>
        </div>

        <div style={{
          display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
          gap: 16, paddingTop: 16, borderTop: "1px solid var(--border)",
        }}>
          <div>
            <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 4 }}>Staked Amount</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text)" }}>{formatUsdc(stake.amount)} USDC</div>
          </div>
          <div>
            <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 4 }}>Staked Since</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text)" }}>{stakedAt.toLocaleDateString()}</div>
          </div>
          <div>
            <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 4 }}>Slash Count</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: Number(stake.slashCount) > 0 ? "#ef4444" : "var(--text)" }}>
              {stake.slashCount.toString()}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 4 }}>Contract</div>
            <a href={arcScan(CONTRACTS.agentStaking)} target="_blank" rel="noopener noreferrer"
              style={{ fontSize: 13, color: "var(--muted)", textDecoration: "none" }}>
              {shortAddr(CONTRACTS.agentStaking)}
            </a>
          </div>
        </div>
      </div>

      {/* Request Withdrawal */}
      {stake.active && (
        <div style={{ marginBottom: 24 }}>
          <RequestWithdrawalSection agentTokenId={agentTokenId} />
        </div>
      )}

      {/* Withdrawal History */}
      <div>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: "var(--text)", marginBottom: 12, letterSpacing: "-0.01em" }}>
          Withdrawal History
        </h2>

        {withdrawalIds && withdrawalIds.length > 0 ? (
          <div className="card" style={{ padding: 0, overflow: "hidden" }}>
            <div style={{
              padding: "10px 16px", fontSize: 12, fontWeight: 600,
              color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.05em",
              background: "var(--surface-2)", borderBottom: "1px solid var(--border)",
            }}>
              Withdrawal Requests
            </div>
            {withdrawalIds.map(reqId => (
              <WithdrawalRow key={reqId.toString()} requestId={reqId} />
            ))}
          </div>
        ) : (
          <div className="card" style={{ padding: 24, textAlign: "center", color: "var(--muted)", fontSize: 14 }}>
            No withdrawal requests yet.
          </div>
        )}
      </div>
    </div>
  );
}
