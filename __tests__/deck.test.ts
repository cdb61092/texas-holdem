import { Deck } from "../app/lib/deck";
import { Card } from "../app/lib/card";

describe("Deck", () => {
  let deck: Deck;
  let cards: Card[];

  beforeEach(() => {
    deck = new Deck();
    cards = deck.getCards(); // Assuming getCards() returns the array of Card objects
  });

  test("should initialize with the correct number of cards", () => {
    expect(deck.getCards().length).toBe(52);
  });

  test("dealCard should decrease the deck size by 1", () => {
    const initialSize = deck.getCards().length;
    deck.dealCard();
    const newSize = deck.getCards().length;
    expect(newSize).toBe(initialSize - 1);
  });

  test("contains all combinations of suits and ranks", () => {
    const suits = ["Hearts", "Diamonds", "Clubs", "Spades"];
    const ranks = [
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

    suits.forEach((suit) => {
      ranks.forEach((rank) => {
        // Check if the deck contains a card with the current suit and rank
        const containsCard = cards.some(
          (card) => card.suit === suit && card.rank === rank,
        );
        expect(containsCard).toBeTruthy();
      });
    });
  });
});
