import * as fs from "node:fs";
import * as path from "node:path";
import * as url from "node:url";
import { createRequestHandler, RequestHandler } from "@remix-run/express";
import { broadcastDevReady, installGlobals } from "@remix-run/node";
import sourceMapSupport from "source-map-support";
import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import compression from "compression";
import morgan from "morgan";
import { setupSocketHandlers } from "./socketHandler";

// Patch in Remix runtime globals.
installGlobals();
sourceMapSupport.install();

/**
 * @typedef {import('@remix-run/node').ServerBuild} ServerBuild
 */
const BUILD_PATH = path.resolve("build/index.js");
const VERSION_PATH = path.resolve("build/version.txt");

/**
 * Initial build
 * @type {ServerBuild}
 */
let build = await reimportServer();

// We'll make chokidar a dev dependency, so it doesn't get bundled in production.
const chokidar =
  process.env.NODE_ENV === "development" ? await import("chokidar") : null;

const app = express();
app.use(compression());

// http://expressjs.com/en/advanced/best-practice-security.html#at-a-minimum-disable-x-powered-by-header
app.disable("x-powered-by");

// Remix fingerprints its assets so we can cache forever.
app.use(
  "/build",
  express.static("public/build", { immutable: true, maxAge: "1y" }),
);

// Everything else (like favicon.ico) is cached for an hour.
app.use(express.static("public", { maxAge: "1h" }));

app.use(morgan("tiny"));

// Check if the server is running in development mode and use the devBuild to reflect realtime changes in the codebase.
app.all(
  "*",
  process.env.NODE_ENV === "development"
    ? createDevRequestHandler()
    : createRequestHandler({
        build,
        mode: process.env.NODE_ENV,
      }),
);

// Create an httpServer from the Express app.
const httpServer = createServer(app);

// Create the socket.io server from the httpServer.
const io = new Server(httpServer);
await setupSocketHandlers(io);

const port = process.env.PORT || 3000;
httpServer.listen(port, async () => {
  console.log(`Express server listening on port ${port}`);

  // Send "ready" message to dev server.
  if (process.env.NODE_ENV === "development") {
    await broadcastDevReady(build);
  }
});

// Create a request handler that watches for changes to the server build during development.
function createDevRequestHandler(): RequestHandler {
  async function handleServerUpdate() {
    // 1. Re-import the server build.
    build = await reimportServer();

    if (build?.assets === undefined) {
      console.log(build.assets);
    }

    // 2. Tell dev server that this app server is now up-to-date and ready.
    await broadcastDevReady(build);
  }

  chokidar
    ?.watch(VERSION_PATH, { ignoreInitial: true })
    .on("add", handleServerUpdate)
    .on("change", handleServerUpdate);

  // Wrap request handler to make sure its recreated with the latest build for every request.
  return async (req, res, next) => {
    try {
      return createRequestHandler({
        build,
        mode: "development",
      })(req, res, next);
    } catch (error) {
      next(error);
    }
  };
}

// ESM import cache busting.
/**
 * @type {() => Promise<ServerBuild>}
 */
async function reimportServer() {
  const stat = fs.statSync(BUILD_PATH);

  // Convert build path to URL for Windows compatibility with dynamic `import`.
  const BUILD_URL = url.pathToFileURL(BUILD_PATH).href;

  // Use a timestamp query parameter to bust the import cache.
  return import(BUILD_URL + "?t=" + stat.mtimeMs);
}
