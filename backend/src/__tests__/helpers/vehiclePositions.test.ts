import { getVehiclePositions, findMostLikelyVehicle, reportInspector } from '@helpers/vehiclePositions';
import { vehicleStore } from '@helpers/stores';
import { PrismaClient } from '@root/prisma/generated';
import axios from 'axios';
import { load } from 'protobufjs';

// Create a mock Prisma client
const mockPrisma = {
  shapes: {
    findMany: jest.fn().mockResolvedValue([
      {
        shape_id: '69275',
        shape_points: [
          {
            shape_id: '69275',
            shape_pt_lat: '52.354273180271',
            shape_pt_lon: '16.678778285631',
            shape_pt_sequence: '0'
          }
        ]
      }
    ]),
    create: jest.fn()
  },
  shapePoint: {
    create: jest.fn()
  },
  trips: {
    create: jest.fn()
  },
  inspectors: {
    create: jest.fn().mockResolvedValue({
      id: 1,
      vehicleId: '1',
      reportedAt: new Date()
    }),
    findFirst: jest.fn()
  },
  $connect: jest.fn(),
  $disconnect: jest.fn()
};

// Mock the Prisma client
jest.mock('@root/prisma/generated', () => ({
  PrismaClient: jest.fn(() => mockPrisma)
}));

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Mock the stores module
jest.mock('@helpers/stores', () => ({
  vehicleStore: {
    updateInspectorStatus: jest.fn(),
    getVehicles: jest.fn().mockReturnValue([]),
    setSocketIO: jest.fn(),
    updateVehicle: jest.fn(),
    emitUpdates: jest.fn(),
    getVehicle: jest.fn(),
    cleanup: jest.fn()
  }
}));

describe('Vehicle Positions Helper', () => {
  let FeedMessage: any;

  beforeAll(async () => {
    const root = await load("src/assets/gtfs/gtfs-realtime.proto");
    FeedMessage = root.lookupType("transit_realtime.FeedMessage");
  });

  beforeEach(() => {
    jest.clearAllMocks();
    (vehicleStore.getVehicles as jest.Mock).mockReturnValue([]);
  });

  describe('getVehiclePositions', () => {
    it('should return vehicle positions when GTFS-RT data is available', async () => {
      const mockGtfsData = {
        header: {
          gtfsRealtimeVersion: "2.0",
          timestamp: Math.floor(Date.now() / 1000),
          incrementality: "FULL_DATASET"
        },
        entity: [
          {
            id: "1",
            vehicle: {
              vehicle: { id: '1' },
              trip: { 
                tripId: '1_500016^Y+',
                routeId: 'PKS',
                directionId: 1
              },
              position: { 
                latitude: 52.354273180271,
                longitude: 16.678778285631
              }
            }
          }
        ]
      };

      const message = FeedMessage.create(mockGtfsData);
      const buffer = FeedMessage.encode(message).finish();

      mockedAxios.get.mockResolvedValueOnce({
        data: buffer
      });

      const result = await getVehiclePositions();
      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        id: '1',
        tripId: '1_500016^Y+',
        routeId: 'PKS',
        lat: expect.closeTo(52.354273180271, 5),
        long: expect.closeTo(16.678778285631, 5),
        directionId: 1,
        hasInspector: false
      });
    });

    it('should throw NO_VEHICLE_DATA error when GTFS-RT data is empty', async () => {
      const mockGtfsData = {
        header: {
          gtfsRealtimeVersion: "2.0",
          timestamp: Math.floor(Date.now() / 1000),
          incrementality: "FULL_DATASET"
        },
        entity: []
      };

      const message = FeedMessage.create(mockGtfsData);
      const buffer = FeedMessage.encode(message).finish();

      mockedAxios.get.mockResolvedValueOnce({
        data: buffer
      });

      await expect(getVehiclePositions()).rejects.toThrow('NO_VEHICLE_DATA');
    });
  });

  describe('findMostLikelyVehicle', () => {
    it('should find the most likely vehicle based on user locations', async () => {
      const mockGtfsData = {
        header: {
          gtfsRealtimeVersion: "2.0",
          timestamp: Math.floor(Date.now() / 1000),
          incrementality: "FULL_DATASET"
        },
        entity: [
          {
            id: "1",
            vehicle: {
              vehicle: { id: '1' },
              trip: { 
                tripId: '1_500016^Y+',
                routeId: 'PKS',
                directionId: 1
              },
              position: { 
                latitude: 52.354273180271,
                longitude: 16.678778285631
              }
            }
          }
        ]
      };

      const message = FeedMessage.create(mockGtfsData);
      const buffer = FeedMessage.encode(message).finish();

      mockedAxios.get.mockResolvedValueOnce({
        data: buffer
      });

      const locations = [
        { lat: 52.354273180271, long: 16.678778285631, timestamp: Date.now() }
      ];

      const result = await findMostLikelyVehicle(locations);
      expect(result).not.toBeNull();
      expect(result?.id).toBe('1');
    });

    it('should return null when no matching vehicle is found', async () => {
      const mockGtfsData = {
        header: {
          gtfsRealtimeVersion: "2.0",
          timestamp: Math.floor(Date.now() / 1000),
          incrementality: "FULL_DATASET"
        },
        entity: [
          {
            id: "1",
            vehicle: {
              vehicle: { id: '1' },
              trip: { 
                tripId: '1_500016^Y+',
                routeId: 'PKS',
                directionId: 1
              },
              position: { 
                latitude: 52.5,
                longitude: 17.0
              }
            }
          }
        ]
      };

      const message = FeedMessage.create(mockGtfsData);
      const buffer = FeedMessage.encode(message).finish();

      mockedAxios.get.mockResolvedValueOnce({
        data: buffer
      });

      const locations = [
        { lat: 52.354273180271, long: 16.678778285631, timestamp: Date.now() }
      ];

      const result = await findMostLikelyVehicle(locations);
      expect(result).toBeNull();
    });
  });

  describe('reportInspector', () => {
    it('should report an inspector for a vehicle', async () => {
      const vehicleId = '1';
      await reportInspector(vehicleId);

      expect(mockPrisma.inspectors.create).toHaveBeenCalledWith({
        data: {
          vehicleId,
          reportedAt: expect.any(Date)
        }
      });
      expect(vehicleStore.updateInspectorStatus).toHaveBeenCalledWith(vehicleId, true);
    });
  });
}); 