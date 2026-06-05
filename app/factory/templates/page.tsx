"use client";
import { useState } from "react";
import { useReadContract, useWriteContract, useWaitForTransactionReceipt, useAccount } from "wagmi";
import Link from "next/link";
import { FACTORY_ADDRESS, FACTORY_ABI, formatUsdc, intervalLabel, shortAddr } from "@/lib/factory";

/* ── Template card ───────────────────────────────────────────────────── */

function TemplateCard({ id }: { id: bigint }) {
  const { address } = useAccount();
  const [name, setName] = useState("");
  const [deploying, setDeploying] = useState(false);

  const { data: raw } = useReadContract({
    address: FACTORY_ADDRESS, abi: FACTORY_ABI, functionName: "getTemplate", args: [id],
  });

  const { writeContract, data: txHash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash: txHash });

  if (!raw) return null;
  const tmpl = raw as {
    id: bigint; name: string; description: string; defaultMetadataURI: string;
    suggestedHourlyRate: bigint; defaultCapabilities: readonly `0x${string}`[];
    suggestedRetainerPrice: bigint; suggestedRetainerInterval: bigint;
    suggestedStakeAmount: bigint; active: boolean; creator: string;
    createdAt: bigint; useCount: bigint;
  };

  function handleDeploy() {
    if (!name.trim() || !address) return;
    writeContract({
      address: FACTORY_ADDRESS, abi: FACTORY_ABI, functionName: "deployFromTemplate",
      args: [id, name.trim(), "", false, false, false],
      gas: BigInt(1_000_000),
    });
  }

  return (
    <div className="card" style={{ padding: 0, overflow: "hidden" }}>
      {/* Header */}
      <div style={{ padding: "24px 24px 16px", borderBottom: "1px solid #D4C5A9" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
          <h3 style={{ fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: 18, color: "var(--text)", margin: 0 }}>
            {tmpl.name}
          </h3>
          <span style={{
            fontSize: 11, fontFamily: "'IBM Plex Mono', monospace", padding: "3px 10px",
            borderRadius: 99, background: "rgba(160,114,42,0.08)", color: "#A0722A",
            border: "1px solid rgba(160,114,42,0.2)",
          }}>
            {tmpl.useCount.toString()} deployed
          </span>
        </div>
        <p style={{ fontSize: 13, color: "var(--muted)", fontFamily: "'IBM Plex Mono', monospace", lineHeight: 1.5, margin: 0 }}>
          {tmpl.description}
        </p>
      </div>

      {/* Config details */}
      <div style={{ padding: "16px 24px", display: "flex", flexWrap: "wrap", gap: 12 }}>
        {tmpl.suggestedHourlyRate > 0n && (
          <div style={{ fontSize: 12, fontFamily: "'IBM Plex Mono', monospace" }}>
            <span style={{ color: "var(--muted)" }}>Rate: </span>
            <span style={{ color: "var(--text)" }}>{formatUsdc(tmpl.suggestedHourlyRate)}/hr</span>
          </div>
        )}
        {tmpl.suggestedRetainerPrice > 0n && (
          <div style={{ fontSize: 12, fontFamily: "'IBM Plex Mono', monospace" }}>
            <span style={{ color: "var(--muted)" }}>Retainer: </span>
            <span style={{ color: "var(--text)" }}>{formatUsdc(tmpl.suggestedRetainerPrice)}/{intervalLabel(tmpl.suggestedRetainerInterval)}</span>
          </div>
        )}
        {tmpl.suggestedStakeAmount > 0n && (
          <div style={{ fontSize: 12, fontFamily: "'IBM Plex Mono', monospace" }}>
            <span style={{ color: "var(--muted)" }}>Stake: </span>
            <span style={{ color: "var(--text)" }}>{formatUsdc(tmpl.suggestedStakeAmount)}</span>
          </div>
        )}
        <div style={{ fontSize: 12, fontFamily: "'IBM Plex Mono', monospace" }}>
          <span style={{ color: "var(--muted)" }}>Caps: </span>
          <span style={{ color: "var(--text)" }}>{tmpl.defaultCapabilities.length} tags</span>
        </div>
      </div>

      {/* Deploy section */}
      <div style={{ padding: "16px 24px 24px", borderTop: "1px solid #D4C5A9" }}>
        {!deploying ? (
          <button
            onClick={() => setDeploying(true)}
            className="btn btn-primary"
            style={{ fontSize: 13, padding: "10px 20px", width: "100%" }}
            disabled={!address}
          >
            {address ? "Deploy from this template" : "Connect wallet to deploy"}
          </button>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <input
              type="text" value={name} onChange={(e) => setName(e.target.value)}
              placeholder="Agent name (e.g. MyDevBot)"
              autoFocus
              style={{
                width: "100%", padding: "10px 14px", borderRadius: 8, fontSize: 14,
                fontFamily: "'IBM Plex Mono', monospace", background: "#F5F0E8",
                border: "1px solid #D4C5A9", color: "#1A1A1A", outline: "none",
              }}
            />
            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={handleDeploy}
                disabled={!name.trim() || isPending || isConfirming}
                className="btn btn-primary"
                style={{ fontSize: 13, padding: "10px 16px", flex: 1 }}
              >
                {isPending ? "Confirm..." : isConfirming ? "Deploying..." : "Deploy"}
              </button>
              <button
                onClick={() => { setDeploying(false); setName(""); }}
                className="btn btn-outline"
                style={{ fontSize: 13, padding: "10px 16px" }}
              >
                Cancel
              </button>
            </div>
            {isSuccess && (
              <div style={{
                padding: "10px 14px", borderRadius: 8, background: "rgba(160,114,42,0.08)",
                border: "1px solid rgba(160,114,42,0.2)", fontSize: 12, color: "#A0722A",
                fontFamily: "'IBM Plex Mono', monospace",
              }}>
                Deployed!{" "}
                <a href={`https://testnet.arcscan.app/tx/${txHash}`} target="_blank" rel="noopener noreferrer"
                  style={{ textDecoration: "underline" }}>View tx</a>
              </div>
            )}
            {error && (
              <p style={{ fontSize: 11, color: "#c0392b", fontFamily: "'IBM Plex Mono', monospace", margin: 0 }}>
                {(error as any)?.shortMessage || error.message}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Main page ───────────────────────────────────────────────────────── */

export default function TemplatesPage() {
  const { data: templateIds, isLoading } = useReadContract({
    address: FACTORY_ADDRESS, abi: FACTORY_ABI, functionName: "getActiveTemplates",
  });

  const ids = (templateIds as bigint[]) ?? [];

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 24px" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 32, flexWrap: "wrap", gap: 16 }}>
        <div>
          <h1 style={{ fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: 28, color: "var(--text)", letterSpacing: "-0.02em", marginBottom: 4 }}>
            Agent Templates
          </h1>
          <p style={{ fontSize: 14, color: "var(--muted)", fontFamily: "'IBM Plex Mono', monospace" }}>
            Pre-configured agent archetypes. One-click deploy with template defaults.
          </p>
        </div>
        <Link href="/factory" className="btn btn-outline" style={{ fontSize: 13, padding: "8px 16px" }}>
          ← Back to Factory
        </Link>
      </div>

      {isLoading && (
        <p style={{ textAlign: "center", color: "var(--muted)", padding: "64px 0" }}>Loading templates...</p>
      )}

      {!isLoading && ids.length === 0 && (
        <div className="card" style={{ textAlign: "center", padding: 64 }}>
          <p style={{ fontSize: 16, fontFamily: "'Inter', sans-serif", fontWeight: 600, color: "var(--text)", marginBottom: 8 }}>
            No templates yet
          </p>
          <p style={{ fontSize: 13, color: "var(--muted)", fontFamily: "'IBM Plex Mono', monospace" }}>
            Templates will appear here once created on-chain.
          </p>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 20 }}>
        {ids.map((id) => (
          <TemplateCard key={id.toString()} id={id} />
        ))}
      </div>
    </div>
  );
}
