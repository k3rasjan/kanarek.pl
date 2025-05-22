import { Router } from "express";
import { getVehiclePositions } from "@helpers/vehiclePositions";

const router = Router();

router.get("/vehicles/get/positions", async (req, res) => {
  const vehiclePositions = await getVehiclePositions();

  res.statusCode = 200;
  res.json({
    error: false,
    vehiclePositions,
  });
});

export default router;
