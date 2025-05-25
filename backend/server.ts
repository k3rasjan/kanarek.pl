import "dotenv/config";
import Express from "express";
import http from "http";
import { Server } from "socket.io";
import { registerSocketHandlers } from "@socket/socket";

const PORT = parseInt(process.env.PORT || "8080");
const HOST = process.env.HOST;

const app = Express();
export const server = http.createServer(app);
const io = new Server(server);

registerSocketHandlers(io);

server.listen(PORT, HOST, () => {
  console.log(`The server is up and running on ${HOST} and port: ${PORT}`);
});
