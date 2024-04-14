import { Deck, newDeck, dealCard } from "./deck";
import { Player } from "./player";
import invariant from "tiny-invariant";

enum GameState {
  INSUFFICIENT_PLAYERS = "INSUFFICIENT_PLAYERS",
  PLAYING = "PLAYING",
}

enum BettingRound {
  Preflop = "Preflop",
  Flop = "Flop",
  Turn = "Turn",
  River = "River",
  Showdown = "Showdown",
}

type Seat = {
  player: Player | null;
  number: number;
};

export type PokerGameState = {
  players: Player[];
  seats: Seat[];
  deck: Deck;
  pot: number;
  currentBettingRound: BettingRound;
  smallBlind: number;
  bigBlind: number;
  dealerPosition: number;
  smallBlindPosition: number;
  bigBlindPosition: number;
  gameState: GameState;
};

// Initial state factory
const createPokerGameState = (
  players: Player[],
  smallBlind: number = 0.25,
  bigBlind: number = 0.5,
  maxPlayers: number = 6,
): PokerGameState => {
  const seats: Seat[] = Array.from({ length: maxPlayers }, (_, index) => ({
    player: null,
    number: index + 1,
  }));

  return {
    players,
    seats,
    deck: newDeck(),
    pot: 0,
    currentBettingRound: BettingRound.Preflop,
    smallBlind,
    bigBlind,
    dealerPosition: 1,
    smallBlindPosition: 2,
    bigBlindPosition: 3,
    gameState: GameState.INSUFFICIENT_PLAYERS,
  };
};

// Function to start the game
const startGame = (state: PokerGameState): PokerGameState => {
  invariant(
    state.players.length >= 2,
    "At least 2 players are required to start a game.",
  );
  return {
    ...state,
    gameState: GameState.PLAYING,
    // ... other modifications to the state as necessary to start the game
  };
};

// ... (other functions to manipulate the game state)

export { createPokerGameState, startGame };
