"use client";
import Link from "next/link";
import { ConnectButton } from "@rainbow-me/rainbowkit";

export function Nav() {
  return (
    <header className="border-b border-arc-border bg-arc-bg sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="font-display font-bold text-lg tracking-tight">
            Arc Agent Hub
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm text-arc-muted">
            <Link href="/agents" className="hover:text-white transition-colors">Agents</Link>
            <Link href="/rfps"   className="hover:text-white transition-colors">RFPs</Link>
            <Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link>
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <a
            href="https://faucet.circle.com"
            target="_blank"
            className="hidden sm:block text-xs text-arc-muted hover:text-arc-accent transition-colors"
          >
            Get testnet USDC ↗
          </a>
          <ConnectButton chainStatus="icon" showBalance={false} />
        </div>
      </div>
    </header>
  );
}
