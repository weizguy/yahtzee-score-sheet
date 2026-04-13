"use client";

import { useGame } from "@/context/GameContext";
import Setup from "@/components/Setup";
import Session from "@/components/Session";

export default function Home() {
  const { state } = useGame();
  return state.started ? <Session /> : <Setup />;
}
