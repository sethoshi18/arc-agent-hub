"use client";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useReadContract, useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { useState } from "react";
import {
  CONTRACTS, RETAINER_ABI, IDENTITY_ABI, ERC20_ABI,
  PLAN_STATUS, SUBSCRIPTION_STATUS,
  formatUsdc, shortAddr, arcScan,
} from "@/lib/contracts";

/* ---- Format interval for display ---- */
function formatInterval(seconds: bigint): string {
  const s = Number(seconds);
  if (s >= 86400) {
    const days = Math.floor(s / 86400);
    return days === 1 ? "1 day" : `${days} days`;
  }
  const hours = Math.floor(s / 3600);
  return hours === 1 ? "1 hour" : `${hours} hours`;
}

/* ---- Subscription Row ---- */
function SubRow({ subscriptionId, planOwner }: { subscriptionId: bigint; planOwner: boolean }) {
  const { data: sub } = useReadContract({
    address: CONTRACTS.agentRetainer,
    abi: RETAINER_ABI,
    functionName: "getSubscription",
    args: [subscriptionId],
  });

  const { writeContract, data: txHash, isPending } = useWriteContract();
  const { isLoading: isTxLoading, isSuccess: isTxSuccess } = useWaitForTransactionReceipt({ hash: txHash });

  if (!sub || sub.id === 0n) return null;

  const statusLabel = SUBSCRIPTION_STATUS[sub.status] ?? `Status ${sub.status}`;
  const statusBadgeClass = sub.status === 0 ? "badge badge-dark" : sub.status === 1 ? "badge badge-gray" : "badge badge-purple";
  const started = new Date(Number(sub.startedAt) * 1000);
  const lastCharged = Number(sub.lastChargedAt) > 0 ? new Date(Number(sub.lastChargedAt) * 1000) : null;

  function handleCharge() {
    writeContract({
      address: CONTRACTS.agentRetainer,
      abi: RETAINER_ABI,
      functionName: "charge",
      args: [subscriptionId],
    });
  }

  return (
    <div style={{
      display: "flex", justifyContent: "space-between", alignItems: "center",
      padding: "12px 16px", fontSize: 13,
      borderBottom: "1px solid var(--border)",
    }}>
      <div style={{ display: "flex", gap: 16, alignItems: "center", flex: 1, minWidth: 0 }}>
        <a href={arcScan(sub.client)} target="_blank" rel="noopener noreferrer"
          style={{ color: "var(--text)", fontWeight: 500, textDecoration: "none" }}>
          {shortAddr(sub.client)}
        </a>
        <span className={statusBadgeClass} style={{ fontSize: 11 }}>
          {statusLabel}
        </span>
        <span style={{ color: "var(--muted)" }}>
          Cycles: <span style={{ color: "var(--text)", fontWeight: 500 }}>{sub.cycleCount.toString()}</span>
        </span>
        <span style={{ color: "var(--muted)" }}>
          Total: <span style={{ color: "var(--text)", fontWeight: 500 }}>{formatUsdc(sub.totalCharged)} USDC</span>
        </span>
        <span style={{ color: "var(--muted)" }}>
          Started: {started.toLocaleDateString()}
        </span>
        {lastCharged && (
          <span style={{ color: "var(--muted)" }}>
            Last: {lastCharged.toLocaleDateString()}
          </span>
        )}
      </div>
      {planOwner && sub.status === 0 && (
        <button onClick={handleCharge} className="btn btn-primary" disabled={isPending || isTxLoading}
          style={{ fontSize: 12, padding: "4px 12px", flexShrink: 0 }}>
          {isTxSuccess ? "Charged" : isPending ? "Confirm..." : isTxLoading ? "Charging..." : "Charge"}
        </button>
      )}
      {isTxSuccess && txHash && (
        <a href={arcScan(txHash, "tx")} target="_blank" rel="noopener noreferrer"
          style={{ fontSize: 12, color: "var(--muted)", marginLeft: 8 }}>
          Tx &rarr;
        </a>
      )}
    </div>
  );
}

/* ---- Subscribe Section ---- */
function SubscribeSection({ planId, priceUsdc }: { planId: bigint; priceUsdc: bigint }) {
  const { isConnected } = useAccount();
  const [subStep, setSubStep] = useState<"idle" | "approving" | "subscribing" | "done">("idle");
  const [error, setError] = useState("");

  const { writeContract: writeApprove, data: approveTxHash, isPending: isApprovePending } = useWriteContract();
  const { isLoading: isApproveLoading, isSuccess: isApproveSuccess } = useWaitForTransactionReceipt({ hash: approveTxHash });

  const { writeContract: writeSub, data: subTxHash, isPending: isSubPending } = useWriteContract();
  const { isLoading: isSubLoading, isSuccess: isSubSuccess } = useWaitForTransactionReceipt({ hash: subTxHash });

  if (isApproveSuccess && subStep === "approving") {
    setSubStep("subscribing");
    writeSub({
      address: CONTRACTS.agentRetainer,
      abi: RETAINER_ABI,
      functionName: "subscribe",
      args: [planId],
    }, {
      onError: (err) => { setError(err.message.slice(0, 200)); setSubStep("idle"); },
    });
  }

  if (isSubSuccess && subStep === "subscribing") {
    setSubStep("done");
  }

  if (!isConnected) return null;

  function handleSubscribe() {
    setError("");
    setSubStep("approving");
    writeApprove({
      address: CONTRACTS.usdc,
      abi: ERC20_ABI,
      functionName: "approve",
      args: [CONTRACTS.agentRetainer, priceUsdc],
    }, {
      onError: (err) => { setError(err.message.slice(0, 200)); setSubStep("idle"); },
    });
  }

  if (subStep === "done") {
    return (
      <div className="card" style={{ padding: 20, textAlign: "center" }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: "#22c55e", marginBottom: 8 }}>
          Subscribed successfully!
        </div>
        {subTxHash && (
          <a href={arcScan(subTxHash, "tx")} target="_blank" rel="noopener noreferrer"
            style={{ fontSize: 13, color: "var(--muted)" }}>
            View on ArcScan &rarr;
          </a>
        )}
      </div>
    );
  }

  const isWorking = isApprovePending || isApproveLoading || isSubPending || isSubLoading;
  let buttonLabel = "Subscribe";
  if (isApprovePending) buttonLabel = "Approve USDC...";
  if (isApproveLoading) buttonLabel = "Approving...";
  if (isSubPending) buttonLabel = "Confirm subscribe...";
  if (isSubLoading) buttonLabel = "Subscribing...";

  return (
    <div className="card" style={{ padding: 20 }}>
      <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text)", marginBottom: 8 }}>
        Subscribe to this Plan
      </div>
      <p style={{ fontSize: 13, color: "var(--muted)", marginBottom: 12, lineHeight: 1.5 }}>
        Approve {formatUsdc(priceUsdc)} USDC and subscribe. You will be charged each billing interval.
      </p>
      <button onClick={handleSubscribe} className="btn btn-primary" disabled={isWorking}
        style={{ width: "100%", padding: "10px 0", fontSize: 14, fontWeight: 600 }}>
        {buttonLabel}
      </button>
      {error && (
        <div style={{ marginTop: 8, fontSize: 13, color: "#ef4444" }}>{error}</div>
      )}
    </div>
  );
}

/* ---- Main Page ---- */
export default function PlanDetailPage() {
  const params = useParams();
  const planId = BigInt(params.planId as string);

  const { data: plan, isLoading: planLoading } = useReadContract({
    address: CONTRACTS.agentRetainer,
    abi: RETAINER_ABI,
    functionName: "getPlan",
    args: [planId],
  });

  const { data: subscriptionIds } = useReadContract({
    address: CONTRACTS.agentRetainer,
    abi: RETAINER_ABI,
    functionName: "getSubscriptionsByPlan",
    args: [planId],
  });

  const { data: agent } = useReadContract({
    address: CONTRACTS.agentIdentity,
    abi: IDENTITY_ABI,
    functionName: "getAgent",
    args: plan ? [plan.agentTokenId] : undefined,
  });

  if (planLoading) {
    return (
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "40px 24px", color: "var(--muted)", fontSize: 14 }}>
        Loading plan...
      </div>
    );
  }

  if (!plan || plan.createdAt === 0n) {
    return (
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "40px 24px" }}>
        <Link href="/retainers" style={{ fontSize: 13, color: "var(--muted)", textDecoration: "none", display: "inline-block", marginBottom: 20 }}>
          &larr; Back to Subscription Plans
        </Link>
        <div className="card" style={{ padding: 32, textAlign: "center", color: "var(--muted)", fontSize: 14 }}>
          Plan not found.
        </div>
      </div>
    );
  }

  const statusLabel = PLAN_STATUS[plan.status] ?? `Status ${plan.status}`;
  const statusBadgeClass = plan.status === 0 ? "badge badge-dark" : "badge badge-gray";
  const created = new Date(Number(plan.createdAt) * 1000);
  const agentName = agent?.name || `Agent #${plan.agentTokenId.toString()}`;

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "40px 24px" }}>
      <Link href="/retainers" style={{ fontSize: 13, color: "var(--muted)", textDecoration: "none", display: "inline-block", marginBottom: 20 }}>
        &larr; Back to Subscription Plans
      </Link>

      {/* Plan Info Card */}
      <div className="card" style={{ padding: 24, marginBottom: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 700, color: "var(--text)", marginBottom: 4, letterSpacing: "-0.02em" }}>
              Plan #{plan.id.toString()}
            </h1>
            <p style={{ fontSize: 14, color: "var(--muted)", lineHeight: 1.6 }}>
              {plan.description || "No description"}
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
            <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 4 }}>Agent</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text)" }}>{agentName}</div>
          </div>
          <div>
            <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 4 }}>Price</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text)" }}>{formatUsdc(plan.priceUsdc)} USDC</div>
          </div>
          <div>
            <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 4 }}>Interval</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text)" }}>{formatInterval(plan.intervalSeconds)}</div>
          </div>
          <div>
            <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 4 }}>Subscribers</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text)" }}>{plan.subscriberCount.toString()}</div>
          </div>
          <div>
            <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 4 }}>Created</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text)" }}>{created.toLocaleDateString()}</div>
          </div>
          <div>
            <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 4 }}>Contract</div>
            <a href={arcScan(CONTRACTS.agentRetainer)} target="_blank" rel="noopener noreferrer"
              style={{ fontSize: 13, color: "var(--muted)", textDecoration: "none" }}>
              {shortAddr(CONTRACTS.agentRetainer)}
            </a>
          </div>
        </div>
      </div>

      {/* Subscribe Section */}
      {plan.status === 0 && (
        <div style={{ marginBottom: 24 }}>
          <SubscribeSection planId={planId} priceUsdc={plan.priceUsdc} />
        </div>
      )}

      {/* Subscribers List */}
      <div>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: "var(--text)", marginBottom: 12, letterSpacing: "-0.01em" }}>
          Subscribers
        </h2>

        {subscriptionIds && subscriptionIds.length > 0 ? (
          <div className="card" style={{ padding: 0, overflow: "hidden" }}>
            <div style={{
              padding: "10px 16px", fontSize: 12, fontWeight: 600,
              color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.05em",
              background: "var(--surface-2)", borderBottom: "1px solid var(--border)",
            }}>
              Active Subscriptions
            </div>
            {subscriptionIds.map(subId => (
              <SubRow key={subId.toString()} subscriptionId={subId} planOwner={true} />
            ))}
          </div>
        ) : (
          <div className="card" style={{ padding: 24, textAlign: "center", color: "var(--muted)", fontSize: 14 }}>
            No subscribers yet.
          </div>
        )}
      </div>
    </div>
  );
}
