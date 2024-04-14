type Suit = "Hearts" | "Diamonds" | "Clubs" | "Spades";
type Rank =
  | "2"
  | "3"
  | "4"
  | "5"
  | "6"
  | "7"
  | "8"
  | "9"
  | "10"
  | "Jack"
  | "Queen"
  | "King"
  | "Ace";

type Card = {
  suit: Suit;
  rank: Rank;
};

type Deck = Card[];

// Create a card object with a suit and rank.
const createCard = (suit: Suit, rank: Rank): Card => ({ suit, rank });

const newDeck = (): Deck => {
  const suits: Suit[] = ["Hearts", "Diamonds", "Clubs", "Spades"];
  const ranks: Rank[] = [
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

  const deck = suits.flatMap((suit) =>
    ranks.map((rank) => createCard(suit, rank)),
  );

  // Cross join the cards and suits to create a deck of cards
  return shuffleDeck(deck);
};

// Fisher-Yates shuffle algorithm
const shuffleDeck = (deck: Deck): Deck => {
  // Clone the deck to avoid mutating the original array
  const shuffledDeck = [...deck];

  for (let i = shuffledDeck.length - 1; i > 0; i--) {
    // Generate a random array index between 0 and i (inclusive)
    const j = Math.floor(Math.random() * (i + 1));
    // Swap elements at indices i and j
    [shuffledDeck[i], shuffledDeck[j]] = [shuffledDeck[j], shuffledDeck[i]];
  }

  return shuffledDeck;
};

const dealCard = (deck: Deck) => {
  // Grab the top card from the deck and return it along with the remaining deck
  const [card, ...remainingDeck] = deck;
  return { card, remainingDeck };
};

export { newDeck, shuffleDeck, dealCard, type Card, type Deck };

// Usage
// let deck = createDeck();
// deck = shuffleDeck(deck);
// const { card, remainingDeck } = dealCard(deck);
// console.log(`${card.rank} of ${card.suit}`);
