import { Router, Request, Response, RequestHandler } from 'express';
import { findMostLikelyVehicle, reportInspector } from '@helpers/vehiclePositions';
import { vehicleStore } from "@helpers/stores";

const router = Router();

interface LocationRequest {
  locations: {
    lat: number;
    long: number;
    timestamp: number;
  }[];
}

interface ReportRequest {
  vehicleId: string;
}

const findVehicleHandler: RequestHandler = async (req, res) => {
  try {
    const { locations } = req.body as LocationRequest;
    
    if (!locations || !Array.isArray(locations) || locations.length === 0) {
      res.status(400).json({ 
        status: "error",
        message: "Invalid locations data",
        data: null
      });
      return;
    }

    const vehicle = await findMostLikelyVehicle(locations);
    
    if (!vehicle) {
      res.status(404).json({ 
        status: "error",
        message: "No matching vehicle found",
        data: null
      });
      return;
    }

    res.json({
      status: "success",
      data: vehicle
    });
  } catch (error) {
    console.error('Error finding vehicle:', error);
    if (error instanceof Error && error.message === "NO_VEHICLE_DATA") {
      res.status(200).json({
        status: "error",
        message: "ZTM server is not providing vehicle data at the moment",
        data: null
      });
    } else {
      res.status(500).json({ 
        status: "error",
        message: "Internal server error",
        data: null
      });
    }
  }
};

const reportHandler: RequestHandler = async (req, res) => {
  try {
    const { vehicleId } = req.body as ReportRequest;
    
    if (!vehicleId) {
      res.status(400).json({ error: 'Vehicle ID is required' });
      return;
    }

    await reportInspector(vehicleId);
    res.json({ success: true });
  } catch (error) {
    console.error('Error reporting inspector:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

router.post('/find-vehicle', findVehicleHandler);
router.post('/report', reportHandler);

export default router; 