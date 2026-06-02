import Link from "next/link";
import { formatUsdc, RFP_STATUS } from "@/lib/contracts";

interface RFP {
  id: bigint;
  description: string;
  budgetUsdc: bigint;
  status: number;
  expiresAt: bigint;
  client: string;
}

export function RFPCard({ rfp, bidCount }: { rfp: RFP; bidCount?: number }) {
  const now = BigInt(Math.floor(Date.now() / 1000));
  const timeLeft = Number(rfp.expiresAt) - Number(now);
  const hoursLeft = Math.max(0, Math.floor(timeLeft / 3600));
  const isExpired = timeLeft <= 0;

  return (
    <Link href={`/rfps/${rfp.id}`} style={{ textDecoration: "none" }}>
      <div className="card card-hover" style={{ padding: 20, cursor: "pointer" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 12 }}>
          <p style={{ fontSize: 14, color: "var(--text)", lineHeight: 1.5, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as const, overflow: "hidden" }}>
            {rfp.description}
          </p>
          <span className={`badge ${rfp.status === 0 ? "badge-dark" : rfp.status === 1 ? "badge-purple" : "badge-gray"}`}
            style={{ flexShrink: 0, whiteSpace: "nowrap" }}>
            {RFP_STATUS[rfp.status] ?? "Unknown"}
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 14, borderTop: "1px solid var(--border)", fontSize: 12 }}>
          <span style={{ fontWeight: 600, color: "var(--text)" }}>{formatUsdc(rfp.budgetUsdc)} USDC</span>
          <div style={{ display: "flex", gap: 12, color: "var(--muted)" }}>
            {bidCount !== undefined && <span>{bidCount} bid{bidCount !== 1 ? "s" : ""}</span>}
            <span>{isExpired ? "Closed" : `${hoursLeft}h left`}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
