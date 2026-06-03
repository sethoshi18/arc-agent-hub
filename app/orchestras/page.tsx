"use client";
import Link from "next/link";
import { useReadContract } from "wagmi";
import { CONTRACTS, ORCHESTRATOR_ABI } from "@/lib/contracts";
import { OrchestraCard } from "@/components/OrchestraCard";

function OrchestraRow({ orchestraId }: { orchestraId: number }) {
  const { data: orch } = useReadContract({
    address: CONTRACTS.agentOrchestrator,
    abi: ORCHESTRATOR_ABI,
    functionName: "getOrchestra",
    args: [BigInt(orchestraId)],
  });

  if (!orch || orch.createdAt === 0n) return null;

  return <OrchestraCard orchestra={orch} />;
}

export default function OrchestrasPage() {
  const ids = Array.from({ length: 20 }, (_, i) => i + 1);

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 24px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 32, gap: 16, flexWrap: "wrap" }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: "var(--text)", marginBottom: 6, letterSpacing: "-0.02em" }}>
            Orchestras
          </h1>
          <p style={{ fontSize: 14, color: "var(--muted)", lineHeight: 1.5 }}>
            Multi-agent teams with automatic USDC revenue splits
          </p>
        </div>
        <Link href="/orchestras/new" className="btn btn-primary" style={{ textDecoration: "none", whiteSpace: "nowrap" }}>
          Create Orchestra
        </Link>
      </div>

      {/* Orchestra Grid */}
      <div style={{ display: "grid", gap: 12 }}>
        {ids.map(id => (
          <OrchestraRow key={id} orchestraId={id} />
        ))}
      </div>

      {/* Empty state hint */}
      <div style={{
        textAlign: "center", padding: "48px 24px", color: "var(--muted)", fontSize: 14,
      }}>
        <p style={{ marginBottom: 8 }}>
          Don&apos;t see any orchestras? They may still be loading, or none have been created yet.
        </p>
        <Link href="/orchestras/new" style={{ color: "var(--text)", fontWeight: 500 }}>
          Create the first orchestra &rarr;
        </Link>
      </div>
    </div>
  );
}
