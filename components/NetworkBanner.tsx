"use client";
import { useChainId } from "wagmi";

export function NetworkBanner() {
  const chainId = useChainId();
  if (chainId === 5042002) return null;

  return (
    <div className="card" style={{ padding: "12px 16px", marginBottom: 20, fontSize: 13, color: "var(--muted)" }}>
      Switch to <strong style={{ color: "var(--text)" }}>Arc Testnet</strong> (Chain ID 5042002) —
      RPC: <code style={{ fontFamily: "JetBrains Mono,monospace", fontSize: 11 }}>https://rpc.testnet.arc.network</code>
    </div>
  );
}
