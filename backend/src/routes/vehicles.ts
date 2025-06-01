import { Router } from "express";
import { getVehiclePositions } from "@helpers/vehiclePositions";
import { vehicleStore } from "@helpers/stores";

const router = Router();

router.get("/get-positions", async (req, res) => {
  try {
    const vehiclePositions = await getVehiclePositions();
    res.status(200).json({
      status: "success",
      data: vehiclePositions
    });
  } catch (error) {
    console.error("Error fetching vehicle positions:", error);
    if (error instanceof Error && error.message === "NO_VEHICLE_DATA") {
      res.status(200).json({
        status: "error",
        message: "ZTM server is not providing vehicle data at the moment",
        data: vehicleStore.getVehicles()
      });
    } else {
      res.status(500).json({
        status: "error",
        message: "Internal server error",
        data: []
      });
    }
  }
});

export default router;
