"use client";
import Link from "next/link";
import { useReadContract } from "wagmi";
import { CONTRACTS, DAO_ABI } from "@/lib/contracts";
import { ProposalCard } from "@/components/ProposalCard";

function ProposalRow({ proposalId }: { proposalId: number }) {
  const { data: proposal } = useReadContract({
    address: CONTRACTS.agentDAO,
    abi: DAO_ABI,
    functionName: "getProposal",
    args: [BigInt(proposalId)],
  });

  if (!proposal || proposal.createdAt === 0n) return null;

  return <ProposalCard proposal={proposal} />;
}

export default function DAOPage() {
  const ids = Array.from({ length: 20 }, (_, i) => i + 1);

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 24px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 32, gap: 16, flexWrap: "wrap" }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: "var(--text)", marginBottom: 6, letterSpacing: "-0.02em" }}>
            Governance
          </h1>
          <p style={{ fontSize: 14, color: "var(--muted)", lineHeight: 1.5 }}>
            Reputation-weighted proposals and dispute resolution
          </p>
        </div>
        <Link href="/dao/new" className="btn btn-primary" style={{ textDecoration: "none", whiteSpace: "nowrap" }}>
          New Proposal
        </Link>
      </div>

      {/* Proposals Grid */}
      <div style={{ display: "grid", gap: 12 }}>
        {ids.map(id => (
          <ProposalRow key={id} proposalId={id} />
        ))}
      </div>

      {/* Empty state hint */}
      <div style={{
        textAlign: "center", padding: "48px 24px", color: "var(--muted)", fontSize: 14,
      }}>
        <p style={{ marginBottom: 8 }}>
          Don&apos;t see any proposals? They may still be loading, or none have been created yet.
        </p>
        <Link href="/dao/new" style={{ color: "var(--text)", fontWeight: 500 }}>
          Create the first proposal &rarr;
        </Link>
      </div>
    </div>
  );
}
