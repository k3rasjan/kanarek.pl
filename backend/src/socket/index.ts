import { Server } from "socket.io";
import { getVehiclesWithInspectorInfo } from "@helpers/vehiclePositions";
import { vehicleStore } from "@helpers/stores";

export function initializeSocket(io: Server) {
  vehicleStore.setSocketIO(io);

  setInterval(async () => {
    try {
      const vehicles = await getVehiclesWithInspectorInfo();
      io.emit("vehiclePositions", vehicles);
    } catch (error) {
      console.error("Error emitting vehicle positions:", error);
    }
  }, 10000);

  io.on("connection", (socket) => {
    console.log("Client connected");

    const vehicles = vehicleStore.getVehicles();
    socket.emit("vehiclePositions", "SAdasd");

    socket.on("disconnect", () => {
      console.log("Client disconnected");
    });
  });
}

