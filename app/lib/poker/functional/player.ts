import type { Card } from "./deck";

type Player = {
  id: string;
  displayName: string;
  balance: number;
  // currentSeatId: string | null;
  holeCards: Card[];
  actionTaken: "fold" | "check" | "call" | "raise" | "none";
};

// Factory function to create a new player
function createPlayer(
  id: string,
  displayName: string,
  balance: number,
  // currentSeatId: string | null = null,
): Player {
  return {
    id,
    displayName,
    balance,
    // currentSeatId,
    holeCards: [],
    actionTaken: "none",
  };
}

// Example of a functional approach to updating the player's balance
function updatePlayerBalance(player: Player, amount: number): Player {
  return { ...player, balance: player.balance + amount };
}

// Example of a functional approach to setting the player's action
function setPlayerAction(
  player: Player,
  action: "fold" | "check" | "call" | "raise" | "none",
): Player {
  return { ...player, actionTaken: action };
}

export { createPlayer, updatePlayerBalance, setPlayerAction, type Player };
