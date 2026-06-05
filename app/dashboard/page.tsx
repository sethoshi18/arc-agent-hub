"use client";
import { useAccount, useReadContract } from "wagmi";
import { PasskeyButton } from "@/components/PasskeyButton";
import { CONTRACTS, IDENTITY_ABI, JOB_ABI, formatUsdc, JOB_STATUS, arcScan, repPct } from "@/lib/contracts";
import { ReputationBadge } from "@/components/ReputationBadge";
import Link from "next/link";

function AgentRow({ tokenId }: { tokenId: bigint }) {
  const { data: agent } = useReadContract({ address: CONTRACTS.agentIdentity, abi: IDENTITY_ABI, functionName: "getAgent", args: [tokenId] });
  if (!agent) return null;
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 0", borderBottom: "1px solid var(--border)" }}>
      <div>
        <span style={{ fontWeight: 600, fontSize: 14, color: "var(--text)" }}>{agent.name}</span>
        <span style={{ fontSize: 11, color: "var(--muted)", marginLeft: 8, fontFamily: "JetBrains Mono,monospace" }}>#{tokenId.toString()}</span>
      </div>
      <ReputationBadge bps={agent.reputation} size="sm" />
    </div>
  );
}

function JobRow({ jobId }: { jobId: bigint }) {
  const { data: job } = useReadContract({ address: CONTRACTS.agentJob, abi: JOB_ABI, functionName: "getJob", args: [jobId] });
  if (!job) return null;
  return (
    <div style={{ padding: "12px 0", borderBottom: "1px solid var(--border)" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
        <p style={{ fontSize: 13, color: "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "70%" }}>{job.description}</p>
        <span className={`badge ${job.status === 3 ? "badge-dark" : job.status === 4 ? "badge-red" : "badge-gray"}`}>
          {JOB_STATUS[job.status]}
        </span>
      </div>
      <p style={{ fontSize: 11, color: "var(--muted)" }}>{formatUsdc(job.paymentAmount)} USDC · Job #{jobId.toString()}</p>
    </div>
  );
}

export default function DashboardPage() {
  const { address, isConnected } = useAccount();
  const zeroAddr = "0x0000000000000000000000000000000000000000" as \`0x\${string}\`;
  const { data: agentIds } = useReadContract({ address: CONTRACTS.agentIdentity, abi: IDENTITY_ABI, functionName: "getAgentsByOwner", args: [address ?? zeroAddr], query: { enabled: !!address } });
  const { data: jobIds } = useReadContract({ address: CONTRACTS.agentJob, abi: JOB_ABI, functionName: "getJobsByClient", args: [address ?? zeroAddr], query: { enabled: !!address } });

  if (!isConnected) return (
    <div style={{ maxWidth: 500, margin: "0 auto", padding: "64px 24px", textAlign: "center" }}>
      <p style={{ color: "var(--muted)", marginBottom: 16 }}>Connect your wallet to view your dashboard</p>
      <PasskeyButton />
    </div>
  );

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: "40px 24px" }}>
      <h1 style={{ fontWeight: 700, fontSize: 28, color: "var(--text)", letterSpacing: "-0.02em", marginBottom: 4 }}>Dashboard</h1>
      <a href={arcScan(address!)} target="_blank" style={{ fontSize: 12, color: "var(--muted)", fontFamily: "JetBrains Mono,monospace", textDecoration: "none", display: "inline-block", marginBottom: 32 }}>
        {address} \u2197
      </a>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 24 }}>
        {/* My Agents */}
        <div className="card" style={{ padding: 24 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <h2 style={{ fontWeight: 700, fontSize: 16, color: "var(--text)" }}>My Agents</h2>
            <Link href="/agents" style={{ fontSize: 12, color: "var(--muted)", textDecoration: "none" }}>Browse all \u2192</Link>
          </div>
          {!agentIds?.length ? (
            <p style={{ color: "var(--muted)", fontSize: 13, textAlign: "center", padding: "24px 0" }}>No agents registered yet</p>
          ) : (
            <div>{agentIds.map((id) => <AgentRow key={id.toString()} tokenId={id} />)}</div>
          )}
        </div>

        {/* My Jobs */}
        <div className="card" style={{ padding: 24 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <h2 style={{ fontWeight: 700, fontSize: 16, color: "var(--text)" }}>My Jobs</h2>
            <Link href="/rfps/new" style={{ fontSize: 12, color: "var(--muted)", textDecoration: "none" }}>Post RFP \u2192</Link>
          </div>
          {!jobIds?.length ? (
            <div style={{ textAlign: "center", padding: "24px 0" }}>
              <p style={{ color: "var(--muted)", fontSize: 13, marginBottom: 8 }}>No jobs posted yet</p>
              <Link href="/rfps/new" style={{ fontSize: 12, color: "var(--text)", fontWeight: 500 }}>Post your first RFP \u2192</Link>
            </div>
          ) : (
            <div>{jobIds.map((id) => <JobRow key={id.toString()} jobId={id} />)}</div>
          )}
        </div>
      </div>

      {/* Testnet resources */}
      <div className="card" style={{ padding: 24 }}>
        <h2 style={{ fontWeight: 700, fontSize: 16, color: "var(--text)", marginBottom: 16 }}>Testnet Resources</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
          {[
            ["Get testnet USDC", "https://faucet.circle.com"],
            ["ArcScan explorer", "https://testnet.arcscan.app"],
            ["arc-agent-payments", "https://github.com/sethoshi18/arc-agent-payments"],
            ["arc-agent-market", "https://github.com/sethoshi18/arc-agent-market"],
            ["Arc docs", "https://docs.arc.io"],
            ["Circle Console", "https://console.circle.com"],
          ].map(([label, href]) => (
            <a key={href} href={href} target="_blank"
              style={{ background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 8,
                padding: "10px 14px", fontSize: 12, color: "var(--muted)", textDecoration: "none", transition: "border-color .15s" }}>
              {label} \u2197
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
