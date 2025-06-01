import request from 'supertest';
import express from 'express';
import inspectorRouter from '@routes/inspector';
import { findMostLikelyVehicle, reportInspector } from '@helpers/vehiclePositions';
import { vehicleStore } from '@helpers/stores';

jest.mock('@helpers/vehiclePositions');
jest.mock('@helpers/stores');

describe('Inspector Routes', () => {
  let app: express.Application;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/inspector', inspectorRouter);
    jest.clearAllMocks();
  });

  describe('POST /find-vehicle', () => {
    it('should find vehicle and return its data', async () => {
      const mockVehicle = {
        id: '1',
        tripId: 'trip1',
        routeId: 'route1',
        lat: 52.4,
        long: 16.9,
        directionId: '0',
        hasInspector: false
      };

      (findMostLikelyVehicle as jest.Mock).mockResolvedValueOnce(mockVehicle);

      const response = await request(app)
        .post('/api/inspector/find-vehicle')
        .send({
          locations: [{
            lat: 52.4,
            long: 16.9,
            timestamp: Date.now()
          }]
        })
        .expect(200);

      expect(response.body).toEqual({
        status: 'success',
        data: mockVehicle
      });
    });

    it('should handle invalid input data', async () => {
      const response = await request(app)
        .post('/api/inspector/find-vehicle')
        .send({
          locations: []
        })
        .expect(400);

      expect(response.body).toEqual({
        status: 'error',
        message: 'Invalid locations data',
        data: null
      });
    });

    it('should handle when no vehicle is found', async () => {
      (findMostLikelyVehicle as jest.Mock).mockResolvedValueOnce(null);

      const response = await request(app)
        .post('/api/inspector/find-vehicle')
        .send({
          locations: [{
            lat: 52.4,
            long: 16.9,
            timestamp: Date.now()
          }]
        })
        .expect(404);

      expect(response.body).toEqual({
        status: 'error',
        message: 'No matching vehicle found',
        data: null
      });
    });
  });

  describe('POST /report', () => {
    it('should report inspector for a vehicle', async () => {
      const mockVehicle = {
        id: '1',
        tripId: 'trip1',
        routeId: 'route1',
        lat: 52.4,
        long: 16.9,
        directionId: '0',
        hasInspector: false
      };

      (vehicleStore.getVehicles as jest.Mock).mockReturnValueOnce([mockVehicle]);
      (reportInspector as jest.Mock).mockResolvedValueOnce(undefined);

      const response = await request(app)
        .post('/api/inspector/report')
        .send({
          vehicleId: '1'
        })
        .expect(200);

      expect(response.body).toEqual({
        success: true
      });
    });

    it('should handle invalid vehicle ID', async () => {
      const response = await request(app)
        .post('/api/inspector/report')
        .send({})
        .expect(400);

      expect(response.body).toEqual({
        error: 'Vehicle ID is required'
      });
    });

    it('should handle when vehicle is not found', async () => {
      (vehicleStore.getVehicles as jest.Mock).mockReturnValueOnce([]);

      const response = await request(app)
        .post('/api/inspector/report')
        .send({
          vehicleId: '1'
        })
        .expect(200);

      expect(response.body).toEqual({
        success: true
      });
    });
  });
}); 