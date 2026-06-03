"use client";
import { useState } from "react";
import Link from "next/link";
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { parseUnits } from "viem";
import { CONTRACTS, STAKING_ABI, ERC20_ABI, arcScan } from "@/lib/contracts";

type Step = "form" | "approving" | "staking" | "done";

export default function StakeNewPage() {
  const { isConnected } = useAccount();
  const [step, setStep] = useState<Step>("form");

  const [agentTokenId, setAgentTokenId] = useState("");
  const [amount, setAmount] = useState("");
  const [error, setError] = useState("");

  const { writeContract: writeApprove, data: approveTxHash, isPending: isApprovePending } = useWriteContract();
  const { isLoading: isApproveLoading, isSuccess: isApproveSuccess } = useWaitForTransactionReceipt({ hash: approveTxHash });

  const { writeContract: writeStake, data: stakeTxHash, isPending: isStakePending } = useWriteContract();
  const { isLoading: isStakeLoading, isSuccess: isStakeSuccess } = useWaitForTransactionReceipt({ hash: stakeTxHash });

  if (isApproveSuccess && step === "approving") {
    setStep("staking");
    const agentId = BigInt(parseInt(agentTokenId.trim()));
    const stakeAmount = parseUnits(amount.trim(), 6);

    writeStake({
      address: CONTRACTS.agentStaking,
      abi: STAKING_ABI,
      functionName: "stake",
      args: [agentId, stakeAmount],
    }, {
      onError: (err) => {
        setError(err.message.slice(0, 200));
        setStep("form");
      },
    });
  }

  if (isStakeSuccess && step === "staking") {
    setStep("done");
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!isConnected) { setError("Connect your wallet first."); return; }
    if (!agentTokenId.trim()) { setError("Agent Token ID is required."); return; }
    if (!amount.trim() || parseFloat(amount) <= 0) { setError("Amount must be greater than 0."); return; }

    const stakeAmount = parseUnits(amount.trim(), 6);

    setStep("approving");

    writeApprove({
      address: CONTRACTS.usdc,
      abi: ERC20_ABI,
      functionName: "approve",
      args: [CONTRACTS.agentStaking, stakeAmount],
    }, {
      onError: (err) => {
        setError(err.message.slice(0, 200));
        setStep("form");
      },
    });
  }

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "10px 14px", fontSize: 14,
    background: "var(--surface)", border: "1px solid var(--border)",
    borderRadius: 8, color: "var(--text)", outline: "none",
  };

  const labelStyle: React.CSSProperties = {
    display: "block", fontSize: 13, fontWeight: 600,
    color: "var(--text)", marginBottom: 6,
  };

  const hintStyle: React.CSSProperties = {
    fontSize: 12, color: "var(--muted)", marginTop: 4,
  };

  const finalTxHash = stakeTxHash || approveTxHash;

  return (
    <div style={{ maxWidth: 620, margin: "0 auto", padding: "40px 24px" }}>
      <Link href="/staking" style={{ fontSize: 13, color: "var(--muted)", textDecoration: "none", display: "inline-block", marginBottom: 20 }}>
        &larr; Back to Agent Stakes
      </Link>

      <h1 style={{ fontSize: 24, fontWeight: 700, color: "var(--text)", marginBottom: 6, letterSpacing: "-0.02em" }}>
        Stake USDC
      </h1>
      <p style={{ fontSize: 14, color: "var(--muted)", marginBottom: 32, lineHeight: 1.5 }}>
        Lock USDC as collateral for your agent. Stakes serve as a quality guarantee and can be slashed for bad behavior.
      </p>

      {!isConnected && (
        <div className="card" style={{ padding: 24, textAlign: "center", color: "var(--muted)", fontSize: 14 }}>
          Connect your wallet to stake USDC.
        </div>
      )}

      {isConnected && step === "form" && (
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div>
            <label style={labelStyle}>Agent Token ID</label>
            <input type="number" min="1" value={agentTokenId} onChange={e => setAgentTokenId(e.target.value)}
              placeholder="e.g. 1" required style={inputStyle} />
            <p style={hintStyle}>The agent token ID to stake for.</p>
          </div>

          <div>
            <label style={labelStyle}>Amount (USDC)</label>
            <input type="number" min="0.01" step="0.01" value={amount} onChange={e => setAmount(e.target.value)}
              placeholder="e.g. 100.00" required style={inputStyle} />
            <p style={hintStyle}>Amount of USDC to lock as collateral.</p>
          </div>

          {error && (
            <div style={{ padding: "10px 14px", background: "rgba(220,38,38,0.1)", border: "1px solid rgba(220,38,38,0.3)",
              borderRadius: 8, fontSize: 13, color: "#ef4444" }}>
              {error}
            </div>
          )}

          <button type="submit" className="btn btn-primary" disabled={isApprovePending}
            style={{ width: "100%", padding: "12px 0", fontSize: 14, fontWeight: 600 }}>
            {isApprovePending ? "Confirm in wallet..." : "Approve & Stake"}
          </button>
        </form>
      )}

      {isConnected && (step === "approving" || step === "staking") && (
        <div className="card" style={{ padding: 32, textAlign: "center" }}>
          <div style={{ fontSize: 16, fontWeight: 600, color: "var(--text)", marginBottom: 8 }}>
            {step === "approving" ? "Approving USDC..." : "Staking USDC..."}
          </div>
          <p style={{ fontSize: 13, color: "var(--muted)" }}>
            {(isApproveLoading || isStakeLoading) ? "Waiting for transaction confirmation..." : "Confirm the transaction in your wallet."}
          </p>
          {finalTxHash && (
            <a href={arcScan(finalTxHash, "tx")} target="_blank" rel="noopener noreferrer"
              style={{ fontSize: 13, color: "var(--muted)", display: "inline-block", marginTop: 12 }}>
              View on ArcScan &rarr;
            </a>
          )}
        </div>
      )}

      {isConnected && step === "done" && (
        <div className="card" style={{ padding: 32, textAlign: "center" }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: "var(--text)", marginBottom: 8 }}>
            USDC Staked
          </div>
          <p style={{ fontSize: 14, color: "var(--muted)", marginBottom: 16 }}>
            Your agent now has USDC collateral locked as a quality guarantee.
          </p>
          {stakeTxHash && (
            <a href={arcScan(stakeTxHash, "tx")} target="_blank" rel="noopener noreferrer"
              style={{ fontSize: 13, color: "var(--muted)", display: "inline-block", marginBottom: 16 }}>
              View transaction on ArcScan &rarr;
            </a>
          )}
          <div>
            <Link href="/staking" className="btn btn-primary" style={{ textDecoration: "none" }}>
              View Stakes
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
