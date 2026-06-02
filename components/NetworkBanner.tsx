"use client";
import { useChainId } from "wagmi";

export function NetworkBanner() {
  const chainId = useChainId();
  const isArc = chainId === 5042002;

  if (isArc) return null;

  return (
    <div className="bg-yellow-900/30 border border-yellow-700/50 text-yellow-300 text-sm px-4 py-2 rounded-lg mb-6">
      ⚠️ Switch to <strong>Arc Testnet</strong> (Chain ID 5042002) to interact with contracts.
      Add it in MetaMask: RPC <code className="font-mono text-xs">https://rpc.testnet.arc.network</code>
    </div>
  );
}
