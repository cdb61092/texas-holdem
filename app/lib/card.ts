class Card {
  readonly suit: string;
  readonly rank: string;

  constructor(suit: string, rank: string) {
    this.suit = suit;
    this.rank = rank;
  }
}

export { Card };
