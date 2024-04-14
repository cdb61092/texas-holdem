import { PokerGame } from "~/lib/poker/class/pokerGame";
import { Player } from "~/lib/poker/class/player";

describe("PokerGame", () => {
  test("should throw an error when fewer than 2 players are provided", () => {
    expect(() => new PokerGame([]).startGame()).toThrow(
      "At least 2 players are required to start a game.",
    );
  });

  test("should deal 2 hole cards to each player", async () => {
    const player1 = new Player("1", "Player 1", 1000);
    const player2 = new Player("2", "Player 2", 1000);

    const game = new PokerGame([player1, player2]);

    game.dealCards();

    game.players.forEach((player) => {
      expect(player.holeCards.length).toBe(2);
    });
  });

  test("start game", async () => {});
});
