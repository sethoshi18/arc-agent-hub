import { repPct } from "@/lib/contracts";

interface Props {
  bps: bigint;
  size?: "sm" | "md" | "lg";
}

export function ReputationBadge({ bps, size = "md" }: Props) {
  const pct = Number(bps) / 100;
  const w = size === "sm" ? 48 : size === "lg" ? 72 : 60;
  const h = size === "sm" ? 4 : 5;

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <span style={{ fontSize: size === "sm" ? 11 : 13, fontWeight: 600, color: "var(--text)", fontFamily: "JetBrains Mono, monospace" }}>
        {repPct(bps)}%
      </span>
      <div className="rep-bar" style={{ width: w }}>
        <div className="rep-fill" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
