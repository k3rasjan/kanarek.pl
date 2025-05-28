import { Server } from "socket.io";
import { getVehiclePositions } from "@helpers/vehiclePositions";
import { data } from "@helpers/stores";

export const registerSocketHandlers = (io: Server) => {
  io.on("connection", async (socket) => {
    try {
      data.vehiclePositions = await getVehiclePositions();
      socket.emit("vehiclePositions", data.vehiclePositions);
    } catch (error) {
      console.error("Error fetching vehicle positions:", error);
    }
    console.log("New client connected");
  });

  setInterval(async () => {
    data.vehiclePositions = await getVehiclePositions();
    io.emit("vehiclePositions", data.vehiclePositions);
  }, 10000);
};
