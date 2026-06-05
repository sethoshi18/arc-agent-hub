"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";

/**
 * Wallet Connect Button
 *
 * Previously: Circle Passkey connector (broken on Arc Testnet — SCA factory not deployed).
 * Now: RainbowKit ConnectButton wrapper so all existing imports keep working.
 */
export function PasskeyButton() {
  return <ConnectButton accountStatus="address" chainStatus="icon" showBalance={false} />;
}
