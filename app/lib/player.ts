import { Card } from "./card";

class Player {
  public id: string;
  public displayName: string;
  public balance: number;
  public currentSeatId: string | null;
  public holeCards: Card[] = [];
  public actionTaken: "fold" | "check" | "call" | "raise" | "none" = "none";

  constructor(
    id: string,
    displayName: string,
    balance: number,
    currentSeatId: string | null = null,
  ) {
    this.id = id;
    this.displayName = displayName;
    this.balance = balance;
    this.currentSeatId = currentSeatId;
  }
}

export { Player };
