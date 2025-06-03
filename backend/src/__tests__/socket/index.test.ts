import { Server, Socket as ServerSocket } from 'socket.io';
import { createServer } from 'http';
import { initializeSocket } from '@socket/index';
import { getVehiclesWithInspectorInfo } from '@helpers/vehiclePositions';
import { vehicleStore } from '@helpers/stores';
import { AddressInfo } from 'net';
import Client from 'socket.io-client';
import { getVehiclePositions } from '@helpers/vehiclePositions';

jest.mock('@helpers/vehiclePositions');
jest.mock('@helpers/stores');

describe('Socket Server', () => {
  let httpServer: ReturnType<typeof createServer>;
  let io: Server;
  let clientSocket: ReturnType<typeof Client>;

  beforeAll((done) => {
    httpServer = createServer();
    io = new Server(httpServer);
    initializeSocket(io);
    httpServer.listen(() => {
      const port = (httpServer.address() as AddressInfo).port;
      clientSocket = Client(`http://localhost:${port}`);
      clientSocket.on('connect', done);
    });
  });

  afterAll(() => {
    io.close();
    clientSocket.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize socket server', () => {
    expect(io).toBeDefined();
  });

  it('should emit vehicle positions on connection', (done) => {
    const mockVehicles = [
      {
        id: '1',
        tripId: '1_500016^Y+',
        routeId: 'PKS',
        lat: 52.354273180271,
        long: 16.678778285631,
        directionId: 1,
        hasInspector: false
      }
    ];

    (getVehiclePositions as jest.Mock).mockResolvedValueOnce(mockVehicles);
    (vehicleStore.getVehicles as jest.Mock).mockReturnValue([]);

    clientSocket.on('vehiclePositions', (data: any) => {
      try {
        expect(data).toEqual({ status: 'success', data: mockVehicles });
        done();
      } catch (error) {
        done(error);
      }
    });
  }, 15000);

  it('should emit error status when ZTM server is unavailable', (done) => {
    const mockVehicles = [
      {
        id: '1',
        tripId: '1_500016^Y+',
        routeId: 'PKS',
        lat: 52.354273180271,
        long: 16.678778285631,
        directionId: 1,
        hasInspector: false
      }
    ];

    (getVehiclePositions as jest.Mock).mockRejectedValueOnce(new Error('NO_VEHICLE_DATA'));
    (vehicleStore.getVehicles as jest.Mock).mockReturnValue(mockVehicles);

    clientSocket.on('vehiclePositions', (data: any) => {
      try {
        expect(data).toEqual({
          status: 'error',
          message: 'ZTM server is not providing vehicle data at the moment',
          data: mockVehicles
        });
        done();
      } catch (error) {
        done(error);
      }
    });
  }, 15000);

  it('should handle client disconnection', (done) => {
    clientSocket.on('disconnect', () => {
      done();
    });
    clientSocket.disconnect();
  }, 15000);
}); 