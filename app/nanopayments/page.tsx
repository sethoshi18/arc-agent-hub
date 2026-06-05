"use client";
import { useState, useCallback } from "react";
import Link from "next/link";

interface BalanceData {
  seller: string;
  wallet: { balance: string };
  gateway: { total: string; available: string; withdrawing: string };
}

interface InferenceResult {
  model: string;
  task: string;
  input: string;
  result: string;
  tokens_used: number;
  cost_usdc: string;
  timestamp: string;
}

export default function NanopaymentsPage() {
  const [balance, setBalance] = useState<BalanceData | null>(null);
  const [loading, setLoading] = useState(false);
  const [testResult, setTestResult] = useState<InferenceResult | null>(null);
  const [testLoading, setTestLoading] = useState(false);

  const fetchBalance = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/nanopay/balance");
      const data = await res.json();
      setBalance(data);
    } catch (err) {
      console.error("Failed to fetch balance:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const testInference = useCallback(async () => {
    setTestLoading(true);
    try {
      // This will return 402 without payment — demonstrates the paywall
      const res = await fetch("/api/nanopay/inference?task=sentiment");
      if (res.status === 402) {
        const paymentHeader = res.headers.get("PAYMENT-REQUIRED");
        if (paymentHeader) {
          const req = JSON.parse(atob(paymentHeader));
          setTestResult({
            model: "PAYWALL ACTIVE",
            task: "sentiment",
            input: "N/A",
            result: `HTTP 402 — Payment Required: ${req.accepts?.[0]?.amount ? (Number(req.accepts[0].amount) / 1e6).toFixed(4) : "?"} USDC via Circle Gateway. Use the buyer agent script to pay and access this endpoint.`,
            tokens_used: 0,
            cost_usdc: req.accepts?.[0]?.amount ? (Number(req.accepts[0].amount) / 1e6).toFixed(4) : "0.001",
            timestamp: new Date().toISOString(),
          });
        }
      } else {
        const data = await res.json();
        setTestResult(data);
      }
    } catch (err) {
      console.error("Inference test failed:", err);
    } finally {
      setTestLoading(false);
    }
  }, []);

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "40px 24px" }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
          <h1 style={{ fontWeight: 700, fontSize: 28, color: "var(--text)", letterSpacing: "-0.02em" }}>
            Nanopayments
          </h1>
          <span className="badge" style={{ fontSize: 10 }}>LAYER 8</span>
        </div>
        <p style={{ fontSize: 14, color: "var(--muted)", maxWidth: 600, lineHeight: 1.6 }}>
          Sub-cent USDC micropayments for agent services on Arc. AI agents pay per-inference,
          per-query, or per-compute call using Circle Gateway nanopayments.
        </p>
      </div>

      {/* How It Works */}
      <div className="card" style={{ padding: 24, marginBottom: 20 }}>
        <h2 style={{ fontWeight: 700, fontSize: 16, color: "var(--text)", marginBottom: 16 }}>
          How It Works
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
          {[
            { step: "1", title: "Deposit", desc: "Agent deposits USDC into Circle Gateway on Arc" },
            { step: "2", title: "Request", desc: "Agent calls paywalled endpoint, receives HTTP 402" },
            { step: "3", title: "Sign", desc: "Agent signs EIP-3009 authorization (zero gas)" },
            { step: "4", title: "Settle", desc: "Circle batches and settles onchain via TEE" },
          ].map((s) => (
            <div key={s.step} style={{ textAlign: "center" }}>
              <div style={{
                width: 36, height: 36, borderRadius: "50%", background: "rgba(160,114,42,0.08)",
                border: "1px solid rgba(160,114,42,0.2)", display: "flex", alignItems: "center",
                justifyContent: "center", margin: "0 auto 8px", fontFamily: "'Inter', sans-serif",
                fontWeight: 700, fontSize: 14, color: "#A0722A",
              }}>
                {s.step}
              </div>
              <p style={{ fontWeight: 600, fontSize: 13, color: "var(--text)", marginBottom: 4 }}>{s.title}</p>
              <p style={{ fontSize: 11, color: "var(--muted)", lineHeight: 1.4 }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Available Endpoints */}
      <div className="card" style={{ padding: 24, marginBottom: 20 }}>
        <h2 style={{ fontWeight: 700, fontSize: 16, color: "var(--text)", marginBottom: 16 }}>
          Paywalled Agent Services
        </h2>
        <div style={{ display: "grid", gap: 12 }}>
          {[
            {
              endpoint: "/api/nanopay/inference",
              price: "$0.001",
              method: "GET / POST",
              desc: "AI inference — sentiment analysis, summarization, classification",
            },
            {
              endpoint: "/api/nanopay/data",
              price: "$0.0005",
              method: "GET",
              desc: "Marketplace analytics — agent rankings, job volume, category trends",
            },
          ].map((ep) => (
            <div key={ep.endpoint} style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "14px 16px", background: "var(--surface-2)", borderRadius: 8,
              border: "1px solid var(--border)",
            }}>
              <div>
                <code style={{
                  fontFamily: "'IBM Plex Mono', monospace", fontSize: 13, fontWeight: 500,
                  color: "var(--text)",
                }}>
                  {ep.endpoint}
                </code>
                <p style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>{ep.desc}</p>
              </div>
              <div style={{ textAlign: "right", flexShrink: 0, marginLeft: 16 }}>
                <span className="badge" style={{ fontSize: 11 }}>{ep.price} USDC</span>
                <p style={{ fontSize: 10, color: "var(--muted)", marginTop: 2 }}>{ep.method}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Live Demo */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
        {/* Test Paywall */}
        <div className="card" style={{ padding: 24 }}>
          <h2 style={{ fontWeight: 700, fontSize: 16, color: "var(--text)", marginBottom: 12 }}>
            Test Paywall
          </h2>
          <p style={{ fontSize: 12, color: "var(--muted)", marginBottom: 16, lineHeight: 1.5 }}>
            Call the inference endpoint without payment to see the x402 paywall in action.
          </p>
          <button
            onClick={testInference}
            disabled={testLoading}
            style={{
              padding: "10px 20px", borderRadius: 8, border: "none", cursor: "pointer",
              background: "#A0722A", color: "#F5F0E8", fontFamily: "'IBM Plex Mono', monospace",
              fontSize: 13, fontWeight: 500, opacity: testLoading ? 0.6 : 1, width: "100%",
            }}
          >
            {testLoading ? "Calling..." : "Call /api/nanopay/inference"}
          </button>
          {testResult && (
            <div style={{
              marginTop: 12, padding: 12, background: "var(--surface-2)", borderRadius: 6,
              border: "1px solid var(--border)",
            }}>
              <p style={{ fontSize: 11, fontWeight: 600, color: "#A0722A", marginBottom: 4 }}>
                {testResult.model}
              </p>
              <p style={{ fontSize: 11, color: "var(--muted)", lineHeight: 1.5 }}>
                {testResult.result}
              </p>
              <p style={{ fontSize: 10, color: "var(--muted)", marginTop: 8 }}>
                Cost: {testResult.cost_usdc} USDC
              </p>
            </div>
          )}
        </div>

        {/* Gateway Balance */}
        <div className="card" style={{ padding: 24 }}>
          <h2 style={{ fontWeight: 700, fontSize: 16, color: "var(--text)", marginBottom: 12 }}>
            Seller Balance
          </h2>
          <p style={{ fontSize: 12, color: "var(--muted)", marginBottom: 16, lineHeight: 1.5 }}>
            Check the seller wallet&apos;s Gateway balance and accumulated earnings.
          </p>
          <button
            onClick={fetchBalance}
            disabled={loading}
            style={{
              padding: "10px 20px", borderRadius: 8, cursor: "pointer",
              background: "var(--bg)", color: "#A0722A", border: "1px solid #A0722A",
              fontFamily: "'IBM Plex Mono', monospace", fontSize: 13, fontWeight: 500,
              opacity: loading ? 0.6 : 1, width: "100%",
            }}
          >
            {loading ? "Loading..." : "Check Balance"}
          </button>
          {balance && (
            <div style={{ marginTop: 12 }}>
              {[
                ["Wallet USDC", `${balance.wallet.balance} USDC`],
                ["Gateway Available", `${balance.gateway.available} USDC`],
                ["Gateway Total", `${balance.gateway.total} USDC`],
              ].map(([label, value]) => (
                <div key={label} style={{
                  display: "flex", justifyContent: "space-between", padding: "8px 0",
                  borderBottom: "1px solid var(--border)", fontSize: 12,
                }}>
                  <span style={{ color: "var(--muted)" }}>{label}</span>
                  <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontWeight: 500, color: "var(--text)" }}>
                    {value}
                  </span>
                </div>
              ))}
              <p style={{
                fontSize: 10, color: "var(--muted)", marginTop: 8,
                fontFamily: "'IBM Plex Mono', monospace",
              }}>
                {balance.seller}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Integration with 7-Layer Stack */}
      <div className="card" style={{ padding: 24, marginBottom: 20 }}>
        <h2 style={{ fontWeight: 700, fontSize: 16, color: "var(--text)", marginBottom: 12 }}>
          Stack Integration
        </h2>
        <p style={{ fontSize: 12, color: "var(--muted)", marginBottom: 16, lineHeight: 1.6 }}>
          Nanopayments extend the 7-layer Arc Agent Hub stack with high-frequency micropayments,
          enabling new agent service patterns:
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {[
            {
              layer: "Identity (L1)",
              integration: "Registered agents can offer and consume paywalled services, building reputation through usage",
            },
            {
              layer: "Jobs (L2)",
              integration: "Micro-jobs below the escrow threshold — pay-per-inference instead of full job contracts",
            },
            {
              layer: "Market (L3)",
              integration: "Agents advertise nanopay-enabled services in the RFP marketplace",
            },
            {
              layer: "Orchestrator (L4)",
              integration: "Sub-agents in an orchestra can charge lead agents per micro-task via nanopayments",
            },
          ].map((item) => (
            <div key={item.layer} style={{
              padding: "12px 14px", background: "var(--surface-2)", borderRadius: 8,
              border: "1px solid var(--border)",
            }}>
              <p style={{ fontSize: 12, fontWeight: 600, color: "#A0722A", marginBottom: 4 }}>
                {item.layer}
              </p>
              <p style={{ fontSize: 11, color: "var(--muted)", lineHeight: 1.4 }}>
                {item.integration}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Run the Agent */}
      <div className="card" style={{ padding: 24 }}>
        <h2 style={{ fontWeight: 700, fontSize: 16, color: "var(--text)", marginBottom: 12 }}>
          Run the Buyer Agent
        </h2>
        <p style={{ fontSize: 12, color: "var(--muted)", marginBottom: 16, lineHeight: 1.6 }}>
          The buyer agent script demonstrates autonomous AI agents paying for inference with sub-cent USDC.
          It generates an ephemeral wallet, deposits into Circle Gateway, and fires 1 request/second.
        </p>
        <pre style={{
          background: "#2C2416", color: "#C9A55A", padding: 16, borderRadius: 8,
          fontSize: 12, fontFamily: "'IBM Plex Mono', monospace", overflowX: "auto",
          lineHeight: 1.6,
        }}>
{`# 1. Configure environment
cp .env.example .env.local
# Set SELLER_ADDRESS, SELLER_PRIVATE_KEY, BUYER_PRIVATE_KEY

# 2. Fund buyer wallet with testnet USDC
# Visit https://faucet.circle.com (select Arc Testnet)

# 3. Start the hub (seller endpoints)
npm run dev

# 4. Run the buyer agent (in another terminal)
npm run agent -- --limit 0.1`}
        </pre>
        <div style={{ marginTop: 16, display: "flex", gap: 10 }}>
          <Link href="https://github.com/sethoshi18/arc-agent-hub" target="_blank" style={{
            padding: "8px 16px", borderRadius: 6, background: "var(--surface-2)",
            border: "1px solid var(--border)", fontSize: 12,
            fontFamily: "'IBM Plex Mono', monospace", color: "var(--muted)",
            textDecoration: "none",
          }}>
            GitHub repo
          </Link>
          <Link href="https://faucet.circle.com" target="_blank" style={{
            padding: "8px 16px", borderRadius: 6, background: "var(--surface-2)",
            border: "1px solid var(--border)", fontSize: 12,
            fontFamily: "'IBM Plex Mono', monospace", color: "var(--muted)",
            textDecoration: "none",
          }}>
            Get testnet USDC
          </Link>
        </div>
      </div>
    </div>
  );
}
