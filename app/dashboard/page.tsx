"use client";
import { useAccount, useReadContract } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { CONTRACTS, IDENTITY_ABI, JOB_ABI, formatUsdc, JOB_STATUS, arcScan, shortAddr } from "@/lib/contracts";
import { ReputationBadge } from "@/components/ReputationBadge";
import Link from "next/link";

function AgentRow({ tokenId }: { tokenId: bigint }) {
  const { data: agent } = useReadContract({ address: CONTRACTS.agentIdentity, abi: IDENTITY_ABI, functionName: "getAgent", args: [tokenId] });
  if (!agent) return null;
  return (
    <div className="flex items-center justify-between py-3 border-b border-arc-border last:border-0">
      <div>
        <span className="font-semibold">{agent.name}</span>
        <span className="text-arc-muted text-xs ml-2 font-mono">#{tokenId.toString()}</span>
      </div>
      <ReputationBadge bps={agent.reputation} size="sm" />
    </div>
  );
}

function JobRow({ jobId }: { jobId: bigint }) {
  const { data: job } = useReadContract({ address: CONTRACTS.agentJob, abi: JOB_ABI, functionName: "getJob", args: [jobId] });
  if (!job) return null;
  return (
    <div className="py-3 border-b border-arc-border last:border-0">
      <div className="flex items-center justify-between mb-1">
        <p className="text-sm line-clamp-1">{job.description}</p>
        <span className={`text-xs font-mono ml-2 shrink-0 ${job.status === 3 ? "text-green-400" : job.status === 4 ? "text-red-400" : "text-yellow-400"}`}>
          {JOB_STATUS[job.status]}
        </span>
      </div>
      <p className="text-arc-muted text-xs">{formatUsdc(job.paymentAmount)} USDC · Job #{jobId.toString()}</p>
    </div>
  );
}

export default function DashboardPage() {
  const { address, isConnected } = useAccount();

  const { data: agentIds } = useReadContract({ address: CONTRACTS.agentIdentity, abi: IDENTITY_ABI, functionName: "getAgentsByOwner", args: [address ?? "0x0000000000000000000000000000000000000000"], query: { enabled: !!address } });
  const { data: jobIds } = useReadContract({ address: CONTRACTS.agentJob, abi: JOB_ABI, functionName: "getJobsByClient", args: [address ?? "0x0000000000000000000000000000000000000000"], query: { enabled: !!address } });

  if (!isConnected) return (
    <div className="text-center py-16">
      <p className="text-arc-muted mb-4">Connect your wallet to view your dashboard</p>
      <ConnectButton />
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="font-display font-bold text-3xl mb-2">Dashboard</h1>
      <p className="text-arc-muted text-sm font-mono mb-8">
        <a href={arcScan(address!)} target="_blank" className="hover:text-white transition-colors">{address} ↗</a>
      </p>

      <div className="grid md:grid-cols-2 gap-6">
        {/* My Agents */}
        <div className="bg-arc-card border border-arc-border rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-bold text-lg">My Agents</h2>
            <Link href="/agents" className="text-arc-accent text-xs hover:underline">Browse all →</Link>
          </div>
          {!agentIds?.length ? (
            <div className="text-center py-6">
              <p className="text-arc-muted text-sm mb-3">No agents registered yet</p>
              <p className="text-xs text-arc-muted">Use the MCP server or CLI to register an agent via ERC-8004</p>
            </div>
          ) : (
            <div>
              {agentIds.map((id) => <AgentRow key={id.toString()} tokenId={id} />)}
            </div>
          )}
        </div>

        {/* My Jobs */}
        <div className="bg-arc-card border border-arc-border rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-bold text-lg">My Jobs</h2>
            <Link href="/rfps/new" className="text-arc-accent text-xs hover:underline">Post RFP →</Link>
          </div>
          {!jobIds?.length ? (
            <div className="text-center py-6">
              <p className="text-arc-muted text-sm mb-3">No jobs posted yet</p>
              <Link href="/rfps/new" className="text-arc-accent text-xs hover:underline">Post your first RFP →</Link>
            </div>
          ) : (
            <div>
              {jobIds.map((id) => <JobRow key={id.toString()} jobId={id} />)}
            </div>
          )}
        </div>
      </div>

      {/* Quick links */}
      <div className="mt-6 bg-arc-card border border-arc-border rounded-xl p-5">
        <h2 className="font-display font-bold text-lg mb-4">Testnet Resources</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[
            { label: "Get testnet USDC", href: "https://faucet.circle.com" },
            { label: "ArcScan explorer", href: "https://testnet.arcscan.app" },
            { label: "arc-agent-payments", href: "https://github.com/sethoshi18/arc-agent-payments" },
            { label: "arc-agent-market", href: "https://github.com/sethoshi18/arc-agent-market" },
            { label: "Arc docs", href: "https://docs.arc.io" },
            { label: "Circle Console", href: "https://console.circle.com" },
          ].map((l) => (
            <a key={l.href} href={l.href} target="_blank" className="bg-arc-bg border border-arc-border rounded-lg px-3 py-2 text-xs hover:border-arc-accent/50 transition-colors text-arc-muted hover:text-white">
              {l.label} ↗
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
