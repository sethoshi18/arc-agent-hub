"use client";

import { useState, useRef, useEffect } from "react";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { circleConnector } from "@/lib/wagmi";

/**
 * Circle Passkey Connect Button
 *
 * Replaces RainbowKit's ConnectButton with Circle Modular Wallets passkey auth.
 * Supports register (new wallet) and login (existing wallet) flows.
 */
export function PasskeyButton() {
  const { address, isConnected, isConnecting } = useAccount();
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();
  const [showMenu, setShowMenu] = useState(false);
  const [showConnectMenu, setShowConnectMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menus on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
        setShowConnectMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleConnect = (mode: "register" | "login") => {
    setShowConnectMenu(false);
    circleConnector.setConnectMode(mode);
    connect({ connector: circleConnector });
  };

  if (isConnecting) {
    return (
      <button disabled style={btnStyle({ disabled: true })}>
        <span style={dotStyle} /> Connecting...
      </button>
    );
  }

  if (isConnected && address) {
    const truncated = `${address.slice(0, 6)}...${address.slice(-4)}`;

    return (
      <div ref={menuRef} style={{ position: "relative" }}>
        <button
          onClick={() => setShowMenu(!showMenu)}
          style={btnStyle({ connected: true })}
        >
          <span style={avatarStyle}>
            {address.slice(2, 4).toUpperCase()}
          </span>
          <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12 }}>
            {truncated}
          </span>
        </button>

        {showMenu && (
          <div style={menuStyle}>
            <a
              href={`https://testnet.arcscan.app/address/${address}`}
              target="_blank"
              rel="noopener noreferrer"
              style={menuItemStyle}
            >
              View on ArcScan
            </a>
            <button
              onClick={() => { disconnect(); setShowMenu(false); }}
              style={{ ...menuItemStyle, color: "#B85C3A", border: "none", width: "100%", textAlign: "left", cursor: "pointer", background: "none" }}
            >
              Disconnect
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div ref={menuRef} style={{ position: "relative" }}>
      <button
        onClick={() => setShowConnectMenu(!showConnectMenu)}
        style={btnStyle({})}
      >
        Connect Wallet
      </button>

      {showConnectMenu && (
        <div style={menuStyle}>
          <button
            onClick={() => handleConnect("register")}
            style={{ ...menuItemStyle, border: "none", width: "100%", textAlign: "left", cursor: "pointer", background: "none" }}
          >
            <span style={{ fontWeight: 600 }}>Create Wallet</span>
            <span style={{ fontSize: 10, color: "#6B6560", display: "block", marginTop: 2 }}>
              New passkey wallet on Arc
            </span>
          </button>
          <div style={{ height: 1, background: "#D4C5A9", margin: "4px 0" }} />
          <button
            onClick={() => handleConnect("login")}
            style={{ ...menuItemStyle, border: "none", width: "100%", textAlign: "left", cursor: "pointer", background: "none" }}
          >
            <span style={{ fontWeight: 600 }}>Sign In</span>
            <span style={{ fontSize: 10, color: "#6B6560", display: "block", marginTop: 2 }}>
              Existing passkey wallet
            </span>
          </button>
        </div>
      )}
    </div>
  );
}

// --- Styles (matching Arc Agent Hub design system) ---

function btnStyle(opts: { connected?: boolean; disabled?: boolean }) {
  return {
    display: "flex" as const,
    alignItems: "center" as const,
    gap: 8,
    padding: "7px 14px",
    borderRadius: 8,
    border: "1px solid #D4C5A9",
    background: opts.connected ? "#FDFBF7" : "#A0722A",
    color: opts.connected ? "#3D3530" : "#F5F0E8",
    fontFamily: "'IBM Plex Mono', monospace",
    fontSize: 12,
    fontWeight: 500 as const,
    cursor: opts.disabled ? "wait" : "pointer" as const,
    opacity: opts.disabled ? 0.6 : 1,
    transition: "all .15s",
  };
}

const dotStyle = {
  width: 8,
  height: 8,
  borderRadius: "50%",
  background: "#A0722A",
  animation: "pulse 1.5s infinite",
};

const avatarStyle = {
  width: 24,
  height: 24,
  borderRadius: "50%",
  background: "rgba(160,114,42,0.12)",
  border: "1px solid rgba(160,114,42,0.25)",
  display: "flex" as const,
  alignItems: "center" as const,
  justifyContent: "center" as const,
  fontSize: 9,
  fontWeight: 700 as const,
  color: "#A0722A",
  fontFamily: "'IBM Plex Mono', monospace",
};

const menuStyle = {
  position: "absolute" as const,
  top: "calc(100% + 6px)",
  right: 0,
  background: "#FDFBF7",
  border: "1px solid #D4C5A9",
  borderRadius: 10,
  padding: "6px",
  minWidth: 200,
  boxShadow: "0 4px 16px rgba(44,36,22,0.12)",
  zIndex: 200,
};

const menuItemStyle = {
  display: "block" as const,
  padding: "10px 12px",
  borderRadius: 6,
  fontSize: 12,
  fontFamily: "'IBM Plex Mono', monospace",
  color: "#3D3530",
  textDecoration: "none" as const,
};
