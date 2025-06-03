import { getVehiclePositions, findMostLikelyVehicle, reportInspector } from '@helpers/vehiclePositions';
import { vehicleStore } from '@helpers/stores';
import { PrismaClient } from '@root/prisma/generated';
import axios from 'axios';
import { load } from 'protobufjs';

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
    create: jest.fn(),
    findMany: jest.fn().mockResolvedValue([
      {
        trip_id: '1_500016^Y+',
        shape_id: '69275',
        direction_id: '1'
      }
    ])
  },
  inspectors: {
    create: jest.fn().mockResolvedValue({
      id: 1,
      vehicleId: '1',
      reportedAt: new Date()
    }),
    findFirst: jest.fn(),
    findMany: jest.fn().mockResolvedValue([])
  },
  $connect: jest.fn(),
  $disconnect: jest.fn()
};

jest.mock('@root/prisma/generated', () => ({
  PrismaClient: jest.fn(() => mockPrisma),
  prisma: mockPrisma
}));

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

jest.mock('protobufjs', () => ({
  load: jest.fn().mockResolvedValue({
    lookupType: jest.fn().mockReturnValue({
      decode: jest.fn().mockReturnValue({
        entity: [
          {
            vehicle: {
              vehicle: { id: '1' },
              trip: { tripId: '1_500016^Y+', routeId: 'PKS', directionId: 1 },
              position: { latitude: 52.354273180271, longitude: 16.678778285631 }
            }
          }
        ]
      }),
      toObject: jest.fn().mockReturnValue({
        entity: [
          {
            vehicle: {
              vehicle: { id: '1' },
              trip: { tripId: '1_500016^Y+', routeId: 'PKS', directionId: 1 },
              position: { latitude: 52.354273180271, longitude: 16.678778285631 }
            }
          }
        ]
      })
    })
  })
}));

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
      const mockResponse = { data: new ArrayBuffer(8) };
      mockedAxios.get.mockResolvedValueOnce(mockResponse);

      const result = await getVehiclePositions();

      expect(result).toEqual([
        {
          id: '1',
          tripId: '1_500016^Y+',
          routeId: 'PKS',
          lat: 52.354273180271,
          long: 16.678778285631,
          directionId: 1,
          hasInspector: false
        }
      ]);
    });

    it('should throw error when GTFS-RT data is not available', async () => {
      mockedAxios.get.mockRejectedValueOnce(new Error('Network error'));

      await expect(getVehiclePositions()).rejects.toThrow('Network error');
    });
  });

  describe('findMostLikelyVehicle', () => {
    it('should find the most likely vehicle based on user locations', async () => {
      const mockResponse = { data: new ArrayBuffer(8) };
      mockedAxios.get.mockResolvedValueOnce(mockResponse);

      const locations = [
        {
          lat: 52.354273180271,
          long: 16.678778285631,
          timestamp: Date.now()
        }
      ];

      const result = await findMostLikelyVehicle(locations);

      expect(result).toEqual({
        id: '1',
        tripId: '1_500016^Y+',
        routeId: 'PKS',
        lat: 52.354273180271,
        long: 16.678778285631,
        directionId: 1,
        hasInspector: false
      });
    });

    it('should return null when no matching vehicle is found', async () => {
      const mockResponse = { data: new ArrayBuffer(8) };
      mockedAxios.get.mockResolvedValueOnce(mockResponse);

      const locations = [
        {
          lat: 0,
          long: 0,
          timestamp: Date.now()
        }
      ];

      const result = await findMostLikelyVehicle(locations);

      expect(result).toBeNull();
    });
  });

  describe('reportInspector', () => {
    it('should report an inspector for a vehicle', async () => {
      await reportInspector('1');

      expect(mockPrisma.inspectors.create).toHaveBeenCalledWith({
        data: {
          vehicleId: '1',
          reportedAt: expect.any(Date)
        }
      });
      expect(vehicleStore.updateInspectorStatus).toHaveBeenCalledWith('1', true);
    });
  });
}); 