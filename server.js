import { createRequestHandler } from "@remix-run/express";
import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import compression from "compression";
import morgan from "morgan";
import { createPokerGameState } from "/app/lib/poker/functional/pokerGame.ts";
import { prisma } from "app/.server/prisma/prisma";
import { createPlayer } from "/app/lib/poker/functional/player.ts";

const viteDevServer =
  process.env.NODE_ENV === "production"
    ? null
    : await import("vite").then((vite) =>
        vite.createServer({
          server: { middlewareMode: true },
        }),
      );

const app = express();

// Create an httpServer from the Express app.
const httpServer = createServer(app);

// Create the socket.io server from the httpServer.
const io = new Server(httpServer);

const gameStates = {}; // Object to store the state of each game
const userMap = new Map(); // Map to store user data by socket.id

// then list to the connection event and get a socket object
io.on("connection", (socket) => {
  console.log("A user connected");

  socket.on("join table", (table, user) => {
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

    if (numberOfClients >= 2) {
      io.to(tableId).emit("start game", { tableId });

      // Initialize the game state if it doesn't exist
      if (!gameStates[tableId]) {
        const users = Array.from(room).map(
          (socketId) => userMap.get(socketId).user.id,
        );
        const players = users.map((user) =>
          createPlayer(user.id, user.displayName, user.balance),
        );
        gameStates[tableId] = createPokerGameState(players);
      }
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

app.use(compression());
app.use(express.static("public", { maxAge: "1h" }));
app.use(express.static("public/build", { immutable: true, maxAge: "1y" }));
app.use(morgan("tiny"));

app.use(
  viteDevServer ? viteDevServer.middlewares : express.static("build/client"),
);

const build = viteDevServer
  ? () => viteDevServer.ssrLoadModule("virtual:remix/server-build")
  : await import("./build/server/index.js");

// and your app is "just a request handler"
app.all("*", createRequestHandler({ build }));

const port = process.env.PORT || 3000;

// instead of using `app.listen` we use `httpServer.listen`
httpServer.listen(port, () => {
  console.log(`Express server listening on port ${port}`);
});
