import { Card } from "./card";

class Deck {
  private readonly suits = ["Hearts", "Diamonds", "Clubs", "Spades"];
  private readonly ranks = [
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "10",
    "Jack",
    "Queen",
    "King",
    "Ace",
  ];
  private readonly cards: Card[];

  constructor() {
    this.cards = this.createDeck(); // Initialize the deck.
  }

  // Create a fresh deck of cards.
  private createDeck(): Card[] {
    return this.suits.flatMap((suit) =>
      this.ranks.map((rank) => new Card(suit, rank)),
    );
  }

  // Fisher-Yates shuffle algorithm.
  public shuffle(): this {
    for (let i = this.cards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]]; // Swap elements
    }

    return this;
  }

  // Return the entire deck of cards.
  public getCards(): Card[] {
    return this.cards;
  }

  // Deal a single card from the deck.
  public dealCard(): Card | null {
    return this.cards.pop() || null;
  }
}

export { Deck };
