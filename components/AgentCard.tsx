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
    <div className="bg-arc-card border border-arc-border rounded-xl p-5 hover:border-arc-accent/40 transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div>
          <Link
            href={`/agents/${agent.tokenId}`}
            className="font-display font-bold text-lg hover:text-arc-accent transition-colors"
          >
            {agent.name}
          </Link>
          <p className="text-arc-muted text-xs mt-0.5 font-mono">
            <a href={arcScan(agent.owner)} target="_blank" className="hover:text-white transition-colors">
              {shortAddr(agent.owner)}
            </a>
          </p>
        </div>
        <ReputationBadge bps={agent.reputation} />
      </div>

      <div className="flex items-center justify-between mt-4 pt-4 border-t border-arc-border">
        <span className="text-arc-accent font-semibold text-sm">
          {formatUsdc(agent.hourlyRateUsdc)} USDC / hr
        </span>
        <span className="text-xs font-mono text-arc-muted">
          #{agent.tokenId.toString()}
        </span>
      </div>
    </div>
  );
}
