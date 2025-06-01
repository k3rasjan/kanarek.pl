import request from 'supertest';
import express from 'express';
import vehiclesRouter from '@routes/vehicles';
import { getVehiclePositions } from '@helpers/vehiclePositions';
import { vehicleStore } from '@helpers/stores';

jest.mock('@helpers/vehiclePositions');

describe('Vehicles Routes', () => {
  let app: express.Application;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/vehicles', vehiclesRouter);
    jest.clearAllMocks();
  });

  describe('GET /get-positions', () => {
    it('should return vehicle positions when available', async () => {
      const mockVehicles = [
        {
          id: '1',
          tripId: 'trip1',
          routeId: 'route1',
          lat: 52.4,
          long: 16.9,
          directionId: '0',
          hasInspector: false
        }
      ];

      (getVehiclePositions as jest.Mock).mockResolvedValueOnce(mockVehicles);

      const response = await request(app)
        .get('/api/vehicles/get-positions')
        .expect(200);

      expect(response.body).toEqual({
        status: 'success',
        data: mockVehicles
      });
    });

    it('should return cached data when ZTM server is unavailable', async () => {
      const mockCachedVehicles = [
        {
          id: '1',
          tripId: 'trip1',
          routeId: 'route1',
          lat: 52.4,
          long: 16.9,
          directionId: '0',
          hasInspector: false
        }
      ];

      (getVehiclePositions as jest.Mock).mockRejectedValueOnce(new Error('NO_VEHICLE_DATA'));
      (vehicleStore.getVehicles as jest.Mock).mockReturnValueOnce(mockCachedVehicles);

      const response = await request(app)
        .get('/api/vehicles/get-positions')
        .expect(200);

      expect(response.body).toEqual({
        status: 'error',
        message: 'ZTM server is not providing vehicle data at the moment',
        data: mockCachedVehicles
      });
    });

    it('should handle internal server errors', async () => {
      (getVehiclePositions as jest.Mock).mockRejectedValueOnce(new Error('Internal error'));

      const response = await request(app)
        .get('/api/vehicles/get-positions')
        .expect(500);

      expect(response.body).toEqual({
        status: 'error',
        message: 'Internal server error',
        data: []
      });
    });
  });
}); 