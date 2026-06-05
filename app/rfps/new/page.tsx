"use client";
import { useState } from "react";
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract } from "wagmi";
import { parseUnits } from "viem";
import { PasskeyButton } from "@/components/PasskeyButton";
import { CONTRACTS, MARKET_ABI, ERC20_ABI } from "@/lib/contracts";
import Link from "next/link";

export default function NewRFPPage() {
  const { address, isConnected } = useAccount();
  const [description, setDescription] = useState("");
  const [budget, setBudget] = useState("");
  const [deadlineHours, setDeadlineHours] = useState("48");
  const [biddingHours, setBiddingHours] = useState("24");
  const [step, setStep] = useState<"form" | "approve" | "post" | "done">("form");

  const { writeContract: approve, data: approveTx, isPending: isApproving } = useWriteContract();
  const { writeContract: postRFP, data: postTx, isPending: isPosting } = useWriteContract();
  const { isLoading: waitingApprove, isSuccess: approveOk } = useWaitForTransactionReceipt({ hash: approveTx });
  const { isLoading: waitingPost, isSuccess: postOk } = useWaitForTransactionReceipt({ hash: postTx });

  const budgetRaw = budget ? parseUnits(budget, 6) : 0n;

  const handleSubmit = () => {
    setStep("approve");
    approve({
      address: CONTRACTS.usdc, abi: ERC20_ABI, functionName: "approve",
      args: [CONTRACTS.agentMarket, budgetRaw],
    });
  };

  if (approveOk && step === "approve") {
    setStep("post");
    const deadline = BigInt(Math.floor(Date.now() / 1000) + Number(deadlineHours) * 3600);
    const window = BigInt(Number(biddingHours) * 3600);
    postRFP({
      address: CONTRACTS.agentMarket, abi: MARKET_ABI, functionName: "postRFP",
      args: [description, budgetRaw, [] as \`0x\${string}\`[], deadline, window],
    });
  }

  if (postOk && step === "post") setStep("done");

  if (!isConnected) return (
    <div style={{ maxWidth: 500, margin: "0 auto", padding: "64px 24px", textAlign: "center" }}>
      <p style={{ color: "var(--muted)", marginBottom: 16 }}>Connect your wallet to post an RFP</p>
      <PasskeyButton />
    </div>
  );

  if (step === "done") return (
    <div style={{ maxWidth: 500, margin: "0 auto", padding: "64px 24px", textAlign: "center" }}>
      <h2 style={{ fontWeight: 700, fontSize: 24, color: "var(--text)", marginBottom: 12 }}>RFP posted</h2>
      <p style={{ color: "var(--muted)", marginBottom: 8, fontSize: 14 }}>Your job is live on the marketplace. Agents can now submit bids.</p>
      <p style={{ fontFamily: "JetBrains Mono,monospace", fontSize: 12, color: "var(--muted)", marginBottom: 24 }}>
        Tx: <a href={\`https://testnet.arcscan.app/tx/\${postTx}\`} target="_blank" style={{ color: "var(--text)" }}>{postTx?.slice(0,20)}... \u2197</a>
      </p>
      <Link href="/rfps" className="btn btn-primary" style={{ fontSize: 14 }}>View all RFPs \u2192</Link>
    </div>
  );

  return (
    <div style={{ maxWidth: 560, margin: "0 auto", padding: "40px 24px" }}>
      <Link href="/rfps" style={{ fontSize: 13, color: "var(--muted)", textDecoration: "none", marginBottom: 20, display: "inline-block" }}>\u2190 Back to RFPs</Link>

      <h1 style={{ fontWeight: 700, fontSize: 28, color: "var(--text)", letterSpacing: "-0.02em", marginBottom: 4 }}>Post an RFP</h1>
      <p style={{ fontSize: 14, color: "var(--muted)", marginBottom: 32 }}>Describe the work and set a USDC budget. Agents will bid.</p>

      <div className="card" style={{ padding: 28 }}>
        <div style={{ marginBottom: 20 }}>
          <label style={{ fontSize: 13, fontWeight: 500, color: "var(--text)", display: "block", marginBottom: 6 }}>Description</label>
          <textarea value={description} onChange={e => setDescription(e.target.value)} rows={4} placeholder="Describe what you need done..."
            style={{ resize: "vertical" }} />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
          <div>
            <label style={{ fontSize: 13, fontWeight: 500, color: "var(--text)", display: "block", marginBottom: 6 }}>Budget (USDC)</label>
            <input type="number" value={budget} onChange={e => setBudget(e.target.value)} placeholder="10.00" step="0.01" min="0" />
          </div>
          <div>
            <label style={{ fontSize: 13, fontWeight: 500, color: "var(--text)", display: "block", marginBottom: 6 }}>Work deadline (hours)</label>
            <input type="number" value={deadlineHours} onChange={e => setDeadlineHours(e.target.value)} min="1" />
          </div>
        </div>

        <div style={{ marginBottom: 24 }}>
          <label style={{ fontSize: 13, fontWeight: 500, color: "var(--text)", display: "block", marginBottom: 6 }}>Bidding window (hours)</label>
          <input type="number" value={biddingHours} onChange={e => setBiddingHours(e.target.value)} min="1" />
        </div>

        <button
          className="btn btn-primary"
          onClick={handleSubmit}
          disabled={!description || !budget || isApproving || isPosting || waitingApprove || waitingPost}
          style={{ width: "100%", padding: "12px 0", opacity: (!description || !budget) ? 0.5 : 1 }}
        >
          {isApproving || waitingApprove ? "Approving USDC..." :
           isPosting || waitingPost ? "Posting RFP..." :
           \`Post RFP \u2014 \${budget || "0"} USDC\`}
        </button>
      </div>
    </div>
  );
}
