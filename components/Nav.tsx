"use client";
import Link from "next/link";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useState } from "react";

const NAV_LINKS = [
  ["Agents", "/agents"],
  ["RFPs", "/rfps"],
  ["Orchestras", "/orchestras"],
  ["Retainers", "/retainers"],
  ["Staking", "/staking"],
  ["DAO", "/dao"],
  ["Dashboard", "/dashboard"],
];

export function Nav() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <header style={{
        height: 60, borderBottom: "1px solid #D4C5A9", background: "#F5F0E8",
        position: "sticky", top: 0, zIndex: 100,
      }}>
        <div style={{
          maxWidth: 1100, margin: "0 auto", padding: "0 24px", height: "100%",
          display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12,
        }}>
          <Link href="/" style={{
            fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: 16,
            letterSpacing: "-0.02em", color: "#1A1A1A", textDecoration: "none",
            whiteSpace: "nowrap", flexShrink: 0,
          }}>
            Arc Agent Hub
          </Link>

          <nav className="nav-desktop" style={{ display: "flex", gap: 2, alignItems: "center" }}>
            {NAV_LINKS.map(([l, h]) => (
              <Link key={h} href={h} style={{
                padding: "6px 10px", borderRadius: 6, fontSize: 12,
                fontFamily: "'IBM Plex Mono', monospace", fontWeight: 500,
                color: "#3D3530", textDecoration: "none", transition: "all .15s",
                letterSpacing: "0.01em",
              }}>
                {l}
              </Link>
            ))}
          </nav>

          <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
            <div className="nav-desktop">
              <ConnectButton chainStatus="none" showBalance={false} accountStatus="avatar" />
            </div>
            <button
              className="nav-hamburger"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle menu"
              style={{
                background: "#F5F0E8", border: "1px solid #D4C5A9", borderRadius: 8,
                padding: "7px 9px", cursor: "pointer", color: "#1A1A1A", lineHeight: 1,
                fontSize: 18, display: "none",
              }}
            >
              {menuOpen ? "✕" : "☰"}
            </button>
          </div>
        </div>
      </header>

      {menuOpen && (
        <div style={{
          position: "fixed", top: 60, left: 0, right: 0, bottom: 0,
          background: "#F5F0E8", zIndex: 99,
          display: "flex", flexDirection: "column",
          borderTop: "1px solid #D4C5A9", overflowY: "auto",
        }}>
          <nav style={{ padding: "8px 16px", display: "flex", flexDirection: "column", gap: 2 }}>
            {NAV_LINKS.map(([l, h]) => (
              <Link key={h} href={h} onClick={() => setMenuOpen(false)}
                style={{
                  padding: "14px 16px", borderRadius: 8, fontSize: 15,
                  fontFamily: "'IBM Plex Mono', monospace", fontWeight: 500,
                  color: "#1A1A1A", textDecoration: "none",
                  borderBottom: "1px solid #D4C5A9",
                }}>
                {l}
              </Link>
            ))}
          </nav>
          <div style={{ padding: "20px 16px", borderTop: "1px solid #D4C5A9" }}>
            <ConnectButton chainStatus="none" showBalance={false} />
          </div>
        </div>
      )}
    </>
  );
}
