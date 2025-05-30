import "dotenv/config";
import Express from "express";
import http from "http";
import { Server } from "socket.io";
import { initializeSocket } from "@socket/index";
import cron from "node-cron";
import { updateData } from "@helpers/databaseImport";
import router from "@routes/router";

const PORT = parseInt(process.env.PORT || "8080");
const HOST = process.env.HOST;

const app = Express();
export const server = http.createServer(app);
const io = new Server(server);

app.use(Express.json());

app.use(router);

initializeSocket(io);
cron.schedule("0 0 * * *", () => {
  updateData(["shapes", "trips"]).catch((err) => {
    console.error("Error updating data:", err);
  });
});

updateData(["shapes", "trips"]).catch((err) => {
  console.error("Error updating data:", err);
});

server.listen(PORT, HOST, () => {
  console.log(`The server is up and running on ${HOST} and port: ${PORT}`);
});
