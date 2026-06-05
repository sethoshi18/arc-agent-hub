export const CONTRACTS = {
  agentIdentity: (process.env.NEXT_PUBLIC_AGENT_IDENTITY_ADDRESS ?? "0x0bf50994245ab3297ed95665d62192977930fabb") as `0x${string}`,
  agentJob:      (process.env.NEXT_PUBLIC_AGENT_JOB_ADDRESS      ?? "0x2747fc4601933c7bdfeaddf52808a1c0bedc2323") as `0x${string}`,
  agentMarket:   (process.env.NEXT_PUBLIC_AGENT_MARKET_ADDRESS   ?? "0x79718fbd092276124d5bfed596e91f861d78a547") as `0x${string}`,
  agentOrchestrator: (process.env.NEXT_PUBLIC_AGENT_ORCHESTRATOR_ADDRESS ?? "0x925a80a447dddb7726a24fabc07fd22b76c4e7c1") as `0x${string}`,
  agentRetainer: (process.env.NEXT_PUBLIC_AGENT_RETAINER_ADDRESS ?? "0x9ca8bf8a090a2607d14e6cb0228e02ebd3d3329d") as `0x${string}`,
  agentStaking:  (process.env.NEXT_PUBLIC_AGENT_STAKING_ADDRESS  ?? "0xbbab7b7ed776e169eb6f0284d97f03cef3c5ecef") as `0x${string}`,
  agentDAO:      (process.env.NEXT_PUBLIC_AGENT_DAO_ADDRESS      ?? "0x256658aa7be4e4a066d002f9fecd8e60f8efcbb7") as `0x${string}`,
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

export const RETAINER_ABI = [
  { name: "createPlan", type: "function", stateMutability: "nonpayable", inputs: [{ name: "agentTokenId", type: "uint256" }, { name: "priceUsdc", type: "uint256" }, { name: "intervalSeconds", type: "uint256" }, { name: "description", type: "string" }], outputs: [{ name: "planId", type: "uint256" }] },
  { name: "updatePlan", type: "function", stateMutability: "nonpayable", inputs: [{ name: "planId", type: "uint256" }, { name: "newPriceUsdc", type: "uint256" }, { name: "newIntervalSeconds", type: "uint256" }], outputs: [] },
  { name: "deactivatePlan", type: "function", stateMutability: "nonpayable", inputs: [{ name: "planId", type: "uint256" }], outputs: [] },
  { name: "subscribe", type: "function", stateMutability: "nonpayable", inputs: [{ name: "planId", type: "uint256" }], outputs: [{ name: "subscriptionId", type: "uint256" }] },
  { name: "cancelSubscription", type: "function", stateMutability: "nonpayable", inputs: [{ name: "subscriptionId", type: "uint256" }], outputs: [] },
  { name: "charge", type: "function", stateMutability: "nonpayable", inputs: [{ name: "subscriptionId", type: "uint256" }], outputs: [] },
  { name: "getPlan", type: "function", stateMutability: "view", inputs: [{ name: "planId", type: "uint256" }], outputs: [{ name: "", type: "tuple", components: [{ name: "id", type: "uint256" }, { name: "agentTokenId", type: "uint256" }, { name: "priceUsdc", type: "uint256" }, { name: "intervalSeconds", type: "uint256" }, { name: "description", type: "string" }, { name: "status", type: "uint8" }, { name: "createdAt", type: "uint256" }, { name: "subscriberCount", type: "uint256" }] }] },
  { name: "getSubscription", type: "function", stateMutability: "view", inputs: [{ name: "subscriptionId", type: "uint256" }], outputs: [{ name: "", type: "tuple", components: [{ name: "id", type: "uint256" }, { name: "planId", type: "uint256" }, { name: "client", type: "address" }, { name: "status", type: "uint8" }, { name: "startedAt", type: "uint256" }, { name: "lastChargedAt", type: "uint256" }, { name: "totalCharged", type: "uint256" }, { name: "cycleCount", type: "uint256" }] }] },
  { name: "getPlansByAgent", type: "function", stateMutability: "view", inputs: [{ name: "agentTokenId", type: "uint256" }], outputs: [{ name: "", type: "uint256[]" }] },
  { name: "getSubscriptionsByClient", type: "function", stateMutability: "view", inputs: [{ name: "client", type: "address" }], outputs: [{ name: "", type: "uint256[]" }] },
  { name: "getSubscriptionsByPlan", type: "function", stateMutability: "view", inputs: [{ name: "planId", type: "uint256" }], outputs: [{ name: "", type: "uint256[]" }] },
] as const;

export const STAKING_ABI = [
  { name: "stake", type: "function", stateMutability: "nonpayable", inputs: [{ name: "agentTokenId", type: "uint256" }, { name: "amount", type: "uint256" }], outputs: [] },
  { name: "requestWithdrawal", type: "function", stateMutability: "nonpayable", inputs: [{ name: "agentTokenId", type: "uint256" }, { name: "amount", type: "uint256" }], outputs: [{ name: "requestId", type: "uint256" }] },
  { name: "completeWithdrawal", type: "function", stateMutability: "nonpayable", inputs: [{ name: "requestId", type: "uint256" }], outputs: [] },
  { name: "cancelWithdrawal", type: "function", stateMutability: "nonpayable", inputs: [{ name: "requestId", type: "uint256" }], outputs: [] },
  { name: "getStake", type: "function", stateMutability: "view", inputs: [{ name: "agentTokenId", type: "uint256" }], outputs: [{ name: "", type: "tuple", components: [{ name: "agentTokenId", type: "uint256" }, { name: "amount", type: "uint256" }, { name: "stakedAt", type: "uint256" }, { name: "slashCount", type: "uint256" }, { name: "active", type: "bool" }] }] },
  { name: "getWithdrawalRequest", type: "function", stateMutability: "view", inputs: [{ name: "requestId", type: "uint256" }], outputs: [{ name: "", type: "tuple", components: [{ name: "id", type: "uint256" }, { name: "agentTokenId", type: "uint256" }, { name: "amount", type: "uint256" }, { name: "requestedAt", type: "uint256" }, { name: "status", type: "uint8" }] }] },
  { name: "getWithdrawalsByAgent", type: "function", stateMutability: "view", inputs: [{ name: "agentTokenId", type: "uint256" }], outputs: [{ name: "", type: "uint256[]" }] },
] as const;

export const DAO_ABI = [
  { name: "createGovernanceProposal", type: "function", stateMutability: "nonpayable", inputs: [{ name: "agentTokenId", type: "uint256" }, { name: "description", type: "string" }], outputs: [{ name: "proposalId", type: "uint256" }] },
  { name: "createDisputeProposal", type: "function", stateMutability: "nonpayable", inputs: [{ name: "agentTokenId", type: "uint256" }, { name: "description", type: "string" }, { name: "jobContractType", type: "uint256" }, { name: "jobId", type: "uint256" }, { name: "disputedAgentId", type: "uint256" }, { name: "client", type: "address" }, { name: "escrowAmount", type: "uint256" }], outputs: [{ name: "proposalId", type: "uint256" }] },
  { name: "vote", type: "function", stateMutability: "nonpayable", inputs: [{ name: "proposalId", type: "uint256" }, { name: "agentTokenId", type: "uint256" }, { name: "choice", type: "uint8" }], outputs: [] },
  { name: "executeProposal", type: "function", stateMutability: "nonpayable", inputs: [{ name: "proposalId", type: "uint256" }], outputs: [] },
  { name: "cancelProposal", type: "function", stateMutability: "nonpayable", inputs: [{ name: "proposalId", type: "uint256" }], outputs: [] },
  { name: "getProposal", type: "function", stateMutability: "view", inputs: [{ name: "proposalId", type: "uint256" }], outputs: [{ name: "", type: "tuple", components: [{ name: "id", type: "uint256" }, { name: "proposerAgentId", type: "uint256" }, { name: "proposalType", type: "uint8" }, { name: "description", type: "string" }, { name: "status", type: "uint8" }, { name: "createdAt", type: "uint256" }, { name: "votingEndsAt", type: "uint256" }, { name: "forVotes", type: "uint256" }, { name: "againstVotes", type: "uint256" }, { name: "abstainVotes", type: "uint256" }, { name: "voterCount", type: "uint256" }, { name: "executed", type: "bool" }] }] },
  { name: "getDisputeInfo", type: "function", stateMutability: "view", inputs: [{ name: "proposalId", type: "uint256" }], outputs: [{ name: "", type: "tuple", components: [{ name: "jobContractType", type: "uint256" }, { name: "jobId", type: "uint256" }, { name: "disputedAgentId", type: "uint256" }, { name: "client", type: "address" }, { name: "escrowAmount", type: "uint256" }, { name: "outcome", type: "uint8" }] }] },
  { name: "hasAgentVoted", type: "function", stateMutability: "view", inputs: [{ name: "proposalId", type: "uint256" }, { name: "agentTokenId", type: "uint256" }], outputs: [{ name: "", type: "bool" }] },
  { name: "getProposalsByAgent", type: "function", stateMutability: "view", inputs: [{ name: "agentTokenId", type: "uint256" }], outputs: [{ name: "", type: "uint256[]" }] },
] as const;

export const RFP_STATUS: Record<number, string> = { 0: "Open", 1: "Matched", 2: "Cancelled" };
export const JOB_STATUS: Record<number, string> = { 0: "Open", 1: "Accepted", 2: "Submitted", 3: "Completed", 4: "Disputed", 5: "Cancelled" };
export const ORCHESTRA_STATUS: Record<number, string> = { 0: "Pending", 1: "Active", 2: "Disbanded" };
export const ORCH_JOB_STATUS: Record<number, string> = { 0: "Created", 1: "InProgress", 2: "Completed", 3: "Disputed", 4: "Cancelled" };
export const SUBTASK_STATUS: Record<number, string> = { 0: "Pending", 1: "Submitted", 2: "Approved", 3: "Disputed" };

export const PLAN_STATUS: Record<number, string> = { 0: "Active", 1: "Deactivated" };
export const SUBSCRIPTION_STATUS: Record<number, string> = { 0: "Active", 1: "Cancelled", 2: "Lapsed" };
export const WITHDRAWAL_STATUS: Record<number, string> = { 0: "None", 1: "Pending", 2: "Completed", 3: "Cancelled" };
export const PROPOSAL_TYPE: Record<number, string> = { 0: "Governance", 1: "Dispute" };
export const PROPOSAL_STATUS: Record<number, string> = { 0: "Active", 1: "Passed", 2: "Failed", 3: "Executed", 4: "Cancelled" };
export const VOTE_CHOICE: Record<number, string> = { 0: "Against", 1: "For", 2: "Abstain" };

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
