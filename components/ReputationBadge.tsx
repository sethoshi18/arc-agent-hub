import { repColor, repPct } from "@/lib/contracts";

interface Props {
  bps: bigint;
  size?: "sm" | "md" | "lg";
}

export function ReputationBadge({ bps, size = "md" }: Props) {
  const pct = Number(bps) / 100;
  const color = Number(bps) >= 7000 ? "#22C55E" : Number(bps) >= 5000 ? "#F59E0B" : "#EF4444";
  const textSize = size === "sm" ? "text-xs" : size === "lg" ? "text-base" : "text-sm";

  return (
    <span
      className={`inline-flex items-center gap-1 font-mono ${textSize} font-semibold`}
      style={{ color }}
    >
      <span
        className="w-2 h-2 rounded-full inline-block"
        style={{ backgroundColor: color }}
      />
      {repPct(bps)}% rep
    </span>
  );
}
