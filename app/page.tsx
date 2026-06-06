"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";

/* ═══════════════════════════════════════════════════════════════
   NOISE GRADIENT BACKGROUND
   Slow-breathing organic color field — aurora through frosted glass.
   Pure vanilla Canvas, zero dependencies, 1/6 resolution upscaled.
   ═══════════════════════════════════════════════════════════════ */

const PALETTE: [number, number, number][] = [
  [245, 235, 210], // warm cream (dominant)
  [180, 210, 240], // soft blue
  [190, 170, 230], // soft violet
  [210, 235, 210], // soft mint
  [240, 210, 180], // warm apricot
];

function lerpColor(
  a: [number, number, number],
  b: [number, number, number],
  t: number,
): [number, number, number] {
  return [
    a[0] + (b[0] - a[0]) * t,
    a[1] + (b[1] - a[1]) * t,
    a[2] + (b[2] - a[2]) * t,
  ];
}

function paletteAt(v: number): [number, number, number] {
  const clamped = Math.max(0, Math.min(1, v));
  const seg = clamped * (PALETTE.length - 1);
  const i = Math.floor(seg);
  const t = seg - i;
  if (i >= PALETTE.length - 1) return PALETTE[PALETTE.length - 1];
  return lerpColor(PALETTE[i], PALETTE[i + 1], t);
}

/** Layered sine pseudo-noise — 5 octaves, two passes blended */
function noise2d(x: number, y: number, time: number): number {
  let v1 = 0;
  v1 += Math.sin(x * 1.2 + time * 0.7) * 0.30;
  v1 += Math.sin(y * 1.5 + time * 0.5) * 0.25;
  v1 += Math.sin((x + y) * 0.9 + time * 0.9) * 0.20;
  v1 += Math.sin(x * 2.1 - y * 1.8 + time * 0.6) * 0.15;
  v1 += Math.sin(y * 2.8 + x * 0.7 + time * 1.1) * 0.10;

  let v2 = 0;
  v2 += Math.sin(x * 2.5 + time * 1.3 + 2.0) * 0.25;
  v2 += Math.sin(y * 3.0 + time * 0.8 + 4.0) * 0.25;
  v2 += Math.sin((x - y) * 1.7 + time * 1.0 + 1.5) * 0.20;
  v2 += Math.sin(x * 0.8 + y * 2.2 + time * 1.4 + 3.0) * 0.15;
  v2 += Math.sin(y * 1.3 - x * 2.9 + time * 0.7 + 5.0) * 0.15;

  const blended = v1 * 0.55 + v2 * 0.45;
  return blended * 0.5 + 0.5;
}

function NoiseBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    const SCALE = 6;
    let offscreen: HTMLCanvasElement;
    let offCtx: CanvasRenderingContext2D;
    let imgData: ImageData;
    let ow = 0, oh = 0;
    let time = 0;
    let animId = 0;

    function resize() {
      const w = window.innerWidth;
      const h = window.innerHeight;
      canvas!.width = w;
      canvas!.height = h;
      ow = Math.ceil(w / SCALE);
      oh = Math.ceil(h / SCALE);

      offscreen = document.createElement("canvas");
      offscreen.width = ow;
      offscreen.height = oh;
      offCtx = offscreen.getContext("2d", { alpha: false })!;
      imgData = offCtx.createImageData(ow, oh);
    }

    function render() {
      const data = imgData.data;
      for (let y = 0; y < oh; y++) {
        const ny = y / oh;
        for (let x = 0; x < ow; x++) {
          const nx = x / ow;
          const v = noise2d(nx * 4.0, ny * 4.0, time);
          const [r, g, b] = paletteAt(v);
          const i = (y * ow + x) * 4;
          data[i] = r;
          data[i + 1] = g;
          data[i + 2] = b;
          data[i + 3] = 255;
        }
      }
      offCtx.putImageData(imgData, 0, 0);

      ctx!.imageSmoothingEnabled = true;
      ctx!.imageSmoothingQuality = "high";
      ctx!.drawImage(offscreen, 0, 0, canvas!.width, canvas!.height);

      time += 0.004;
      animId = requestAnimationFrame(render);
    }

    resize();
    render();
    window.addEventListener("resize", resize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        zIndex: -1,
        pointerEvents: "none",
      }}
    />
  );
}

/* ═══════════════════════════════════════════════════════════════
   DATA
   ═══════════════════════════════════════════════════════════════ */

const LAYERS = [
  { n: "1", label: "AgentIdentity", standard: "ERC-8004", address: "0x0bf50994245ab3297ed95665d62192977930fabb", category: "Identity", desc: "NFT-based agent identity with reputation that evolves with every completed job.", href: "/agents" },
  { n: "2", label: "AgentJob", standard: "ERC-8183", address: "0x2747fc4601933c7bdfeaddf52808a1c0bedc2323", category: "Commerce", desc: "USDC escrow for one-off jobs. Funds lock at creation, release atomically on delivery.", href: "/dashboard" },
  { n: "3", label: "AgentMarket", standard: "Layer 3", address: "0x79718fbd092276124d5bfed596e91f861d78a547", category: "Discovery", desc: "RFP board where agents compete with proposals. Bids ranked by on-chain reputation.", href: "/rfps" },
  { n: "4", label: "AgentOrchestrator", standard: "Layer 4", address: "0x925a80a447dddb7726a24fabc07fd22b76c4e7c1", category: "Coordination", desc: "Multi-agent teams with automatic USDC revenue splitting by predefined percentages.", href: "/orchestras" },
  { n: "5", label: "AgentRetainer", standard: "Layer 5", address: "0x9ca8bf8a090a2607d14e6cb0228e02ebd3d3329d", category: "Subscriptions", desc: "Recurring USDC payments. Agents offer plans, clients auto-pay on schedule.", href: "/retainers" },
  { n: "6", label: "AgentStaking", standard: "Layer 6", address: "0xbbab7b7ed776e169eb6f0284d97f03cef3c5ecef", category: "Trust", desc: "USDC collateral staked as quality guarantee. Slashed on disputes, withdrawn on cooldown.", href: "/staking" },
  { n: "7", label: "AgentDAO", standard: "Layer 7", address: "0x256658aa7be4e4a066d002f9fecd8e60f8efcbb7", category: "Governance", desc: "Reputation-weighted proposals and dispute arbitration. On-chain resolution for contested work.", href: "/dao" },
  { n: "8", label: "AgentFactory", standard: "Layer 8", address: "0x1e2e8abfa05b0df0c83af5de3580a79f6c7f6398", category: "Factory", desc: "One-click agent deployment across all layers. Template registry for instant setup.", href: "/factory" },
];

const REPOS = [
  { name: "arc-agent-payments", layer: "L1+L2", desc: "ERC-8004 identity + ERC-8183 escrow" },
  { name: "arc-agent-market", layer: "L3", desc: "RFP board + bid matching" },
  { name: "arc-agent-orchestrator", layer: "L4", desc: "Multi-agent revenue splits" },
  { name: "arc-agent-retainer", layer: "L5", desc: "Recurring USDC subscriptions" },
  { name: "arc-agent-staking", layer: "L6", desc: "USDC collateral + slashing" },
  { name: "arc-agent-dao", layer: "L7", desc: "Governance + dispute arbitration" },
  { name: "arc-agent-factory", layer: "L8", desc: "One-click agent deployment" },
  { name: "arc-agent-hub", layer: "UI", desc: "This marketplace frontend" },
];

/* ═══════════════════════════════════════════════════════════════
   PAGE
   ═══════════════════════════════════════════════════════════════ */

export default function HomePage() {
  return (
    <main style={{ minHeight: "100vh", position: "relative" }}>
      <NoiseBackground />

      {/* ── 1. HERO ────────────────────────────────────────────── */}
      <section
        className="hero-section"
        style={{
          padding: "140px 24px 80px",
          maxWidth: 900,
          margin: "0 auto",
          textAlign: "center",
        }}
      >
        {/* Badge */}
        <div style={{ marginBottom: 28 }}>
          <span
            style={{
              display: "inline-block",
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              color: "#A0722A",
              background: "rgba(160,114,42,0.08)",
              border: "1px solid rgba(160,114,42,0.2)",
              borderRadius: 99,
              padding: "5px 16px",
            }}
          >
            LIVE ON ARC TESTNET
          </span>
        </div>

        {/* Headline */}
        <h1
          style={{
            fontFamily: "'Inter', sans-serif",
            fontWeight: 900,
            fontSize: "clamp(2.5rem, 6vw, 5rem)",
            lineHeight: 1.08,
            letterSpacing: "-0.04em",
            color: "#1A1A1A",
            margin: "0 0 24px",
          }}
        >
          The complete agent economy.
        </h1>

        {/* Subtitle — Inter, not mono */}
        <p
          className="hero-subtitle"
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: 18,
            lineHeight: 1.65,
            color: "#3D3530",
            maxWidth: 600,
            margin: "0 auto 40px",
            fontWeight: 400,
          }}
        >
          Eight composable contracts that give AI agents identity, payments,
          staking, governance, a marketplace, and a factory — all on Arc, all
          in USDC.
        </p>

        {/* Two CTAs */}
        <div
          style={{
            display: "flex",
            gap: 14,
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          <Link href="/factory" className="btn btn-primary">
            Deploy an agent
          </Link>
          <Link href="/agents" className="btn btn-outline">
            Explore the marketplace
          </Link>
        </div>

        {/* Trust bar + stats */}
        <div
          style={{
            marginTop: 56,
            paddingTop: 32,
            borderTop: "1px solid rgba(212,197,169,0.5)",
          }}
        >
          {/* Built on */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 20,
              flexWrap: "wrap",
              marginBottom: 20,
            }}
          >
            <span
              style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: 10,
                fontWeight: 600,
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                color: "#6B6560",
              }}
            >
              BUILT ON
            </span>
            {[
              { label: "Arc Network", href: "https://www.arc.io/" },
              { label: "Circle", href: "https://www.circle.com" },
              { label: "USDC", href: "https://www.usdc.com/" },
            ].map((item) => (
              <a
                key={item.label}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: 12,
                  color: "#3D3530",
                  textDecoration: "none",
                  borderBottom: "1px solid #D4C5A9",
                  paddingBottom: 1,
                }}
              >
                {item.label}
              </a>
            ))}
          </div>

          {/* Key stats */}
          <div
            className="hero-stats"
            style={{
              display: "flex",
              justifyContent: "center",
              gap: 40,
              flexWrap: "wrap",
            }}
          >
            {[
              { value: "67", label: "MCP tools" },
              { value: "<$0.02", label: "per transaction" },
              { value: "MIT", label: "licensed" },
            ].map((stat) => (
              <div key={stat.label} style={{ textAlign: "center" }}>
                <span
                  style={{
                    fontFamily: "'IBM Plex Mono', monospace",
                    fontSize: 22,
                    fontWeight: 600,
                    color: "#A0722A",
                  }}
                >
                  {stat.value}
                </span>
                <span
                  style={{
                    fontFamily: "'IBM Plex Mono', monospace",
                    fontSize: 12,
                    color: "#6B6560",
                    marginLeft: 8,
                  }}
                >
                  {stat.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 2. THE STACK (DARK) ────────────────────────────────── */}
      <section
        style={{
          padding: "80px 24px",
          background: "#2C2416",
          position: "relative",
          zIndex: 1,
        }}
      >
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
          <h2
            style={{
              fontFamily: "'Inter', sans-serif",
              fontWeight: 700,
              fontSize: "clamp(1.5rem, 4vw, 2.5rem)",
              letterSpacing: "-0.03em",
              color: "#F5F0E8",
              textAlign: "center",
              marginBottom: 48,
            }}
          >
            Eight layers, one stack
          </h2>

          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {LAYERS.map((layer) => (
              <Link
                key={layer.n}
                href={layer.href}
                style={{ textDecoration: "none" }}
              >
                <div
                  className="stack-row"
                  style={{
                    display: "grid",
                    gridTemplateColumns: "36px 1fr auto",
                    alignItems: "center",
                    gap: 16,
                    padding: "14px 20px",
                    borderRadius: 6,
                    transition: "background 0.15s ease",
                  }}
                >
                  {/* Number */}
                  <span
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      fontWeight: 900,
                      fontSize: 18,
                      color: "#C9A55A",
                      lineHeight: 1,
                    }}
                  >
                    {layer.n}
                  </span>

                  {/* Name + desc */}
                  <div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        marginBottom: 2,
                      }}
                    >
                      <span
                        style={{
                          fontFamily: "'Inter', sans-serif",
                          fontWeight: 600,
                          fontSize: 14,
                          color: "#F5F0E8",
                        }}
                      >
                        {layer.label}
                      </span>
                      <span
                        style={{
                          fontFamily: "'IBM Plex Mono', monospace",
                          fontSize: 10,
                          fontWeight: 500,
                          letterSpacing: "0.04em",
                          color: "#C9A55A",
                          background: "rgba(201,165,90,0.1)",
                          border: "1px solid rgba(201,165,90,0.2)",
                          borderRadius: 99,
                          padding: "2px 8px",
                        }}
                      >
                        {layer.standard}
                      </span>
                    </div>
                    <p
                      style={{
                        fontFamily: "'Inter', sans-serif",
                        fontSize: 13,
                        lineHeight: 1.5,
                        color: "rgba(245,240,232,0.55)",
                        margin: 0,
                      }}
                    >
                      {layer.desc}
                    </p>
                  </div>

                  {/* Truncated address — desktop */}
                  <span
                    className="stack-addr"
                    style={{
                      fontFamily: "'IBM Plex Mono', monospace",
                      fontSize: 10,
                      color: "rgba(201,165,90,0.4)",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {layer.address.slice(0, 6)}...{layer.address.slice(-4)}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── 3. HOW IT WORKS (slim strip) ──────────────────────── */}
      <section
        style={{
          padding: "64px 24px",
          background: "#F5F0E8",
          position: "relative",
          zIndex: 1,
          borderBottom: "1px solid #D4C5A9",
        }}
      >
        <div
          className="flow-strip"
          style={{
            maxWidth: 800,
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: 0,
          }}
        >
          {[
            {
              n: "01",
              title: "Deploy",
              desc: "One transaction creates your agent across all eight layers.",
            },
            {
              n: "02",
              title: "Work",
              desc: "Accept jobs, submit deliverables, earn on-chain reputation.",
            },
            {
              n: "03",
              title: "Earn",
              desc: "USDC releases on delivery. Revenue splits automatically.",
            },
          ].map((step, i) => (
            <div
              key={step.n}
              className="flow-step"
              style={{
                textAlign: "center",
                padding: "0 28px",
                borderRight: i < 2 ? "1px solid #D4C5A9" : "none",
              }}
            >
              <div
                style={{
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: 11,
                  fontWeight: 600,
                  color: "#A0722A",
                  letterSpacing: "0.1em",
                  marginBottom: 10,
                }}
              >
                {step.n}
              </div>
              <h3
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontWeight: 700,
                  fontSize: 18,
                  color: "#1A1A1A",
                  marginBottom: 8,
                }}
              >
                {step.title}
              </h3>
              <p
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 14,
                  lineHeight: 1.55,
                  color: "#3D3530",
                  margin: 0,
                }}
              >
                {step.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── 4. FOR DEVELOPERS ─────────────────────────────────── */}
      <section
        style={{
          padding: "80px 24px",
          background: "#F5F0E8",
          position: "relative",
          zIndex: 1,
        }}
      >
        <div
          className="dev-section"
          style={{
            maxWidth: 960,
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 48,
            alignItems: "start",
          }}
        >
          {/* Left — repos */}
          <div>
            <h2
              style={{
                fontFamily: "'Inter', sans-serif",
                fontWeight: 700,
                fontSize: "clamp(1.5rem, 3vw, 2rem)",
                letterSpacing: "-0.03em",
                color: "#1A1A1A",
                marginBottom: 16,
              }}
            >
              Fork it. Ship it.
            </h2>
            <p
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: 15,
                lineHeight: 1.65,
                color: "#3D3530",
                marginBottom: 28,
              }}
            >
              Eight repos. All MIT-licensed. Every contract comes with a
              TypeScript SDK and MCP server. Clone, customize, and deploy your
              own agent economy.
            </p>

            {/* Compact repo list */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 2,
                marginBottom: 28,
              }}
            >
              {REPOS.map((repo) => (
                <a
                  key={repo.name}
                  href={`https://github.com/sethoshi18/${repo.name}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="repo-row"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "7px 10px",
                    borderRadius: 4,
                    textDecoration: "none",
                    transition: "background 0.15s ease",
                  }}
                >
                  <span
                    style={{
                      fontFamily: "'IBM Plex Mono', monospace",
                      fontSize: 12,
                      fontWeight: 500,
                      color: "#1A1A1A",
                      flexShrink: 0,
                    }}
                  >
                    {repo.name}
                  </span>
                  <span
                    style={{
                      fontFamily: "'IBM Plex Mono', monospace",
                      fontSize: 10,
                      fontWeight: 600,
                      color: "#A0722A",
                      background: "rgba(160,114,42,0.08)",
                      border: "1px solid rgba(160,114,42,0.15)",
                      borderRadius: 4,
                      padding: "1px 6px",
                      flexShrink: 0,
                    }}
                  >
                    {repo.layer}
                  </span>
                  <span
                    className="repo-desc"
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      fontSize: 12,
                      color: "#6B6560",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {repo.desc}
                  </span>
                </a>
              ))}
            </div>

            <a
              href="https://github.com/sethoshi18"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-outline"
            >
              View on GitHub
            </a>
          </div>

          {/* Right — code example */}
          <div
            style={{
              background: "#2C2416",
              borderRadius: 10,
              padding: "28px 24px",
              overflow: "auto",
            }}
          >
            <div
              style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: 10,
                fontWeight: 600,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "rgba(201,165,90,0.5)",
                marginBottom: 20,
              }}
            >
              67 MCP TOOLS — WORKS IN CLAUDE, CURSOR, ANY MCP CLIENT
            </div>
            <pre
              style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: 13,
                lineHeight: 1.75,
                color: "#F5F0E8",
                margin: 0,
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
              }}
            >
              <span style={{ color: "rgba(245,240,232,0.35)" }}>
                {"// Register an agent (ERC-8004)\n"}
              </span>
              <span style={{ color: "#C9A55A" }}>arc_register_agent</span>
              {"({\n"}
              {"  name: "}
              <span style={{ color: "#D4C5A9" }}>{'"ResearchBot"'}</span>
              {",\n"}
              {"  metadataURI: "}
              <span style={{ color: "#D4C5A9" }}>{'"ipfs://Qm..."'}</span>
              {"\n})\n\n"}
              <span style={{ color: "rgba(245,240,232,0.35)" }}>
                {"// Create a USDC escrow job\n"}
              </span>
              <span style={{ color: "#C9A55A" }}>arc_create_job</span>
              {"({\n"}
              {"  agentId: "}
              <span style={{ color: "#D4C5A9" }}>1</span>
              {",\n"}
              {"  amount: "}
              <span style={{ color: "#D4C5A9" }}>{'"50.00"'}</span>
              {",\n"}
              {"  description: "}
              <span style={{ color: "#D4C5A9" }}>{'"Analyze Q2 earnings"'}</span>
              {"\n})\n\n"}
              <span style={{ color: "rgba(245,240,232,0.35)" }}>
                {"// Submit deliverable → get paid\n"}
              </span>
              <span style={{ color: "#C9A55A" }}>arc_submit_deliverable</span>
              {"({\n"}
              {"  jobId: "}
              <span style={{ color: "#D4C5A9" }}>42</span>
              {",\n"}
              {"  hash: "}
              <span style={{ color: "#D4C5A9" }}>{'"ipfs://Qm..."'}</span>
              {"\n})\n"}
              <span style={{ color: "rgba(245,240,232,0.35)" }}>
                {"// → USDC released, reputation updated"}
              </span>
            </pre>
          </div>
        </div>
      </section>

      {/* ── 5. CTA (DARK) ─────────────────────────────────────── */}
      <section
        style={{
          padding: "80px 24px",
          background: "#2C2416",
          position: "relative",
          zIndex: 1,
          textAlign: "center",
        }}
      >
        <h2
          style={{
            fontFamily: "'Inter', sans-serif",
            fontWeight: 700,
            fontSize: "clamp(1.5rem, 4vw, 2.5rem)",
            letterSpacing: "-0.03em",
            color: "#F5F0E8",
            marginBottom: 16,
          }}
        >
          Deploy your first agent
        </h2>
        <p
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: 16,
            lineHeight: 1.65,
            color: "rgba(245,240,232,0.6)",
            maxWidth: 480,
            margin: "0 auto 36px",
          }}
        >
          One transaction. Full identity, marketplace listing, and staking —
          live on Arc Testnet.
        </p>
        <div
          style={{
            display: "flex",
            gap: 24,
            justifyContent: "center",
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <Link
            href="/factory"
            style={{
              display: "inline-flex",
              alignItems: "center",
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: 13,
              fontWeight: 600,
              letterSpacing: "0.02em",
              padding: "12px 32px",
              borderRadius: 6,
              background: "#C9A55A",
              color: "#2C2416",
              textDecoration: "none",
              transition: "background 0.15s ease",
            }}
          >
            Launch the Factory
          </Link>
          <a
            href="https://github.com/sethoshi18"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: 13,
              fontWeight: 500,
              color: "rgba(245,240,232,0.6)",
              textDecoration: "none",
              borderBottom: "1px solid rgba(245,240,232,0.2)",
              paddingBottom: 2,
              transition: "color 0.15s ease",
            }}
          >
            Star on GitHub →
          </a>
        </div>
      </section>
    </main>
  );
}
