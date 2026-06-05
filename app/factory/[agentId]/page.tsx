"use client";
import { useParams } from "next/navigation";
import { useReadContract } from "wagmi";
import Link from "next/link";
import { FACTORY_ADDRESS, FACTORY_ABI, formatUsdc, repPercent, shortAddr, intervalLabel } from "@/lib/factory";

/* ── Stat pill ───────────────────────────────────────────────────────── */

function Stat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="card" style={{ padding: "20px 24px" }}>
      <div style={{ fontSize: 11, fontFamily: "'IBM Plex Mono', monospace", color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6 }}>
        {label}
      </div>
      <div style={{ fontSize: 22, fontWeight: 700, fontFamily: "'Inter', sans-serif", color: accent ? "#A0722A" : "var(--text)" }}>
        {value}
      </div>
    </div>
  );
}

/* ── Layer status row ────────────────────────────────────────────────── */

function LayerRow({ layer, label, active, detail, href }: {
  layer: number; label: string; active: boolean; detail?: string; href?: string;
}) {
  const inner = (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "14px 20px", borderRadius: 10, background: active ? "rgba(160,114,42,0.04)" : "transparent",
      border: `1px solid ${active ? "rgba(160,114,42,0.15)" : "#D4C5A9"}`,
      transition: "all .15s",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <span style={{
          width: 28, height: 28, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 11, fontWeight: 700, fontFamily: "'IBM Plex Mono', monospace",
          background: active ? "#A0722A" : "#D4C5A9", color: active ? "#F5F0E8" : "#6B6560",
        }}>
          L{layer}
        </span>
        <span style={{ fontSize: 14, fontFamily: "'IBM Plex Mono', monospace", fontWeight: 500, color: "var(--text)" }}>
          {label}
        </span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        {detail && (
          <span style={{ fontSize: 12, fontFamily: "'IBM Plex Mono', monospace", color: "var(--muted)" }}>
            {detail}
          </span>
        )}
        <span style={{
          fontSize: 10, fontFamily: "'IBM Plex Mono', monospace", padding: "2px 8px",
          borderRadius: 99,
          background: active ? "rgba(160,114,42,0.08)" : "rgba(107,101,96,0.08)",
          color: active ? "#A0722A" : "#6B6560",
          fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em",
        }}>
          {active ? "Active" : "Off"}
        </span>
      </div>
    </div>
  );

  if (href && active) {
    return <Link href={href} style={{ textDecoration: "none" }}>{inner}</Link>;
  }
  return inner;
}

/* ── Main page ───────────────────────────────────────────────────────── */

export default function AgentDetailPage() {
  const params = useParams();
  const agentId = BigInt(params.agentId as string);

  const { data: profile, isLoading: loadingProfile } = useReadContract({
    address: FACTORY_ADDRESS, abi: FACTORY_ABI, functionName: "getAgentProfile", args: [agentId],
  });

  const { data: deployed, isLoading: loadingDeployed } = useReadContract({
    address: FACTORY_ADDRESS, abi: FACTORY_ABI, functionName: "getDeployedAgent", args: [agentId],
  });

  const isLoading = loadingProfile || loadingDeployed;

  if (isLoading) {
    return (
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 24px" }}>
        <p style={{ textAlign: "center", color: "var(--muted)", padding: "64px 0" }}>Loading agent...</p>
      </div>
    );
  }

  if (!profile || !deployed) {
    return (
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 24px" }}>
        <div className="card" style={{ textAlign: "center", padding: 64 }}>
          <p style={{ fontSize: 16, fontFamily: "'Inter', sans-serif", fontWeight: 600, color: "var(--text)", marginBottom: 8 }}>
            Agent not found
          </p>
          <p style={{ fontSize: 13, color: "var(--muted)", fontFamily: "'IBM Plex Mono', monospace", marginBottom: 16 }}>
            Agent #{agentId.toString()} was not deployed through the factory.
          </p>
          <Link href="/factory" className="btn btn-outline" style={{ fontSize: 13, padding: "8px 16px" }}>
            ← Back to Factory
          </Link>
        </div>
      </div>
    );
  }

  const [name, reputation, isListed, hourlyRate, stakeAmount, retainerPlanId] =
    profile as [string, bigint, boolean, bigint, bigint, bigint];

  const dep = deployed as {
    agentTokenId: bigint; owner: string; templateId: bigint;
    listedOnMarket: boolean; retainerPlanId: bigint; hasStake: boolean; deployedAt: bigint;
  };

  const deployDate = new Date(Number(dep.deployedAt) * 1000);

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 24px" }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <Link href="/factory" style={{ fontSize: 12, color: "var(--muted)", textDecoration: "none", fontFamily: "'IBM Plex Mono', monospace" }}>
          ← Factory
        </Link>
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 12 }}>
          <h1 style={{ fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: 28, color: "var(--text)", letterSpacing: "-0.02em", margin: 0 }}>
            {name}
          </h1>
          <span style={{
            fontSize: 12, fontFamily: "'IBM Plex Mono', monospace", padding: "4px 12px",
            borderRadius: 99, background: "rgba(160,114,42,0.08)", color: "#A0722A",
            border: "1px solid rgba(160,114,42,0.2)",
          }}>
            Token #{agentId.toString()}
          </span>
        </div>
        <p style={{ fontSize: 13, color: "var(--muted)", fontFamily: "'IBM Plex Mono', monospace", marginTop: 8 }}>
          Owner: {shortAddr(dep.owner)} · Deployed {deployDate.toLocaleDateString()}
          {dep.templateId > 0n && ` · Template #${dep.templateId.toString()}`}
        </p>
      </div>

      {/* Stats grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 16, marginBottom: 32 }}>
        <Stat label="Reputation" value={repPercent(reputation)} accent />
        <Stat label="Hourly Rate" value={isListed ? formatUsdc(hourlyRate) : "Not listed"} />
        <Stat label="Staked" value={stakeAmount > 0n ? formatUsdc(stakeAmount) : "None"} />
        <Stat label="Retainer Plan" value={retainerPlanId > 0n ? `#${retainerPlanId.toString()}` : "None"} />
      </div>

      {/* Layer status */}
      <div style={{ marginBottom: 32 }}>
        <h2 style={{ fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: 20, color: "var(--text)", marginBottom: 16 }}>
          Layer Status
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <LayerRow layer={1} label="Identity (ERC-8004)" active={true}
            detail={repPercent(reputation)} />
          <LayerRow layer={3} label="Market Listing" active={isListed}
            detail={isListed ? `${formatUsdc(hourlyRate)}/hr` : undefined}
            href={isListed ? `/agents/${agentId.toString()}` : undefined} />
          <LayerRow layer={5} label="Retainer Plan" active={retainerPlanId > 0n}
            detail={retainerPlanId > 0n ? `Plan #${retainerPlanId.toString()}` : undefined}
            href={retainerPlanId > 0n ? `/retainers/${retainerPlanId.toString()}` : undefined} />
          <LayerRow layer={6} label="Staking" active={stakeAmount > 0n}
            detail={stakeAmount > 0n ? formatUsdc(stakeAmount) : undefined}
            href={stakeAmount > 0n ? `/staking/${agentId.toString()}` : undefined} />
        </div>
      </div>

      {/* Actions */}
      <div>
        <h2 style={{ fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: 20, color: "var(--text)", marginBottom: 16 }}>
          Quick Actions
        </h2>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
          <a href={`https://testnet.arcscan.app/address/${dep.owner}`} target="_blank" rel="noopener noreferrer"
            className="btn btn-outline" style={{ fontSize: 13, padding: "8px 16px" }}>
            View on Arcscan ↗
          </a>
          {!isListed && (
            <Link href="/agents" className="btn btn-outline" style={{ fontSize: 13, padding: "8px 16px" }}>
              List on Market →
            </Link>
          )}
          {retainerPlanId === 0n && (
            <Link href="/retainers/new" className="btn btn-outline" style={{ fontSize: 13, padding: "8px 16px" }}>
              Create Retainer Plan →
            </Link>
          )}
          {stakeAmount === 0n && (
            <Link href="/staking/new" className="btn btn-outline" style={{ fontSize: 13, padding: "8px 16px" }}>
              Stake Collateral →
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
