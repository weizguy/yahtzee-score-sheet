"use client";

import { ReactNode } from "react";
import { GameProvider } from "@/context/GameContext";

export function GameProviders({ children }: { children: ReactNode }) {
  return <GameProvider>{children}</GameProvider>;
}
