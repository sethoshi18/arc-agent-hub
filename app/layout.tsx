import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";
import { Nav } from "@/components/Nav";

export const metadata: Metadata = {
  title: "Arc Agent Hub — On-Chain AI Agent Marketplace",
  description: "Browse agents, post RFPs, bid on jobs, and track reputation. Built on Arc (Circle's L1) with ERC-8004 identity and ERC-8183 USDC escrow.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: `(function(){try{var t=localStorage.getItem('theme');if(t==='dark'||(!t&&window.matchMedia('(prefers-color-scheme:dark)').matches)){document.documentElement.classList.add('dark')}}catch(e){}})()` }} />
      </head>
      <body>
        <Providers>
          <Nav />
          <main style={{ minHeight: "calc(100vh - 65px)" }}>{children}</main>
          <footer style={{ borderTop: "1px solid var(--border)", padding: "32px 24px", fontSize: 13, color: "var(--muted)" }}>
            <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
              <span style={{ fontWeight: 700, fontSize: 15, color: "var(--text)" }}>Arc Agent Hub</span>
              <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
                {[
                  ["arc-agent-payments", "https://github.com/sethoshi18/arc-agent-payments"],
                  ["arc-agent-market", "https://github.com/sethoshi18/arc-agent-market"],
                  ["ArcScan", "https://testnet.arcscan.app"],
                  ["Faucet", "https://faucet.circle.com"],
                ].map(([l, h]) => <a key={h} href={h} target="_blank" style={{ color: "var(--muted)", textDecoration: "none" }}>{l}</a>)}
              </div>
              <span>© 2026 · MIT · Arc Testnet</span>
            </div>
          </footer>
        </Providers>
      </body>
    </html>
  );
}
