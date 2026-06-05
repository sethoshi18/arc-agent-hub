"use client";
import { useState } from "react";
import { useReadContract, useWriteContract, useAccount, useWaitForTransactionReceipt } from "wagmi";
import { parseUnits, keccak256, toHex } from "viem";
import Link from "next/link";
import { FACTORY_ADDRESS, FACTORY_ABI, formatUsdc, shortAddr } from "@/lib/factory";

/* ── Agent row component ─────────────────────────────────────────────── */

function AgentRow({ id }: { id: bigint }) {
  const { data: profile } = useReadContract({
    address: FACTORY_ADDRESS, abi: FACTORY_ABI, functionName: "getAgentProfile", args: [id],
  });
  const { data: deployed } = useReadContract({
    address: FACTORY_ADDRESS, abi: FACTORY_ABI, functionName: "getDeployedAgent", args: [id],
  });

  if (!profile) return null;
  const [name, reputation, isListed, hourlyRate] = profile as [string, bigint, boolean, bigint, bigint, bigint];
  const repPct = (Number(reputation) / 100).toFixed(1);

  return (
    <Link href={`/factory/${id.toString()}`} className="card" style={{
      display: "block", padding: "20px 24px", textDecoration: "none", transition: "all .15s",
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
        <span style={{ fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: 16, color: "var(--text)" }}>
          {name}
        </span>
        <span style={{
          fontSize: 11, fontFamily: "'IBM Plex Mono', monospace", padding: "3px 10px",
          borderRadius: 99, background: "rgba(160,114,42,0.08)", color: "#A0722A",
          border: "1px solid rgba(160,114,42,0.2)",
        }}>
          #{id.toString()}
        </span>
      </div>
      <div style={{ display: "flex", gap: 16, fontSize: 12, color: "var(--muted)", fontFamily: "'IBM Plex Mono', monospace" }}>
        <span>Rep: {repPct}%</span>
        {isListed && <span>Listed: {formatUsdc(hourlyRate)}/hr</span>}
        {deployed && (deployed as any).templateId > 0n && (
          <span>Template #{(deployed as any).templateId.toString()}</span>
        )}
      </div>
    </Link>
  );
}

/* ── Deploy form ─────────────────────────────────────────────────────── */

function DeployForm() {
  const { address } = useAccount();
  const [name, setName] = useState("");
  const [metadataURI, setMetadataURI] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const { writeContract, data: txHash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash: txHash });

  function handleDeploy() {
    if (!name.trim()) return;
    writeContract({
      address: FACTORY_ADDRESS, abi: FACTORY_ABI, functionName: "deployAgent",
      args: [{
        name: name.trim(),
        metadataURI: metadataURI.trim() || `ipfs://${name.trim().replace(/\s+/g, "-").toLowerCase()}`,
        listOnMarket: false,
        hourlyRateUsdc: 0n,
        capabilities: [],
        availableUntil: 0n,
        createRetainerPlan: false,
        retainerPriceUsdc: 0n,
        retainerInterval: 0n,
        retainerDescription: "",
        stakeCollateral: false,
        stakeAmountUsdc: 0n,
      }],
    });
    setSubmitted(true);
  }

  if (!address) {
    return (
      <div className="card" style={{ textAlign: "center", padding: 48 }}>
        <p style={{ color: "var(--muted)", fontSize: 14, marginBottom: 8 }}>Connect your wallet to deploy agents</p>
      </div>
    );
  }

  return (
    <div className="card" style={{ padding: 32 }}>
      <h2 style={{ fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: 20, color: "var(--text)", marginBottom: 4 }}>
        Deploy Custom Agent
      </h2>
      <p style={{ fontSize: 13, color: "var(--muted)", marginBottom: 24 }}>
        Register a new ERC-8004 identity on-chain in a single transaction.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div>
          <label style={{ fontSize: 11, fontFamily: "'IBM Plex Mono', monospace", color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.1em", display: "block", marginBottom: 6 }}>
            Agent Name *
          </label>
          <input
            type="text" value={name} onChange={(e) => setName(e.target.value)}
            placeholder="e.g. DevAgent-Alpha"
            style={{
              width: "100%", padding: "10px 14px", borderRadius: 8, fontSize: 14,
              fontFamily: "'IBM Plex Mono', monospace", background: "#F5F0E8",
              border: "1px solid #D4C5A9", color: "#1A1A1A", outline: "none",
            }}
          />
        </div>

        <div>
          <label style={{ fontSize: 11, fontFamily: "'IBM Plex Mono', monospace", color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.1em", display: "block", marginBottom: 6 }}>
            Metadata URI
          </label>
          <input
            type="text" value={metadataURI} onChange={(e) => setMetadataURI(e.target.value)}
            placeholder="ipfs://... (optional)"
            style={{
              width: "100%", padding: "10px 14px", borderRadius: 8, fontSize: 14,
              fontFamily: "'IBM Plex Mono', monospace", background: "#F5F0E8",
              border: "1px solid #D4C5A9", color: "#1A1A1A", outline: "none",
            }}
          />
        </div>

        <button
          onClick={handleDeploy}
          disabled={!name.trim() || isPending || isConfirming}
          className="btn btn-primary"
          style={{ fontSize: 14, padding: "12px 24px", width: "100%", marginTop: 8 }}
        >
          {isPending ? "Confirm in wallet..." : isConfirming ? "Deploying..." : "Deploy Agent"}
        </button>

        {isSuccess && (
          <div style={{
            padding: "12px 16px", borderRadius: 8, background: "rgba(160,114,42,0.08)",
            border: "1px solid rgba(160,114,42,0.2)", fontSize: 13, color: "#A0722A",
            fontFamily: "'IBM Plex Mono', monospace",
          }}>
            Agent deployed successfully!{" "}
            <a href={`https://testnet.arcscan.app/tx/${txHash}`} target="_blank" rel="noopener noreferrer"
              style={{ textDecoration: "underline" }}>
              View on Arcscan
            </a>
          </div>
        )}

        {error && (
          <p style={{ fontSize: 12, color: "#c0392b", fontFamily: "'IBM Plex Mono', monospace" }}>
            {(error as any)?.shortMessage || error.message}
          </p>
        )}
      </div>
    </div>
  );
}

/* ── Main page ───────────────────────────────────────────────────────── */

export default function FactoryPage() {
  const { address } = useAccount();

  const { data: stats } = useReadContract({
    address: FACTORY_ADDRESS, abi: FACTORY_ABI, functionName: "getFactoryStats",
  });

  const { data: myAgents, isLoading } = useReadContract({
    address: FACTORY_ADDRESS, abi: FACTORY_ABI, functionName: "getAgentsByOwner",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  const [totalDeployed, totalTemplates, activeTemplates] = (stats as [bigint, bigint, bigint]) ?? [0n, 0n, 0n];

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 24px" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 32, flexWrap: "wrap", gap: 16 }}>
        <div>
          <h1 style={{ fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: 28, color: "var(--text)", letterSpacing: "-0.02em", marginBottom: 4 }}>
            Agent Factory
          </h1>
          <p style={{ fontSize: 14, color: "var(--muted)", fontFamily: "'IBM Plex Mono', monospace" }}>
            Deploy AI agents across the full 7-layer stack in a single transaction.
          </p>
        </div>
        <Link href="/factory/templates" className="btn btn-outline" style={{ fontSize: 13, padding: "8px 16px" }}>
          Browse Templates
        </Link>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 32 }}>
        {[
          ["Agents Deployed", totalDeployed.toString()],
          ["Templates", totalTemplates.toString()],
          ["Active Templates", activeTemplates.toString()],
        ].map(([label, val]) => (
          <div key={label} className="card" style={{ padding: "20px 24px", textAlign: "center" }}>
            <div style={{ fontSize: 28, fontWeight: 700, fontFamily: "'Inter', sans-serif", color: "#A0722A" }}>{val}</div>
            <div style={{ fontSize: 11, color: "var(--muted)", fontFamily: "'IBM Plex Mono', monospace", textTransform: "uppercase", letterSpacing: "0.1em", marginTop: 4 }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Deploy form */}
      <div style={{ marginBottom: 40 }}>
        <DeployForm />
      </div>

      {/* My agents */}
      <div>
        <h2 style={{ fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: 20, color: "var(--text)", marginBottom: 16 }}>
          My Agents
        </h2>

        {!address && (
          <div className="card" style={{ textAlign: "center", padding: 48 }}>
            <p style={{ color: "var(--muted)", fontSize: 14 }}>Connect wallet to see your deployed agents</p>
          </div>
        )}

        {address && isLoading && (
          <p style={{ textAlign: "center", color: "var(--muted)", padding: "48px 0" }}>Loading...</p>
        )}

        {address && myAgents && (myAgents as bigint[]).length === 0 && (
          <div className="card" style={{ textAlign: "center", padding: 48 }}>
            <p style={{ color: "var(--muted)", fontSize: 14, marginBottom: 12 }}>No agents deployed yet</p>
            <p style={{ fontSize: 13, color: "#A0722A" }}>Use the form above or <Link href="/factory/templates" style={{ textDecoration: "underline" }}>browse templates</Link> to get started.</p>
          </div>
        )}

        <div style={{ display: "grid", gap: 12 }}>
          {myAgents && (myAgents as bigint[]).map((id) => (
            <AgentRow key={id.toString()} id={id} />
          ))}
        </div>
      </div>
    </div>
  );
}
