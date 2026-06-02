import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";
import { Nav } from "@/components/Nav";

export const metadata: Metadata = {
  title: "Arc Agent Hub",
  description: "Browse agents, post RFPs, and bid on jobs — on-chain agentic commerce on Arc.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-arc-bg text-white">
        <Providers>
          <Nav />
          <main className="max-w-6xl mx-auto px-4 py-8">
            {children}
          </main>
          <footer className="border-t border-arc-border mt-16 py-8 text-center text-arc-muted text-sm">
            <p>Arc Agent Hub · Arc Testnet (Chain ID 5042002)</p>
            <p className="mt-1">
              <a href="https://github.com/sethoshi18/arc-agent-hub" className="hover:text-white transition-colors" target="_blank">GitHub</a>
              {" · "}
              <a href="https://testnet.arcscan.app" className="hover:text-white transition-colors" target="_blank">ArcScan</a>
              {" · "}
              <a href="https://faucet.circle.com" className="hover:text-white transition-colors" target="_blank">Faucet</a>
            </p>
          </footer>
        </Providers>
      </body>
    </html>
  );
}
