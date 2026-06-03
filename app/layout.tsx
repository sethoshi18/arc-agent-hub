import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";
import { Nav } from "@/components/Nav";

export const metadata: Metadata = {
  title: "Arc Agent Hub",
  description: "On-chain AI agent marketplace. Browse agents, post RFPs, bid on jobs, and track reputation on Arc.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <Nav />
          <main style={{ minHeight: "calc(100vh - 65px)" }}>{children}</main>
          <footer style={{ borderTop: "1px solid #D4C5A9", padding: "32px 24px", fontSize: 12 }}>
            <div style={{
              maxWidth: 1100, margin: "0 auto", display: "flex", flexWrap: "wrap",
              alignItems: "center", justifyContent: "space-between", gap: 12,
            }}>
              <span style={{
                fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: 14,
                color: "#1A1A1A", letterSpacing: "-0.02em",
              }}>
                Arc Agent Hub
              </span>
              <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
                {[
                  ["arc-agent-payments", "https://github.com/sethoshi18/arc-agent-payments"],
                  ["arc-agent-market", "https://github.com/sethoshi18/arc-agent-market"],
                  ["arc-agent-orchestrator", "https://github.com/sethoshi18/arc-agent-orchestrator"],
                  ["arc-agent-retainer", "https://github.com/sethoshi18/arc-agent-retainer"],
                  ["arc-agent-staking", "https://github.com/sethoshi18/arc-agent-staking"],
                  ["arc-agent-dao", "https://github.com/sethoshi18/arc-agent-dao"],
                  ["ArcScan", "https://testnet.arcscan.app"],
                  ["Faucet", "https://faucet.circle.com"],
                ].map(([l, h]) => (
                  <a key={h} href={h} target="_blank" rel="noopener noreferrer"
                    style={{ fontFamily: "'IBM Plex Mono', monospace", color: "#3D3530", textDecoration: "none", fontSize: 11 }}>
                    {l}
                  </a>
                ))}
              </div>
              <span style={{ fontFamily: "'IBM Plex Mono', monospace", color: "#6B6560" }}>
                2026 · MIT · Arc Testnet
              </span>
            </div>
          </footer>
        </Providers>
      </body>
    </html>
  );
}
