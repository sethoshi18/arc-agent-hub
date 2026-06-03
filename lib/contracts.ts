export const CONTRACTS = {
  agentIdentity: (process.env.NEXT_PUBLIC_AGENT_IDENTITY_ADDRESS ?? "0x5Bef356f89425823FC7eebB3A6ED1A678F3b8233") as `0x${string}`,
  agentJob:      (process.env.NEXT_PUBLIC_AGENT_JOB_ADDRESS      ?? "0xD698d15F776279c0213444a779941e8E0Cbe5094") as `0x${string}`,
  agentMarket:   (process.env.NEXT_PUBLIC_AGENT_MARKET_ADDRESS   ?? "0x6BAf93EB026b7BC3db651065302D1934Ad577ec1") as `0x${string}`,
  agentOrchestrator: (process.env.NEXT_PUBLIC_AGENT_ORCHESTRATOR_ADDRESS ?? "0xbA99f039b7892d9F546253444c95EDea822471b0") as `0x${string}`,
  usdc:          (process.env.NEXT_PUBLIC_USDC_ADDRESS           ?? "0x3600000000000000000000000000000000000000") as `0x${string}`,
} as const;

export const IDENTITY_ABI = [
  { name: "registerAgent", type: "function", stateMutability: "nonpayable", inputs: [{ name: "name", type: "string" }, { name: "metadataURI", type: "string" }], outputs: [{ name: "tokenId", type: "uint256" }] },
  { name: "getAgent", type: "function", stateMutability: "view", inputs: [{ name: "tokenId", type: "uint256" }], outputs: [{ name: "", type: "tuple", components: [{ name: "owner", type: "address" }, { name: "name", type: "string" }, { name: "metadataURI", type: "string" }, { name: "reputation", type: "uint256" }, { name: "registeredAt", type: "uint256" }, { name: "active", type: "bool" }] }] },
  { name: "getAgentsByOwner", type: "function", stateMutability: "view", inputs: [{ name: "owner", type: "address" }], outputs: [{ name: "", type: "uint256[]" }] },
] as const;

export const JOB_ABI = [
  { name: "createJob", type: "function", stateMutability: "nonpayable", inputs: [{ name: "description", type: "string" }, { name: "paymentAmount", type: "uint256" }, { name: "deadline", type: "uint256" }], outputs: [{ name: "jobId", type: "uint256" }] },
  { name: "getJob", type: "function", stateMutability: "view", inputs: [{ name: "jobId", type: "uint256" }], outputs: [{ name: "", type: "tuple", components: [{ name: "id", type: "uint256" }, { name: "client", type: "address" }, { name: "agentTokenId", type: "uint256" }, { name: "description", type: "string" }, { name: "deliverableHash", type: "bytes32" }, { name: "paymentAmount", type: "uint256" }, { name: "deadline", type: "uint256" }, { name: "status", type: "uint8" }, { name: "createdAt", type: "uint256" }, { name: "completedAt", type: "uint256" }] }] },
  { name: "getJobsByClient", type: "function", stateMutability: "view", inputs: [{ name: "client", type: "address" }], outputs: [{ name: "", type: "uint256[]" }] },
] as const;

export const MARKET_ABI = [
  { name: "listAgent", type: "function", stateMutability: "nonpayable", inputs: [{ name: "agentTokenId", type: "uint256" }, { name: "hourlyRateUsdc", type: "uint256" }, { name: "capabilities", type: "bytes32[]" }, { name: "availableUntil", type: "uint256" }], outputs: [] },
  { name: "getListedAgents", type: "function", stateMutability: "view", inputs: [], outputs: [{ name: "", type: "uint256[]" }] },
  { name: "getListing", type: "function", stateMutability: "view", inputs: [{ name: "agentTokenId", type: "uint256" }], outputs: [{ name: "", type: "tuple", components: [{ name: "agentTokenId", type: "uint256" }, { name: "owner", type: "address" }, { name: "hourlyRateUsdc", type: "uint256" }, { name: "capabilities", type: "bytes32[]" }, { name: "availableUntil", type: "uint256" }, { name: "active", type: "bool" }] }] },
  { name: "postRFP", type: "function", stateMutability: "nonpayable", inputs: [{ name: "description", type: "string" }, { name: "budgetUsdc", type: "uint256" }, { name: "requiredCaps", type: "bytes32[]" }, { name: "deadline", type: "uint256" }, { name: "biddingWindowSeconds", type: "uint256" }], outputs: [{ name: "rfpId", type: "uint256" }] },
  { name: "getOpenRFPs", type: "function", stateMutability: "view", inputs: [], outputs: [{ name: "", type: "uint256[]" }] },
  { name: "getRFP", type: "function", stateMutability: "view", inputs: [{ name: "rfpId", type: "uint256" }], outputs: [{ name: "", type: "tuple", components: [{ name: "id", type: "uint256" }, { name: "client", type: "address" }, { name: "description", type: "string" }, { name: "budgetUsdc", type: "uint256" }, { name: "requiredCaps", type: "bytes32[]" }, { name: "deadline", type: "uint256" }, { name: "expiresAt", type: "uint256" }, { name: "status", type: "uint8" }, { name: "winningBidId", type: "uint256" }, { name: "createdAt", type: "uint256" }] }] },
  { name: "submitBid", type: "function", stateMutability: "nonpayable", inputs: [{ name: "rfpId", type: "uint256" }, { name: "agentTokenId", type: "uint256" }, { name: "priceUsdc", type: "uint256" }, { name: "proposal", type: "string" }], outputs: [{ name: "bidId", type: "uint256" }] },
  { name: "getBidsByRFP", type: "function", stateMutability: "view", inputs: [{ name: "rfpId", type: "uint256" }], outputs: [{ name: "", type: "uint256[]" }] },
  { name: "getBid", type: "function", stateMutability: "view", inputs: [{ name: "bidId", type: "uint256" }], outputs: [{ name: "", type: "tuple", components: [{ name: "id", type: "uint256" }, { name: "rfpId", type: "uint256" }, { name: "agentTokenId", type: "uint256" }, { name: "agentOwner", type: "address" }, { name: "priceUsdc", type: "uint256" }, { name: "proposal", type: "string" }, { name: "agentReputation", type: "uint256" }, { name: "active", type: "bool" }, { name: "createdAt", type: "uint256" }] }] },
  { name: "acceptBid", type: "function", stateMutability: "nonpayable", inputs: [{ name: "rfpId", type: "uint256" }, { name: "bidId", type: "uint256" }], outputs: [{ name: "jobId", type: "uint256" }] },
] as const;

export const ORCHESTRATOR_ABI = [
  { name: "createOrchestra", type: "function", stateMutability: "nonpayable", inputs: [{ name: "leadAgentId", type: "uint256" }, { name: "subAgentIds", type: "uint256[]" }, { name: "splitBps", type: "uint256[]" }, { name: "description", type: "string" }], outputs: [{ name: "orchestraId", type: "uint256" }] },
  { name: "acceptOrchestraRole", type: "function", stateMutability: "nonpayable", inputs: [{ name: "orchestraId", type: "uint256" }, { name: "agentTokenId", type: "uint256" }], outputs: [] },
  { name: "disbandOrchestra", type: "function", stateMutability: "nonpayable", inputs: [{ name: "orchestraId", type: "uint256" }], outputs: [] },
  { name: "createOrchestratedJob", type: "function", stateMutability: "nonpayable", inputs: [{ name: "orchestraId", type: "uint256" }, { name: "totalAmount", type: "uint256" }, { name: "description", type: "string" }], outputs: [{ name: "jobId", type: "uint256" }] },
  { name: "submitSubDeliverable", type: "function", stateMutability: "nonpayable", inputs: [{ name: "jobId", type: "uint256" }, { name: "agentTokenId", type: "uint256" }, { name: "deliverableHash", type: "bytes32" }], outputs: [] },
  { name: "approveSubDeliverable", type: "function", stateMutability: "nonpayable", inputs: [{ name: "jobId", type: "uint256" }, { name: "agentTokenId", type: "uint256" }], outputs: [] },
  { name: "disputeSubDeliverable", type: "function", stateMutability: "nonpayable", inputs: [{ name: "jobId", type: "uint256" }, { name: "agentTokenId", type: "uint256" }, { name: "reason", type: "string" }], outputs: [] },
  { name: "completeOrchestratedJob", type: "function", stateMutability: "nonpayable", inputs: [{ name: "jobId", type: "uint256" }], outputs: [] },
  { name: "cancelOrchestratedJob", type: "function", stateMutability: "nonpayable", inputs: [{ name: "jobId", type: "uint256" }], outputs: [] },
  { name: "getOrchestra", type: "function", stateMutability: "view", inputs: [{ name: "orchestraId", type: "uint256" }], outputs: [{ name: "", type: "tuple", components: [{ name: "id", type: "uint256" }, { name: "leadAgentId", type: "uint256" }, { name: "description", type: "string" }, { name: "status", type: "uint8" }, { name: "createdAt", type: "uint256" }, { name: "memberCount", type: "uint256" }, { name: "acceptedCount", type: "uint256" }] }] },
  { name: "getOrchestraMembers", type: "function", stateMutability: "view", inputs: [{ name: "orchestraId", type: "uint256" }], outputs: [{ name: "", type: "tuple[]", components: [{ name: "agentTokenId", type: "uint256" }, { name: "splitBps", type: "uint256" }, { name: "accepted", type: "bool" }] }] },
  { name: "getOrchestratedJob", type: "function", stateMutability: "view", inputs: [{ name: "jobId", type: "uint256" }], outputs: [{ name: "", type: "tuple", components: [{ name: "id", type: "uint256" }, { name: "orchestraId", type: "uint256" }, { name: "client", type: "address" }, { name: "totalAmount", type: "uint256" }, { name: "description", type: "string" }, { name: "status", type: "uint8" }, { name: "createdAt", type: "uint256" }, { name: "completedAt", type: "uint256" }, { name: "approvedCount", type: "uint256" }, { name: "totalMembers", type: "uint256" }] }] },
  { name: "getSubTask", type: "function", stateMutability: "view", inputs: [{ name: "jobId", type: "uint256" }, { name: "agentTokenId", type: "uint256" }], outputs: [{ name: "", type: "tuple", components: [{ name: "deliverableHash", type: "bytes32" }, { name: "status", type: "uint8" }, { name: "submittedAt", type: "uint256" }] }] },
  { name: "getOrchestrasByAgent", type: "function", stateMutability: "view", inputs: [{ name: "agentTokenId", type: "uint256" }], outputs: [{ name: "", type: "uint256[]" }] },
  { name: "getJobsByClient", type: "function", stateMutability: "view", inputs: [{ name: "client", type: "address" }], outputs: [{ name: "", type: "uint256[]" }] },
  { name: "getJobsByOrchestra", type: "function", stateMutability: "view", inputs: [{ name: "orchestraId", type: "uint256" }], outputs: [{ name: "", type: "uint256[]" }] },
] as const;

export const ERC20_ABI = [
  { name: "approve", type: "function", stateMutability: "nonpayable", inputs: [{ name: "spender", type: "address" }, { name: "amount", type: "uint256" }], outputs: [{ name: "", type: "bool" }] },
  { name: "balanceOf", type: "function", stateMutability: "view", inputs: [{ name: "account", type: "address" }], outputs: [{ name: "", type: "uint256" }] },
] as const;

export const RFP_STATUS: Record<number, string> = { 0: "Open", 1: "Matched", 2: "Cancelled" };
export const JOB_STATUS: Record<number, string> = { 0: "Open", 1: "Accepted", 2: "Submitted", 3: "Completed", 4: "Disputed", 5: "Cancelled" };
export const ORCHESTRA_STATUS: Record<number, string> = { 0: "Pending", 1: "Active", 2: "Disbanded" };
export const ORCH_JOB_STATUS: Record<number, string> = { 0: "Created", 1: "InProgress", 2: "Completed", 3: "Disputed", 4: "Cancelled" };
export const SUBTASK_STATUS: Record<number, string> = { 0: "Pending", 1: "Submitted", 2: "Approved", 3: "Disputed" };

export function formatUsdc(raw: bigint) {
  return (Number(raw) / 1_000_000).toFixed(2);
}

export function repPct(bps: bigint) {
  return (Number(bps) / 100).toFixed(0);
}

export function repColor(bps: bigint) {
  const pct = Number(bps) / 100;
  if (pct >= 70) return "text-green-400";
  if (pct >= 50) return "text-yellow-400";
  return "text-red-400";
}

export function shortAddr(addr: string) {
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

export function arcScan(addr: string, type: "address" | "tx" = "address") {
  return `https://testnet.arcscan.app/${type}/${addr}`;
}

export function bpsToPercent(bps: bigint | number) {
  return (Number(bps) / 100).toFixed(1);
}
