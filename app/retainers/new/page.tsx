"use client";
import { useState } from "react";
import Link from "next/link";
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { parseUnits } from "viem";
import { CONTRACTS, RETAINER_ABI, arcScan } from "@/lib/contracts";

type Step = "form" | "creating" | "done";

export default function CreatePlanPage() {
  const { isConnected } = useAccount();
  const [step, setStep] = useState<Step>("form");

  const [agentTokenId, setAgentTokenId] = useState("");
  const [priceUsdc, setPriceUsdc] = useState("");
  const [intervalHours, setIntervalHours] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");

  const { writeContract, data: txHash, isPending } = useWriteContract();
  const { isLoading: isTxLoading, isSuccess: isTxSuccess } = useWaitForTransactionReceipt({ hash: txHash });

  if (isTxSuccess && step === "creating") {
    setStep("done");
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!isConnected) { setError("Connect your wallet first."); return; }
    if (!agentTokenId.trim()) { setError("Agent Token ID is required."); return; }
    if (!priceUsdc.trim() || parseFloat(priceUsdc) <= 0) { setError("Price must be greater than 0."); return; }
    if (!intervalHours.trim() || parseInt(intervalHours) < 1) { setError("Interval must be at least 1 hour."); return; }
    if (!description.trim()) { setError("Description is required."); return; }

    const agentId = BigInt(parseInt(agentTokenId.trim()));
    const price = parseUnits(priceUsdc.trim(), 6);
    const interval = BigInt(parseInt(intervalHours.trim()) * 3600);

    setStep("creating");

    writeContract({
      address: CONTRACTS.agentRetainer,
      abi: RETAINER_ABI,
      functionName: "createPlan",
      args: [agentId, price, interval, description.trim()],
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

  return (
    <div style={{ maxWidth: 620, margin: "0 auto", padding: "40px 24px" }}>
      <Link href="/retainers" style={{ fontSize: 13, color: "var(--muted)", textDecoration: "none", display: "inline-block", marginBottom: 20 }}>
        &larr; Back to Subscription Plans
      </Link>

      <h1 style={{ fontSize: 24, fontWeight: 700, color: "var(--text)", marginBottom: 6, letterSpacing: "-0.02em" }}>
        Create Subscription Plan
      </h1>
      <p style={{ fontSize: 14, color: "var(--muted)", marginBottom: 32, lineHeight: 1.5 }}>
        Set up a recurring USDC payment plan for your agent. Clients can subscribe and get charged automatically each interval.
      </p>

      {!isConnected && (
        <div className="card" style={{ padding: 24, textAlign: "center", color: "var(--muted)", fontSize: 14 }}>
          Connect your wallet to create a subscription plan.
        </div>
      )}

      {isConnected && step === "form" && (
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div>
            <label style={labelStyle}>Agent Token ID</label>
            <input type="number" min="1" value={agentTokenId} onChange={e => setAgentTokenId(e.target.value)}
              placeholder="e.g. 1" required style={inputStyle} />
            <p style={hintStyle}>The agent token ID that will provide the subscription service.</p>
          </div>

          <div>
            <label style={labelStyle}>Price (USDC)</label>
            <input type="number" min="0.01" step="0.01" value={priceUsdc} onChange={e => setPriceUsdc(e.target.value)}
              placeholder="e.g. 50.00" required style={inputStyle} />
            <p style={hintStyle}>Amount in USDC charged per billing interval.</p>
          </div>

          <div>
            <label style={labelStyle}>Interval (Hours)</label>
            <input type="number" min="1" value={intervalHours} onChange={e => setIntervalHours(e.target.value)}
              placeholder="e.g. 720 (30 days)" required style={inputStyle} />
            <p style={hintStyle}>Billing interval in hours. 24 = daily, 168 = weekly, 720 = monthly.</p>
          </div>

          <div>
            <label style={labelStyle}>Description</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)}
              placeholder="Describe what subscribers receive..." rows={4} required
              style={{ ...inputStyle, resize: "vertical" }} />
          </div>

          {error && (
            <div style={{ padding: "10px 14px", background: "rgba(220,38,38,0.1)", border: "1px solid rgba(220,38,38,0.3)",
              borderRadius: 8, fontSize: 13, color: "#ef4444" }}>
              {error}
            </div>
          )}

          <button type="submit" className="btn btn-primary" disabled={isPending}
            style={{ width: "100%", padding: "12px 0", fontSize: 14, fontWeight: 600 }}>
            {isPending ? "Confirm in wallet..." : "Create Plan"}
          </button>
        </form>
      )}

      {isConnected && step === "creating" && (
        <div className="card" style={{ padding: 32, textAlign: "center" }}>
          <div style={{ fontSize: 16, fontWeight: 600, color: "var(--text)", marginBottom: 8 }}>
            Creating subscription plan...
          </div>
          <p style={{ fontSize: 13, color: "var(--muted)" }}>
            {isTxLoading ? "Waiting for transaction confirmation..." : "Confirm the transaction in your wallet."}
          </p>
          {txHash && (
            <a href={arcScan(txHash, "tx")} target="_blank" rel="noopener noreferrer"
              style={{ fontSize: 13, color: "var(--muted)", display: "inline-block", marginTop: 12 }}>
              View on ArcScan &rarr;
            </a>
          )}
        </div>
      )}

      {isConnected && step === "done" && (
        <div className="card" style={{ padding: 32, textAlign: "center" }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: "var(--text)", marginBottom: 8 }}>
            Plan Created
          </div>
          <p style={{ fontSize: 14, color: "var(--muted)", marginBottom: 16 }}>
            Clients can now subscribe to your recurring payment plan.
          </p>
          {txHash && (
            <a href={arcScan(txHash, "tx")} target="_blank" rel="noopener noreferrer"
              style={{ fontSize: 13, color: "var(--muted)", display: "inline-block", marginBottom: 16 }}>
              View transaction on ArcScan &rarr;
            </a>
          )}
          <div>
            <Link href="/retainers" className="btn btn-primary" style={{ textDecoration: "none" }}>
              View Plans
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
