/**
 * AgentFactory (Layer 8) — Contract config + ABI for the Arc Agent Hub frontend.
 * Factory V2: 0x1e2e8abfa05b0df0c83af5de3580a79f6c7f6398
 * Identity V2: 0x0bf50994245ab3297ed95665d62192977930fabb
 */

export const FACTORY_ADDRESS = (process.env.NEXT_PUBLIC_AGENT_FACTORY_ADDRESS ??
  "0x1e2e8abfa05b0df0c83af5de3580a79f6c7f6398") as `0x${string}`;

export const IDENTITY_V2_ADDRESS = (process.env.NEXT_PUBLIC_AGENT_IDENTITY_V2_ADDRESS ??
  "0x0bf50994245ab3297ed95665d62192977930fabb") as `0x${string}`;

export const USDC_ADDRESS = (process.env.NEXT_PUBLIC_USDC_ADDRESS ??
  "0x3600000000000000000000000000000000000000") as `0x${string}`;

// ─── Factory ABI ──────────────────────────────────────────────────────────

export const FACTORY_ABI = [
  {
    type: "function", name: "deployAgent", stateMutability: "nonpayable",
    inputs: [{
      name: "config", type: "tuple",
      components: [
        { name: "name", type: "string" },
        { name: "metadataURI", type: "string" },
        { name: "listOnMarket", type: "bool" },
        { name: "hourlyRateUsdc", type: "uint256" },
        { name: "capabilities", type: "bytes32[]" },
        { name: "availableUntil", type: "uint256" },
        { name: "createRetainerPlan", type: "bool" },
        { name: "retainerPriceUsdc", type: "uint256" },
        { name: "retainerInterval", type: "uint256" },
        { name: "retainerDescription", type: "string" },
        { name: "stakeCollateral", type: "bool" },
        { name: "stakeAmountUsdc", type: "uint256" },
      ],
    }],
    outputs: [{ name: "agentTokenId", type: "uint256" }],
  },
  {
    type: "function", name: "deployFromTemplate", stateMutability: "nonpayable",
    inputs: [
      { name: "templateId", type: "uint256" },
      { name: "name", type: "string" },
      { name: "metadataURI", type: "string" },
      { name: "enableMarket", type: "bool" },
      { name: "enableRetainer", type: "bool" },
      { name: "enableStaking", type: "bool" },
    ],
    outputs: [{ name: "agentTokenId", type: "uint256" }],
  },
  {
    type: "function", name: "createTemplate", stateMutability: "nonpayable",
    inputs: [{
      name: "config", type: "tuple",
      components: [
        { name: "name", type: "string" },
        { name: "description", type: "string" },
        { name: "defaultMetadataURI", type: "string" },
        { name: "suggestedHourlyRate", type: "uint256" },
        { name: "defaultCapabilities", type: "bytes32[]" },
        { name: "suggestedRetainerPrice", type: "uint256" },
        { name: "suggestedRetainerInterval", type: "uint256" },
        { name: "suggestedStakeAmount", type: "uint256" },
      ],
    }],
    outputs: [{ name: "templateId", type: "uint256" }],
  },
  {
    type: "function", name: "getTemplate", stateMutability: "view",
    inputs: [{ name: "templateId", type: "uint256" }],
    outputs: [{
      name: "", type: "tuple",
      components: [
        { name: "id", type: "uint256" },
        { name: "name", type: "string" },
        { name: "description", type: "string" },
        { name: "defaultMetadataURI", type: "string" },
        { name: "suggestedHourlyRate", type: "uint256" },
        { name: "defaultCapabilities", type: "bytes32[]" },
        { name: "suggestedRetainerPrice", type: "uint256" },
        { name: "suggestedRetainerInterval", type: "uint256" },
        { name: "suggestedStakeAmount", type: "uint256" },
        { name: "active", type: "bool" },
        { name: "creator", type: "address" },
        { name: "createdAt", type: "uint256" },
        { name: "useCount", type: "uint256" },
      ],
    }],
  },
  {
    type: "function", name: "getActiveTemplates", stateMutability: "view",
    inputs: [], outputs: [{ name: "templateIds", type: "uint256[]" }],
  },
  {
    type: "function", name: "getDeployedAgent", stateMutability: "view",
    inputs: [{ name: "agentTokenId", type: "uint256" }],
    outputs: [{
      name: "", type: "tuple",
      components: [
        { name: "agentTokenId", type: "uint256" },
        { name: "owner", type: "address" },
        { name: "templateId", type: "uint256" },
        { name: "listedOnMarket", type: "bool" },
        { name: "retainerPlanId", type: "uint256" },
        { name: "hasStake", type: "bool" },
        { name: "deployedAt", type: "uint256" },
      ],
    }],
  },
  {
    type: "function", name: "getAgentsByOwner", stateMutability: "view",
    inputs: [{ name: "ownerAddr", type: "address" }],
    outputs: [{ name: "agentTokenIds", type: "uint256[]" }],
  },
  {
    type: "function", name: "getAgentProfile", stateMutability: "view",
    inputs: [{ name: "agentTokenId", type: "uint256" }],
    outputs: [
      { name: "name", type: "string" },
      { name: "reputation", type: "uint256" },
      { name: "isListed", type: "bool" },
      { name: "hourlyRate", type: "uint256" },
      { name: "stakeAmount", type: "uint256" },
      { name: "retainerPlanId", type: "uint256" },
    ],
  },
  {
    type: "function", name: "getFactoryStats", stateMutability: "view",
    inputs: [],
    outputs: [
      { name: "_totalAgentsDeployed", type: "uint256" },
      { name: "_totalTemplates", type: "uint256" },
      { name: "_totalActiveTemplates", type: "uint256" },
    ],
  },
  {
    type: "event", name: "AgentDeployed",
    inputs: [
      { name: "agentTokenId", type: "uint256", indexed: true },
      { name: "owner", type: "address", indexed: true },
      { name: "templateId", type: "uint256", indexed: true },
      { name: "name", type: "string", indexed: false },
    ],
  },
  {
    type: "event", name: "TemplateCreated",
    inputs: [
      { name: "templateId", type: "uint256", indexed: true },
      { name: "creator", type: "address", indexed: true },
      { name: "name", type: "string", indexed: false },
    ],
  },
] as const;

// ─── Helpers ──────────────────────────────────────────────────────────────

export function formatUsdc(raw: bigint): string {
  const n = Number(raw) / 1e6;
  return n % 1 === 0 ? `$${n}` : `$${n.toFixed(2)}`;
}

export function repPercent(bps: bigint): string {
  return `${(Number(bps) / 100).toFixed(1)}%`;
}

export function shortAddr(addr: string): string {
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

export function intervalLabel(secs: bigint): string {
  const s = Number(secs);
  if (s < 60) return `${s}s`;
  if (s < 3600) return `${Math.round(s / 60)}m`;
  if (s < 86400) return `${Math.round(s / 3600)}h`;
  return `${Math.round(s / 86400)}d`;
}
