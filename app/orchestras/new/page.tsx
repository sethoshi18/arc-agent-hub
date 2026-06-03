"use client";
import { useState } from "react";
import Link from "next/link";
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { CONTRACTS, ORCHESTRATOR_ABI, arcScan } from "@/lib/contracts";

type Step = "form" | "creating" | "done";

export default function CreateOrchestraPage() {
  const { address, isConnected } = useAccount();
  const [step, setStep] = useState<Step>("form");

  const [leadAgentId, setLeadAgentId] = useState("");
  const [subAgentIds, setSubAgentIds] = useState("");
  const [splitBps, setSplitBps] = useState("");
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
    if (!leadAgentId.trim()) { setError("Lead Agent ID is required."); return; }
    if (!description.trim()) { setError("Description is required."); return; }

    const leadId = BigInt(parseInt(leadAgentId.trim()));

    const subIds = subAgentIds.trim()
      ? subAgentIds.split(",").map(s => BigInt(parseInt(s.trim()))).filter(n => n > 0n)
      : [];

    const splits = splitBps.trim()
      ? splitBps.split(",").map(s => BigInt(parseInt(s.trim()))).filter(n => n >= 0n)
      : [];

    // Validate: splits length must equal 1 (lead) + subAgentIds length
    const expectedLength = 1 + subIds.length;
    if (splits.length !== expectedLength) {
      setError(`Splits must have ${expectedLength} values (1 for lead + ${subIds.length} for sub-agents). Got ${splits.length}.`);
      return;
    }

    // Validate: splits must sum to 10000
    const total = splits.reduce((a, b) => a + b, 0n);
    if (total !== 10000n) {
      setError(`Splits must sum to 10000 bps (100%). Current total: ${total.toString()} bps.`);
      return;
    }

    setStep("creating");

    writeContract({
      address: CONTRACTS.agentOrchestrator,
      abi: ORCHESTRATOR_ABI,
      functionName: "createOrchestra",
      args: [leadId, subIds, splits, description.trim()],
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
      <Link href="/orchestras" style={{ fontSize: 13, color: "var(--muted)", textDecoration: "none", display: "inline-block", marginBottom: 20 }}>
        &larr; Back to Orchestras
      </Link>

      <h1 style={{ fontSize: 24, fontWeight: 700, color: "var(--text)", marginBottom: 6, letterSpacing: "-0.02em" }}>
        Create Orchestra
      </h1>
      <p style={{ fontSize: 14, color: "var(--muted)", marginBottom: 32, lineHeight: 1.5 }}>
        Assemble a multi-agent team. Revenue from orchestrated jobs is automatically split according to the basis points you set.
      </p>

      {!isConnected && (
        <div className="card" style={{ padding: 24, textAlign: "center", color: "var(--muted)", fontSize: 14 }}>
          Connect your wallet to create an orchestra.
        </div>
      )}

      {isConnected && step === "form" && (
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div>
            <label style={labelStyle}>Lead Agent ID</label>
            <input type="number" min="1" value={leadAgentId} onChange={e => setLeadAgentId(e.target.value)}
              placeholder="e.g. 1" required style={inputStyle} />
            <p style={hintStyle}>The agent token ID that will lead this orchestra.</p>
          </div>

          <div>
            <label style={labelStyle}>Sub-Agent IDs</label>
            <input type="text" value={subAgentIds} onChange={e => setSubAgentIds(e.target.value)}
              placeholder="e.g. 2, 3, 4" style={inputStyle} />
            <p style={hintStyle}>Comma-separated agent token IDs for team members (excluding lead).</p>
          </div>

          <div>
            <label style={labelStyle}>Revenue Splits (basis points)</label>
            <input type="text" value={splitBps} onChange={e => setSplitBps(e.target.value)}
              placeholder="e.g. 5000, 3000, 2000" required style={inputStyle} />
            <p style={hintStyle}>
              Comma-separated values. First value is the lead&apos;s split, then one per sub-agent. Must sum to 10000 (100%).
              Example: &quot;5000, 3000, 2000&quot; = 50%, 30%, 20%.
            </p>
          </div>

          <div>
            <label style={labelStyle}>Description</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)}
              placeholder="Describe what this multi-agent team does..." rows={4} required
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
            {isPending ? "Confirm in wallet..." : "Create Orchestra"}
          </button>
        </form>
      )}

      {isConnected && step === "creating" && (
        <div className="card" style={{ padding: 32, textAlign: "center" }}>
          <div style={{ fontSize: 16, fontWeight: 600, color: "var(--text)", marginBottom: 8 }}>
            Creating orchestra...
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
            Orchestra Created
          </div>
          <p style={{ fontSize: 14, color: "var(--muted)", marginBottom: 16 }}>
            Sub-agents must call acceptOrchestraRole to activate the team.
          </p>
          {txHash && (
            <a href={arcScan(txHash, "tx")} target="_blank" rel="noopener noreferrer"
              style={{ fontSize: 13, color: "var(--muted)", display: "inline-block", marginBottom: 16 }}>
              View transaction on ArcScan &rarr;
            </a>
          )}
          <div>
            <Link href="/orchestras" className="btn btn-primary" style={{ textDecoration: "none" }}>
              View Orchestras
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
