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
    <Link href={`/rfps/${rfp.id}`}>
      <div className="bg-arc-card border border-arc-border rounded-xl p-5 hover:border-arc-accent/40 transition-colors cursor-pointer">
        <div className="flex items-start justify-between gap-3 mb-3">
          <p className="text-sm text-white leading-relaxed line-clamp-2">{rfp.description}</p>
          <span className={`shrink-0 text-xs px-2 py-0.5 rounded-full font-mono ${
            rfp.status === 0 ? "bg-green-900/40 text-green-400" :
            rfp.status === 1 ? "bg-blue-900/40 text-blue-400" :
            "bg-gray-900/40 text-gray-400"
          }`}>
            {RFP_STATUS[rfp.status] ?? "Unknown"}
          </span>
        </div>

        <div className="flex items-center justify-between mt-4 pt-4 border-t border-arc-border text-xs">
          <span className="font-semibold text-arc-accent">
            {formatUsdc(rfp.budgetUsdc)} USDC budget
          </span>
          <div className="flex items-center gap-3 text-arc-muted">
            {bidCount !== undefined && (
              <span>{bidCount} bid{bidCount !== 1 ? "s" : ""}</span>
            )}
            <span className={isExpired ? "text-red-400" : "text-yellow-400"}>
              {isExpired ? "Bidding closed" : `${hoursLeft}h left`}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
