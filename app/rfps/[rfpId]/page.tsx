"use client";
import { useParams } from "next/navigation";
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { CONTRACTS, MARKET_ABI, IDENTITY_ABI, formatUsdc, shortAddr, arcScan, repPct, RFP_STATUS } from "@/lib/contracts";
import { ReputationBadge } from "@/components/ReputationBadge";
import Link from "next/link";

function BidRow({ bidId, rfpId, isClient }: { bidId: bigint; rfpId: bigint; isClient: boolean }) {
  const { data: bid } = useReadContract({ address: CONTRACTS.agentMarket, abi: MARKET_ABI, functionName: "getBid", args: [bidId] });
  const { data: agent } = useReadContract({ address: CONTRACTS.agentIdentity, abi: IDENTITY_ABI, functionName: "getAgent", args: [bid?.agentTokenId ?? BigInt(0)], query: { enabled: !!bid } });
  const { writeContract, isPending } = useWriteContract();

  if (!bid || !agent) return null;

  return (
    <div className="card" style={{ padding: 20, marginBottom: 12 }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 12 }}>
        <div>
          <p style={{ fontWeight: 600, fontSize: 14, color: "var(--text)", marginBottom: 4 }}>{agent.name}</p>
          <p style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.5 }}>{bid.proposal}</p>
        </div>
        <ReputationBadge bps={bid.agentReputation} size="sm" />
      </div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 12, borderTop: "1px solid var(--border)" }}>
        <div style={{ display: "flex", gap: 16, fontSize: 12, color: "var(--muted)" }}>
          <span style={{ fontWeight: 600, color: "var(--text)" }}>{formatUsdc(bid.priceUsdc)} USDC</span>
          <span>Agent #{bid.agentTokenId.toString()}</span>
          <span>{repPct(bid.agentReputation)}% rep</span>
        </div>
        {isClient && (
          <button className="btn btn-primary" style={{ padding: "6px 14px", fontSize: 12 }}
            disabled={isPending}
            onClick={() => writeContract({ address: CONTRACTS.agentMarket, abi: MARKET_ABI, functionName: "acceptBid", args: [rfpId, bidId] })}>
            {isPending ? "Accepting..." : "Accept bid"}
          </button>
        )}
      </div>
    </div>
  );
}

export default function RFPDetailPage() {
  const params = useParams();
  const rfpId = BigInt(params.rfpId as string);
  const { address } = useAccount();
  const { data: rfp } = useReadContract({ address: CONTRACTS.agentMarket, abi: MARKET_ABI, functionName: "getRFP", args: [rfpId] });
  const { data: bidIds } = useReadContract({ address: CONTRACTS.agentMarket, abi: MARKET_ABI, functionName: "getBidsByRFP", args: [rfpId] });

  if (!rfp) return <div style={{ maxWidth: 1100, margin: "0 auto", padding: "64px 24px", textAlign: "center", color: "var(--muted)" }}>Loading RFP #{rfpId.toString()}...</div>;

  const isClient = address?.toLowerCase() === rfp.client.toLowerCase();
  const now = BigInt(Math.floor(Date.now() / 1000));
  const isExpired = rfp.expiresAt <= now;

  return (
    <div style={{ maxWidth: 760, margin: "0 auto", padding: "40px 24px" }}>
      <Link href="/rfps" style={{ fontSize: 13, color: "var(--muted)", textDecoration: "none", marginBottom: 20, display: "inline-block" }}>← Back to RFPs</Link>

      <div className="card" style={{ padding: 28, marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 16 }}>
          <h1 style={{ fontWeight: 700, fontSize: 20, color: "var(--text)", lineHeight: 1.4 }}>{rfp.description}</h1>
          <span className={`badge ${rfp.status === 0 ? "badge-dark" : rfp.status === 1 ? "badge-purple" : "badge-gray"}`}>
            {RFP_STATUS[rfp.status] ?? "Unknown"}
          </span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, borderTop: "1px solid var(--border)", paddingTop: 16 }}>
          <div>
            <p style={{ fontSize: 11, color: "var(--muted)", marginBottom: 3, textTransform: "uppercase", letterSpacing: ".08em" }}>Budget</p>
            <p style={{ fontWeight: 600, color: "var(--text)", fontSize: 15 }}>{formatUsdc(rfp.budgetUsdc)} USDC</p>
          </div>
          <div>
            <p style={{ fontSize: 11, color: "var(--muted)", marginBottom: 3, textTransform: "uppercase", letterSpacing: ".08em" }}>Bidding</p>
            <p style={{ fontWeight: 500, fontSize: 13, color: isExpired ? "var(--muted)" : "var(--text)" }}>{isExpired ? "Closed" : "Open"}</p>
          </div>
          <div>
            <p style={{ fontSize: 11, color: "var(--muted)", marginBottom: 3, textTransform: "uppercase", letterSpacing: ".08em" }}>Client</p>
            <a href={arcScan(rfp.client)} target="_blank" style={{ fontSize: 12, color: "var(--muted)", fontFamily: "JetBrains Mono,monospace", textDecoration: "none" }}>
              {shortAddr(rfp.client)} ↗
            </a>
          </div>
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <h2 style={{ fontWeight: 700, fontSize: 18, color: "var(--text)" }}>Bids ({bidIds?.length ?? 0})</h2>
        <span style={{ fontSize: 12, color: "var(--muted)" }}>Sorted by reputation</span>
      </div>

      {bidIds && bidIds.length === 0 && (
        <div className="card" style={{ textAlign: "center", padding: 40 }}>
          <p style={{ color: "var(--muted)" }}>No bids yet. Agents can submit proposals from the MCP server.</p>
        </div>
      )}

      {bidIds?.map((id) => <BidRow key={id.toString()} bidId={id} rfpId={rfpId} isClient={isClient} />)}
    </div>
  );
}
