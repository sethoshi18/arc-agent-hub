"use client";
import { useReadContract, useReadContracts, useWriteContract, useAccount } from "wagmi";
import { ReputationBadge } from "@/components/ReputationBadge";
import { CONTRACTS, MARKET_ABI, IDENTITY_ABI, ERC20_ABI, RFP_STATUS, formatUsdc, shortAddr, arcScan } from "@/lib/contracts";
import { useState } from "react";
import { parseUnits } from "viem";

function BidRow({ bidId, rfpId, isClient }: { bidId: bigint; rfpId: bigint; isClient: boolean }) {
  const { data: bid } = useReadContract({ address: CONTRACTS.agentMarket, abi: MARKET_ABI, functionName: "getBid", args: [bidId] });
  const { data: agent } = useReadContract({ address: CONTRACTS.agentIdentity, abi: IDENTITY_ABI, functionName: "getAgent", args: [bid?.agentTokenId ?? 0n], query: { enabled: !!bid } });
  const { writeContract, isPending } = useWriteContract();

  if (!bid || !agent) return null;

  return (
    <div className="bg-arc-bg border border-arc-border rounded-lg p-4">
      <div className="flex items-start justify-between mb-2">
        <div>
          <span className="font-semibold">{agent.name}</span>
          <span className="text-arc-muted text-xs ml-2 font-mono">#{bid.agentTokenId.toString()}</span>
        </div>
        <div className="flex items-center gap-3">
          <ReputationBadge bps={bid.agentReputation} size="sm" />
          <span className="text-arc-accent font-semibold text-sm">{formatUsdc(bid.priceUsdc)} USDC</span>
        </div>
      </div>
      <p className="text-arc-muted text-sm mb-3 leading-relaxed">{bid.proposal}</p>
      {isClient && (
        <button
          onClick={() => writeContract({ address: CONTRACTS.agentMarket, abi: MARKET_ABI, functionName: "acceptBid", args: [rfpId, bidId] })}
          disabled={isPending}
          className="text-xs bg-arc-accent text-arc-bg font-semibold px-3 py-1.5 rounded-lg hover:bg-arc-accent/90 transition-colors disabled:opacity-50"
        >
          {isPending ? "Accepting..." : "Accept Bid"}
        </button>
      )}
    </div>
  );
}

export default function RFPDetailPage({ params }: { params: { rfpId: string } }) {
  const rfpId = BigInt(params.rfpId);
  const { address } = useAccount();
  const [proposal, setProposal] = useState("");
  const [price, setPrice] = useState("");
  const [agentId, setAgentId] = useState("");

  const { data: rfp } = useReadContract({ address: CONTRACTS.agentMarket, abi: MARKET_ABI, functionName: "getRFP", args: [rfpId] });
  const { data: bidIds } = useReadContract({ address: CONTRACTS.agentMarket, abi: MARKET_ABI, functionName: "getBidsByRFP", args: [rfpId] });
  const { data: myAgents } = useReadContract({ address: CONTRACTS.agentIdentity, abi: IDENTITY_ABI, functionName: "getAgentsByOwner", args: [address ?? "0x0000000000000000000000000000000000000000"], query: { enabled: !!address } });
  const { writeContract, isPending } = useWriteContract();

  if (!rfp) return <div className="text-arc-muted py-16 text-center">Loading RFP #{params.rfpId}...</div>;

  const isClient = address?.toLowerCase() === rfp.client.toLowerCase();
  const statusLabel = RFP_STATUS[rfp.status] ?? "Unknown";
  const now = BigInt(Math.floor(Date.now() / 1000));
  const biddingOpen = rfp.status === 0 && rfp.expiresAt > now;

  const handleSubmitBid = () => {
    if (!price || !agentId || !proposal) return;
    writeContract({
      address: CONTRACTS.agentMarket,
      abi: MARKET_ABI,
      functionName: "submitBid",
      args: [rfpId, BigInt(agentId), parseUnits(price, 6), proposal],
    });
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* RFP Header */}
      <div className="bg-arc-card border border-arc-border rounded-xl p-6 mb-6">
        <div className="flex items-start justify-between mb-4">
          <span className={`text-xs px-2 py-0.5 rounded-full font-mono ${rfp.status === 0 ? "bg-green-900/40 text-green-400" : "bg-gray-900/40 text-gray-400"}`}>
            {statusLabel}
          </span>
          <span className="text-arc-muted text-xs font-mono">RFP #{rfpId.toString()}</span>
        </div>
        <p className="text-lg mb-5 leading-relaxed">{rfp.description}</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div>
            <p className="text-arc-muted text-xs mb-1">Budget</p>
            <p className="text-arc-accent font-semibold">{formatUsdc(rfp.budgetUsdc)} USDC</p>
          </div>
          <div>
            <p className="text-arc-muted text-xs mb-1">Posted by</p>
            <a href={arcScan(rfp.client)} target="_blank" className="font-mono text-xs hover:text-white transition-colors">{shortAddr(rfp.client)}</a>
          </div>
          <div>
            <p className="text-arc-muted text-xs mb-1">Deadline</p>
            <p className="text-sm">{new Date(Number(rfp.deadline) * 1000).toLocaleDateString()}</p>
          </div>
        </div>
      </div>

      {/* Bids */}
      <div className="mb-6">
        <h2 className="font-display font-bold text-xl mb-4">
          Bids <span className="text-arc-muted font-body font-normal text-sm">({bidIds?.length ?? 0})</span>
        </h2>
        {bidIds?.length === 0 && <p className="text-arc-muted text-sm">No bids yet — be the first.</p>}
        <div className="space-y-3">
          {bidIds?.map((id) => <BidRow key={id.toString()} bidId={id} rfpId={rfpId} isClient={isClient} />)}
        </div>
      </div>

      {/* Submit Bid Form */}
      {biddingOpen && !isClient && address && (
        <div className="bg-arc-card border border-arc-border rounded-xl p-6">
          <h2 className="font-display font-bold text-xl mb-4">Submit a Bid</h2>
          <div className="space-y-4">
            {myAgents && myAgents.length > 0 && (
              <div>
                <label className="text-arc-muted text-xs block mb-1.5">Your agent token ID</label>
                <select
                  value={agentId}
                  onChange={(e) => setAgentId(e.target.value)}
                  className="w-full bg-arc-bg border border-arc-border rounded-lg px-3 py-2 text-sm text-white focus:border-arc-accent outline-none"
                >
                  <option value="">Select agent...</option>
                  {myAgents.map((id) => <option key={id.toString()} value={id.toString()}>Agent #{id.toString()}</option>)}
                </select>
              </div>
            )}
            <div>
              <label className="text-arc-muted text-xs block mb-1.5">Price (USDC, max {formatUsdc(rfp.budgetUsdc)})</label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="e.g. 40.00"
                className="w-full bg-arc-bg border border-arc-border rounded-lg px-3 py-2 text-sm text-white focus:border-arc-accent outline-none"
              />
            </div>
            <div>
              <label className="text-arc-muted text-xs block mb-1.5">Proposal</label>
              <textarea
                value={proposal}
                onChange={(e) => setProposal(e.target.value)}
                placeholder="Describe your approach..."
                rows={3}
                className="w-full bg-arc-bg border border-arc-border rounded-lg px-3 py-2 text-sm text-white focus:border-arc-accent outline-none resize-none"
              />
            </div>
            <button
              onClick={handleSubmitBid}
              disabled={isPending || !agentId || !price || !proposal}
              className="w-full bg-arc-accent text-arc-bg font-semibold py-2.5 rounded-lg hover:bg-arc-accent/90 transition-colors disabled:opacity-50 text-sm"
            >
              {isPending ? "Submitting..." : "Submit Bid"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
