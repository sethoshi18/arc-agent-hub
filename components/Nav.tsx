"use client";
import Link from "next/link";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useEffect, useState } from "react";

function ThemeToggle() {
  const [dark, setDark] = useState(false);
  useEffect(() => { setDark(document.documentElement.classList.contains("dark")); }, []);
  const toggle = () => {
    const next = !dark; setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  };
  return (
    <button onClick={toggle} title={dark ? "Light mode" : "Dark mode"}
      style={{ background:"var(--surface)", border:"1px solid var(--border)", borderRadius:8,
        padding:"7px 10px", cursor:"pointer", fontSize:14, color:"var(--muted)", lineHeight:1 }}>
      {dark ? "☀️" : "🌙"}
    </button>
  );
}

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
      <header style={{ height: 60, borderBottom: "1px solid var(--border)", background: "var(--bg)",
        position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px", height: "100%",
          display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>

          {/* Logo */}
          <Link href="/" style={{ fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: 16,
            letterSpacing: "-0.02em", color: "var(--text)", textDecoration: "none", whiteSpace: "nowrap",
            flexShrink: 0 }}>
            Arc Agent Hub
          </Link>

          {/* Desktop nav — hidden on mobile */}
          <nav className="nav-desktop" style={{ display: "flex", gap: 2, alignItems: "center" }}>
            {NAV_LINKS.map(([l, h]) => (
              <Link key={h} href={h} style={{ padding: "6px 10px", borderRadius: 6, fontSize: 12.5,
                fontFamily: "var(--font-heading)", fontWeight: 500, color: "var(--muted)",
                textDecoration: "none", transition: "all .1s", letterSpacing: "-0.01em" }}
                onMouseOver={e => { (e.currentTarget as HTMLElement).style.color = "var(--text)"; (e.currentTarget as HTMLElement).style.background = "var(--surface-2)"; }}
                onMouseOut={e => { (e.currentTarget as HTMLElement).style.color = "var(--muted)"; (e.currentTarget as HTMLElement).style.background = "transparent"; }}>
                {l}
              </Link>
            ))}
          </nav>

          {/* Right side — desktop: theme + wallet, mobile: theme + hamburger */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
            <ThemeToggle />
            <div className="nav-desktop">
              <ConnectButton chainStatus="none" showBalance={false} accountStatus="avatar" />
            </div>
            {/* Hamburger — mobile only */}
            <button
              className="nav-hamburger"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle menu"
              style={{
                background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8,
                padding: "7px 9px", cursor: "pointer", color: "var(--text)", lineHeight: 1,
                fontSize: 18, display: "none",
              }}
            >
              {menuOpen ? "✕" : "☰"}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile menu overlay */}
      {menuOpen && (
        <div className="nav-mobile-menu" style={{
          position: "fixed", top: 60, left: 0, right: 0, bottom: 0,
          background: "var(--bg)", zIndex: 99,
          display: "flex", flexDirection: "column",
          borderTop: "1px solid var(--border)",
          overflowY: "auto",
        }}>
          <nav style={{ padding: "8px 16px", display: "flex", flexDirection: "column", gap: 2 }}>
            {NAV_LINKS.map(([l, h]) => (
              <Link key={h} href={h} onClick={() => setMenuOpen(false)}
                style={{
                  padding: "14px 16px", borderRadius: 8, fontSize: 15,
                  fontFamily: "var(--font-heading)", fontWeight: 600, color: "var(--text)",
                  textDecoration: "none", transition: "background .1s",
                  borderBottom: "1px solid var(--border)",
                }}>
                {l}
              </Link>
            ))}
          </nav>
          <div style={{ padding: "20px 16px", borderTop: "1px solid var(--border)" }}>
            <ConnectButton chainStatus="none" showBalance={false} />
          </div>
        </div>
      )}
    </>
  );
}
