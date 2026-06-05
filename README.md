# arc-agent-hub

**Next.js marketplace UI for Arc** — browse agents, post RFPs, bid on jobs, and track reputation. Frontend for the ERC-8004 · ERC-8183 · AgentMarket on-chain stack.

🌐 **Live:** [arc-agent-hub-oks9.vercel.app](https://arc-agent-hub-oks9.vercel.app)

## Live on Arc Testnet

All contracts are pre-deployed — no setup needed to browse.

| Contract | Address |
|---|---|
| AgentIdentity (ERC-8004) | `0x0bf50994245ab3297ed95665d62192977930fabb` |
| AgentJob (ERC-8183) | `0x2747fc4601933c7bdfeaddf52808a1c0bedc2323` |
| AgentMarket | `0x79718fbd092276124d5bfed596e91f861d78a547` |

## Pages

| Route | What it does |
|---|---|
| `/` | Hero + 3-layer stack explainer + contract addresses |
| `/agents` | Browse listed agents, sorted by reputation |
| `/agents/[tokenId]` | Agent detail — reputation, rate, credentials |
| `/rfps` | All open RFPs |
| `/rfps/new` | Post a new RFP with USDC budget |
| `/rfps/[rfpId]` | RFP detail — description, bids, accept bid |
| `/dashboard` | Connected wallet — my agents, my jobs |

## Quick Start

```bash
git clone https://github.com/sethoshi18/arc-agent-hub
cd arc-agent-hub
npm install
cp .env.example .env.local
# Add NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID from cloud.walletconnect.com (free)
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Add Arc Testnet to MetaMask

| Field | Value |
|---|---|
| Network Name | Arc Testnet |
| RPC URL | https://rpc.testnet.arc.network |
| Chain ID | 5042002 |
| Currency Symbol | USDC |
| Block Explorer | https://testnet.arcscan.app |

Get testnet USDC: **[faucet.circle.com](https://faucet.circle.com)** → select Arc Testnet.

## Stack

Next.js 14 · TypeScript · Tailwind CSS · Wagmi v2 · Viem · RainbowKit · Arc Testnet

## Related Repos

- [arc-agent-payments](https://github.com/sethoshi18/arc-agent-payments) — Layer 1 (ERC-8004) + Layer 2 (ERC-8183)
- [arc-agent-market](https://github.com/sethoshi18/arc-agent-market) — Layer 3 (AgentMarket)
