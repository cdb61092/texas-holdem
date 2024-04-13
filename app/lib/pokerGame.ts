import { Card } from "./card";
import { Deck } from "./deck";
import { Player } from "./player";
import invariant from "tiny-invariant";

enum GameState  {
  INSUFFICIENT_PLAYERS = "INSUFFICIENT_PLAYERS",
  PLAYING = 'PLAYING',
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

class PokerGame {
  public players: Player[];
  private readonly maxPlayers: number;
  public seats: Seat[] = [];
  private deck: Deck;
  private pot: number;
  private readonly currentBettingRound: BettingRound;
  private readonly smallBlind: number;
  private readonly bigBlind: number;
  private dealerPosition: number = 1;
  private smallBlindPosition: number = this.dealerPosition + 1;
  private bigBlindPosition: number = this.smallBlindPosition + 1;
  private gameState: GameState = GameState.INSUFFICIENT_PLAYERS;

  constructor(
    players: Player[],
    smallBlind: number = 0.25,
    bigBlind: number = 0.5,
    maxPlayers: number = 6,
  ) {
    this.players = players;
    this.deck = new Deck();
    this.maxPlayers = maxPlayers;
    this.seats = Array.from({ length: this.maxPlayers }, (_, index) => ({
      player: null,
      number: index + 1,
    }));
    this.smallBlind = smallBlind;
    this.bigBlind = bigBlind;
    this.pot = 0;
    this.currentBettingRound = BettingRound.Preflop;
  }

  public startGame(): void {
    const seatedPlayers = this.getOccupiedSeatPositions().length;
    invariant(
        seatedPlayers >= 2,
      "At least 2 players are required to start a game.",
    );
    this.newHand();
  }

  public dealCards(): this {
    this.players.forEach((player) => {
      player.holeCards = [this.deck.dealCard(), this.deck.dealCard()] as Card[];
    });

    return this;
  }

  public startBettingRound(): void {
    // Placeholder for betting round logic
    console.log(`Starting ${this.currentBettingRound} betting round.`);
    // Implement betting logic here
  }

  public newHand(): void {
    this.pot = 0;
    this.deck = new Deck().shuffle();
    this.advanceButton().dealCards().startBettingRound();
  }

  public advanceButton(): this {
    const occupiedSeats = this.getOccupiedSeatPositions();
    const currentDealerIndex = occupiedSeats.indexOf(this.dealerPosition);

    // Move the dealer button to the next occupied seat
    if (
      currentDealerIndex === -1 ||
      currentDealerIndex + 1 === occupiedSeats.length
    ) {
      this.dealerPosition = occupiedSeats[0]; // Loop back to the start
    } else {
      this.dealerPosition = occupiedSeats[currentDealerIndex + 1];
    }

    // Update small and big blind positions based on the new dealer position
    this.smallBlindPosition = this.getNextSmallBlindPosition(occupiedSeats);
    this.bigBlindPosition = this.getNextBigBlindPosition(occupiedSeats);

    return this;
  }

  // Common method to filter seats based on a predicate
  private filterSeats(
    predicate: (seat: { number: number; player: Player | null }) => boolean,
  ): number[] {
    return this.seats.filter(predicate).map((seat) => seat.number);
  }

  private getOpenSeatPositions(): number[] {
    return this.filterSeats((seat) => seat.player === null);
  }

  private getOccupiedSeatPositions(): number[] {
    return this.filterSeats((seat) => seat.player !== null);
  }

  private getNextSmallBlindPosition(occupiedSeats: number[]): number {
    const currentDealerIndex = occupiedSeats.indexOf(this.dealerPosition);
    return currentDealerIndex + 1 === occupiedSeats.length
      ? occupiedSeats[0]
      : occupiedSeats[currentDealerIndex + 1];
  }

  private getNextBigBlindPosition(occupiedSeats: number[]): number {
    const currentDealerIndex = occupiedSeats.indexOf(this.dealerPosition);
    return currentDealerIndex + 2 >= occupiedSeats.length
      ? occupiedSeats[(currentDealerIndex + 2) % occupiedSeats.length]
      : occupiedSeats[currentDealerIndex + 2];
  }

  private seatPlayer(player: Player): void {
    const openSeats = this.getOpenSeatPositions();
    this.seats[openSeats[0]].player = player;

    const numSeatedPlayers = this.getOccupiedSeatPositions().length;

    if (numSeatedPlayers >= 2 && this.gameState === GameState.INSUFFICIENT_PLAYERS) {
      this.startGame();
      this.gameState = GameState.PLAYING;
    }
  }
}

export { PokerGame };
