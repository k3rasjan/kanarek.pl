import "dotenv/config";
import Express from "express";
import { getVehiclePositions } from "@helpers/vehiclePositions";

const PORT = parseInt(process.env.PORT || "8080");
const HOST = process.env.HOST;

const app = Express();

app.listen(PORT, HOST, (err) => {
  console.log(`The server is up and running on ${HOST} and port: ${PORT}`);
});
