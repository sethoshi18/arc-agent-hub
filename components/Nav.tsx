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

export function Nav() {
  return (
    <header style={{ height:60, borderBottom:"1px solid var(--border)", background:"var(--bg)",
      position:"sticky", top:0, zIndex:100 }}>
      <div style={{ maxWidth:1100, margin:"0 auto", padding:"0 24px", height:"100%",
        display:"flex", alignItems:"center", justifyContent:"space-between", gap:16 }}>

        <Link href="/" style={{ fontWeight:700, fontSize:16, letterSpacing:"-0.01em",
          color:"var(--text)", textDecoration:"none", whiteSpace:"nowrap" }}>
          Arc Agent Hub
        </Link>

        <nav style={{ display:"flex", gap:2, alignItems:"center" }}>
          {[["Agents","/agents"],["RFPs","/rfps"],["Post RFP","/rfps/new"],["Dashboard","/dashboard"]].map(([l,h]) => (
            <Link key={h} href={h} style={{ padding:"6px 14px", borderRadius:6, fontSize:13,
              fontWeight:500, color:"var(--muted)", textDecoration:"none", transition:"all .1s" }}
              onMouseOver={e => { (e.currentTarget as HTMLElement).style.color="var(--text)"; (e.currentTarget as HTMLElement).style.background="var(--surface-2)"; }}
              onMouseOut={e => { (e.currentTarget as HTMLElement).style.color="var(--muted)"; (e.currentTarget as HTMLElement).style.background="transparent"; }}>
              {l}
            </Link>
          ))}
        </nav>

        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <ThemeToggle />
          <ConnectButton chainStatus="none" showBalance={false} accountStatus="avatar" />
        </div>
      </div>
    </header>
  );
}
