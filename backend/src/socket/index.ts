import { Server } from "socket.io";
import { getVehiclesWithInspectorInfo } from "@helpers/vehiclePositions";
import { vehicleStore } from "@helpers/stores";

export function initializeSocket(io: Server) {
  vehicleStore.setSocketIO(io);

  setInterval(async () => {
    try {
      const vehicles = await getVehiclesWithInspectorInfo();
      io.emit("vehiclePositions", { status: "success", data: vehicles });
    } catch (error) {
      console.error("Error emitting vehicle positions:", error);
      if (error instanceof Error && error.message === "NO_VEHICLE_DATA") {
        io.emit("vehiclePositions", { 
          status: "error", 
          message: "ZTM server is not providing vehicle data at the moment",
          data: vehicleStore.getVehicles() 
        });
      }
    }
  }, 10000);

  io.on("connection", async (socket) => {
    console.log("Client connected");

    try {
      const vehicles = await getVehiclesWithInspectorInfo();
      socket.emit("vehiclePositions", { status: "success", data: vehicles });
    } catch (error) {
      console.error("Error emitting vehicle positions:", error);
      if (error instanceof Error && error.message === "NO_VEHICLE_DATA") {
        socket.emit("vehiclePositions", { 
          status: "error", 
          message: "ZTM server is not providing vehicle data at the moment",
          data: vehicleStore.getVehicles() 
        });
      }
    }

    socket.on("disconnect", () => {
      console.log("Client disconnected");
    });
  });
}

