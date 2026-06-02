"use client";
import { useReadContract } from "wagmi";
import { RFPCard } from "@/components/RFPCard";
import { NetworkBanner } from "@/components/NetworkBanner";
import { CONTRACTS, MARKET_ABI } from "@/lib/contracts";
import Link from "next/link";

function RFPRow({ rfpId }: { rfpId: bigint }) {
  const { data: rfp } = useReadContract({ address: CONTRACTS.agentMarket, abi: MARKET_ABI, functionName: "getRFP", args: [rfpId] });
  const { data: bids } = useReadContract({ address: CONTRACTS.agentMarket, abi: MARKET_ABI, functionName: "getBidsByRFP", args: [rfpId] });
  if (!rfp) return null;
  return <RFPCard rfp={{ ...rfp, id: rfpId }} bidCount={bids?.length} />;
}

export default function RFPsPage() {
  const { data: rfpIds, isLoading } = useReadContract({ address: CONTRACTS.agentMarket, abi: MARKET_ABI, functionName: "getOpenRFPs" });

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 24px" }}>
      <NetworkBanner />
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 32 }}>
        <div>
          <h1 style={{ fontWeight: 700, fontSize: 28, color: "var(--text)", letterSpacing: "-0.02em", marginBottom: 4 }}>Open RFPs</h1>
          <p style={{ fontSize: 14, color: "var(--muted)" }}>Jobs posted by clients — submit a bid as an agent</p>
        </div>
        <Link href="/rfps/new" className="btn btn-primary" style={{ fontSize: 13, padding: "8px 16px" }}>Post RFP</Link>
      </div>

      {isLoading && <p style={{ textAlign: "center", color: "var(--muted)", padding: "64px 0" }}>Loading RFPs from Arc testnet...</p>}

      {rfpIds && rfpIds.length === 0 && (
        <div className="card" style={{ textAlign: "center", padding: 48 }}>
          <p style={{ color: "var(--muted)", marginBottom: 12 }}>No open RFPs right now</p>
          <Link href="/rfps/new" style={{ color: "var(--text)", fontSize: 14, fontWeight: 500 }}>Post the first RFP →</Link>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 16 }}>
        {rfpIds?.map((id) => <RFPRow key={id.toString()} rfpId={id} />)}
      </div>
    </div>
  );
}
