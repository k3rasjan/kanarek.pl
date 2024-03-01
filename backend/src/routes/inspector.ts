import { Router, Request, Response, RequestHandler } from 'express';
import { findMostLikelyVehicle, reportInspector } from '@helpers/vehiclePositions';

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
      res.status(400).json({ error: 'Invalid locations data' });
      return;
    }

    const vehicle = await findMostLikelyVehicle(locations);
    
    if (!vehicle) {
      res.status(404).json({ error: 'No matching vehicle found' });
      return;
    }

    res.json(vehicle);
  } catch (error) {
    console.error('Error finding vehicle:', error);
    res.status(500).json({ error: 'Internal server error' });
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