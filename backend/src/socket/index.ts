import { Server } from "socket.io";
import { getVehiclePositions } from "@helpers/vehiclePositions";
import { vehicleStore } from "@helpers/stores";

export function initializeSocket(io: Server) {
  vehicleStore.setSocketIO(io);

  io.on("connection", (socket) => {
    console.log("Client connected");

    const emitVehiclePositions = async () => {
      try {
        const vehicles = await getVehiclePositions();
        socket.emit("vehiclePositions", {
          status: "success",
          data: vehicles
        });
      } catch (error) {
        console.error("Error emitting vehicle positions:", error);
        if (error instanceof Error && error.message === "NO_VEHICLE_DATA") {
          socket.emit("vehiclePositions", {
            status: "error",
            message: "ZTM server is not providing vehicle data at the moment",
            data: []
          });
        }
      }
    };

    emitVehiclePositions();

    const interval = setInterval(emitVehiclePositions, 5000);

    socket.on("disconnect", () => {
      console.log("Client disconnected");
      clearInterval(interval);
    });
  });

  return () => {
    io.close();
  };
}

