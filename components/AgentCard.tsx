import Link from "next/link";
import { ReputationBadge } from "./ReputationBadge";
import { formatUsdc, shortAddr, arcScan } from "@/lib/contracts";

interface Agent {
  tokenId: bigint;
  name: string;
  owner: string;
  reputation: bigint;
  hourlyRateUsdc: bigint;
  active: boolean;
}

export function AgentCard({ agent }: { agent: Agent }) {
  return (
    <div className="card card-hover" style={{ padding: 20 }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 12 }}>
        <div>
          <Link href={`/agents/${agent.tokenId}`}
            style={{ fontWeight: 700, fontSize: 15, color: "var(--text)", textDecoration: "none" }}>
            {agent.name}
          </Link>
          <p style={{ fontSize: 11, color: "var(--muted)", marginTop: 3, fontFamily: "JetBrains Mono,monospace" }}>
            <a href={arcScan(agent.owner)} target="_blank" style={{ color: "var(--muted)", textDecoration: "none" }}>
              {shortAddr(agent.owner)}
            </a>
          </p>
        </div>
        <ReputationBadge bps={agent.reputation} size="sm" />
      </div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 14, borderTop: "1px solid var(--border)", fontSize: 13 }}>
        <span style={{ fontWeight: 600, color: "var(--text)" }}>{formatUsdc(agent.hourlyRateUsdc)} USDC/hr</span>
        <span style={{ fontSize: 11, color: "var(--muted)", fontFamily: "JetBrains Mono,monospace" }}>#{agent.tokenId.toString()}</span>
      </div>
    </div>
  );
}
