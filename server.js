import { createRequestHandler } from "@remix-run/express";
import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import compression from "compression";
import morgan from "morgan";

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

// then list to the connection event and get a socket object
io.on("connection", (socket) => {
  console.log("A user connected");

  socket.on("join room", (tableId) => {
    socket.join(tableId);
    console.log(`User joined room ${tableId}`);
  });

  socket.on("chat message", async (msg) => {
    io.to(msg.tableId).emit("chat message", msg);
    console.log(`Message sent in room ${msg.tableId}: ${msg.message}`);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected");
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
