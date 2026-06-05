"use client";

import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RainbowKitProvider, darkTheme, type Theme } from "@rainbow-me/rainbowkit";
import { wagmiConfig } from "@/lib/wagmi";
import "@rainbow-me/rainbowkit/styles.css";

const queryClient = new QueryClient();

// Custom RainbowKit theme matching the Arc Agent Hub design system
const arcTheme: Theme = {
  ...darkTheme(),
  colors: {
    ...darkTheme().colors,
    accentColor: "#A0722A",
    accentColorForeground: "#F5F0E8",
    connectButtonBackground: "#FDFBF7",
    connectButtonInnerBackground: "#F5F0E8",
    connectButtonText: "#1A1A1A",
    modalBackground: "#FDFBF7",
    modalText: "#1A1A1A",
    modalTextSecondary: "#6B6560",
    modalBorder: "#D4C5A9",
    profileForeground: "#FDFBF7",
    generalBorder: "#D4C5A9",
    generalBorderDim: "rgba(212, 197, 169, 0.5)",
  },
  fonts: {
    body: "'IBM Plex Mono', monospace",
  },
  radii: {
    ...darkTheme().radii,
    connectButton: "8px",
    modal: "12px",
    actionButton: "8px",
    menuButton: "8px",
  },
};

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider theme={arcTheme} modalSize="compact">
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
