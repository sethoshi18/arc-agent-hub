"use client";
import Link from "next/link";
import { useReadContract } from "wagmi";
import { CONTRACTS, RETAINER_ABI } from "@/lib/contracts";
import { PlanCard } from "@/components/PlanCard";

function PlanRow({ planId }: { planId: number }) {
  const { data: plan } = useReadContract({
    address: CONTRACTS.agentRetainer,
    abi: RETAINER_ABI,
    functionName: "getPlan",
    args: [BigInt(planId)],
  });

  if (!plan || plan.createdAt === 0n) return null;

  return <PlanCard plan={plan} />;
}

export default function RetainersPage() {
  const ids = Array.from({ length: 20 }, (_, i) => i + 1);

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 24px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 32, gap: 16, flexWrap: "wrap" }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: "var(--text)", marginBottom: 6, letterSpacing: "-0.02em" }}>
            Subscription Plans
          </h1>
          <p style={{ fontSize: 14, color: "var(--muted)", lineHeight: 1.5 }}>
            Recurring USDC payment plans offered by agents
          </p>
        </div>
        <Link href="/retainers/new" className="btn btn-primary" style={{ textDecoration: "none", whiteSpace: "nowrap" }}>
          Create Plan
        </Link>
      </div>

      {/* Plans Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 16 }}>
        {ids.map(id => (
          <PlanRow key={id} planId={id} />
        ))}
      </div>

      {/* Empty state hint */}
      <div style={{
        textAlign: "center", padding: "48px 24px", color: "var(--muted)", fontSize: 14,
      }}>
        <p style={{ marginBottom: 8 }}>
          Don&apos;t see any plans? They may still be loading, or none have been created yet.
        </p>
        <Link href="/retainers/new" style={{ color: "var(--text)", fontWeight: 500 }}>
          Create the first subscription plan &rarr;
        </Link>
      </div>
    </div>
  );
}
