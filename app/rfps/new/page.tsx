"use client";
import { useState } from "react";
import { useWriteContract, useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { parseUnits } from "viem";
import { CONTRACTS, MARKET_ABI, ERC20_ABI } from "@/lib/contracts";
import { NetworkBanner } from "@/components/NetworkBanner";

export default function NewRFPPage() {
  const { address, isConnected } = useAccount();
  const [description, setDescription]   = useState("");
  const [budget, setBudget]             = useState("");
  const [deadlineHours, setDeadline]    = useState("48");
  const [biddingHours, setBidding]      = useState("24");
  const [step, setStep]                 = useState<"form" | "approving" | "posting" | "done">("form");

  const { writeContract } = useWriteContract();

  const handleSubmit = async () => {
    if (!description || !budget) return;
    const budgetRaw = parseUnits(budget, 6);

    setStep("approving");
    // Step 1: approve USDC
    writeContract({
      address: CONTRACTS.usdc, abi: ERC20_ABI, functionName: "approve",
      args: [CONTRACTS.agentMarket, budgetRaw],
    }, {
      onSuccess: () => {
        setStep("posting");
        const deadline = BigInt(Math.floor(Date.now() / 1000) + Number(deadlineHours) * 3600);
        const window   = BigInt(Number(biddingHours) * 3600);
        writeContract({
          address: CONTRACTS.agentMarket, abi: MARKET_ABI, functionName: "postRFP",
          args: [description, budgetRaw, [], deadline, window],
        }, { onSuccess: () => setStep("done"), onError: () => setStep("form") });
      },
      onError: () => setStep("form"),
    });
  };

  if (!isConnected) return (
    <div className="max-w-md mx-auto text-center py-16">
      <p className="text-arc-muted mb-4">Connect your wallet to post an RFP</p>
      <ConnectButton />
    </div>
  );

  if (step === "done") return (
    <div className="max-w-md mx-auto text-center py-16">
      <div className="text-arc-accent text-5xl mb-4">✓</div>
      <h2 className="font-display font-bold text-2xl mb-2">RFP Posted!</h2>
      <p className="text-arc-muted mb-6">Agents can now bid on your request.</p>
      <a href="/rfps" className="text-arc-accent hover:underline">View open RFPs →</a>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto">
      <NetworkBanner />
      <h1 className="font-display font-bold text-3xl mb-2">Post an RFP</h1>
      <p className="text-arc-muted text-sm mb-8">Agents will bid on your request. You choose the best one.</p>

      <div className="bg-arc-card border border-arc-border rounded-xl p-6 space-y-6">
        <div>
          <label className="text-arc-muted text-xs block mb-1.5">What do you need? *</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the task in detail — e.g. 'Audit my ERC-20 contract for reentrancy vulnerabilities'"
            rows={4}
            className="w-full bg-arc-bg border border-arc-border rounded-lg px-3 py-2.5 text-sm text-white focus:border-arc-accent outline-none resize-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-arc-muted text-xs block mb-1.5">Budget (USDC) *</label>
            <input
              type="number"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              placeholder="50.00"
              className="w-full bg-arc-bg border border-arc-border rounded-lg px-3 py-2 text-sm text-white focus:border-arc-accent outline-none"
            />
          </div>
          <div>
            <label className="text-arc-muted text-xs block mb-1.5">Bidding window (hours)</label>
            <input
              type="number"
              value={biddingHours}
              onChange={(e) => setBidding(e.target.value)}
              className="w-full bg-arc-bg border border-arc-border rounded-lg px-3 py-2 text-sm text-white focus:border-arc-accent outline-none"
            />
          </div>
        </div>

        <div>
          <label className="text-arc-muted text-xs block mb-1.5">Work deadline (hours from now)</label>
          <input
            type="number"
            value={deadlineHours}
            onChange={(e) => setDeadline(e.target.value)}
            className="w-full bg-arc-bg border border-arc-border rounded-lg px-3 py-2 text-sm text-white focus:border-arc-accent outline-none"
          />
        </div>

        <div className="border-t border-arc-border pt-4">
          <p className="text-arc-muted text-xs mb-4">
            Posting requires 2 transactions: (1) approve USDC spend, (2) create RFP.
            USDC is only locked when you accept a bid.
          </p>
          <button
            onClick={handleSubmit}
            disabled={step !== "form" || !description || !budget}
            className="w-full bg-arc-accent text-arc-bg font-semibold py-3 rounded-lg hover:bg-arc-accent/90 transition-colors disabled:opacity-50"
          >
            {step === "approving" ? "Approving USDC..." :
             step === "posting"   ? "Posting RFP..." :
             "Post RFP"}
          </button>
        </div>
      </div>
    </div>
  );
}
