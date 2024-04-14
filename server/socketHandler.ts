import { type Server as SocketIOServer } from "socket.io";
import { createPlayer } from "~/lib/poker/functional/player";
import {
  createPokerGameState,
  PokerGameState,
} from "~/lib/poker/functional/pokerGame";
import invariant from "tiny-invariant";
import { prisma } from "~/.server/prisma/prisma";

interface GameStateMap {
  [key: string]: PokerGameState;
}

const initializeGameStates = async () => {
  const tables = await prisma.table.findMany({
    select: {
      id: true,
    },
  });

  // Assuming you have a function to create a default PokerGameState
  const gameStates: GameStateMap = {};
  tables.forEach((table) => {
    gameStates[table.id] = createPokerGameState([]); // Initialize each state
  });

  return gameStates;
};
// Map to store user data by socket.id.
const userMap = new Map();

export const setupSocketHandlers = async (io: SocketIOServer) => {
  const gameStates = await initializeGameStates();
  io.on("connection", (socket) => {
    console.log("A user connected");

    socket.on("join table", ({ table, user }) => {
      console.log("table: ", table);
      console.log("user: ", user);
      const tableId = table.id;

      // Join the room for the table.
      socket.join(tableId);

      // Store user data in the map when they join
      userMap.set(socket.id, { user: user, tableId });

      const room = io.sockets.adapter.rooms.get(tableId);
      const numberOfClients = room ? room.size : 0;
      console.log(
        `User joined room ${tableId}. Number of players: ${numberOfClients}`,
      );

      // Conditions to begin the game.
      if (numberOfClients >= 2 && !gameStates[tableId]) {
        const message = "Game is starting";
        io.to(tableId).emit("start game", { tableId, message });

        invariant(room, "Unable to find room");
        const users = Array.from(room)
          .map((socketId) => {
            const { user } = userMap.get(socketId);
            return user ? user : null;
          })
          .filter((user) => user != null);

        const players = users.map((user) =>
          createPlayer(user.id, user.displayName, user.balance),
        );
        gameStates[tableId] = createPokerGameState(players);
        io.to(tableId).emit("update game state", gameStates[tableId]);
      }
    });

    socket.on("chat message", async (msg) => {
      io.to(msg.tableId).emit("chat message", msg);
      console.log(`Message sent in room ${msg.tableId}: ${msg.message}`);
    });

    socket.on("disconnect", () => {
      if (userMap.has(socket.id)) {
        const userData = userMap.get(socket.id);
        userMap.delete(socket.id);
        console.log(`User ${userData.userId} disconnected`);
        // Additional cleanup logic can go here
      }
    });
  });
};
