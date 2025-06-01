import { Server, Socket as ServerSocket } from 'socket.io';
import { createServer } from 'http';
import { initializeSocket } from '@socket/index';
import { getVehiclesWithInspectorInfo } from '@helpers/vehiclePositions';
import { vehicleStore } from '@helpers/stores';

jest.mock('@helpers/vehiclePositions');
jest.mock('@helpers/stores');

describe('Socket Server', () => {
  let httpServer: ReturnType<typeof createServer>;
  let io: Server;
  let clientSocket: any;

  beforeEach((done) => {
    httpServer = createServer();
    io = new Server(httpServer);
    initializeSocket(io);
    httpServer.listen(() => {
      const port = (httpServer.address() as any).port;
      const { io: Client } = require('socket.io-client');
      clientSocket = Client(`http://localhost:${port}`, {
        transports: ['websocket'],
        forceNew: true,
        reconnection: false,
        timeout: 10000
      });
      clientSocket.on('connect', () => {
        done();
      });
    });
    jest.clearAllMocks();
  });

  afterEach((done) => {
    if (clientSocket.connected) {
      clientSocket.disconnect();
    }
    io.close(() => {
      httpServer.close(() => {
        done();
      });
    });
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

    (getVehiclesWithInspectorInfo as jest.Mock).mockResolvedValueOnce(mockVehicles);

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
    (getVehiclesWithInspectorInfo as jest.Mock).mockRejectedValueOnce(new Error('NO_VEHICLE_DATA'));

    clientSocket.on('vehiclePositions', (data: any) => {
      try {
        expect(data).toEqual({
          status: 'error',
          message: 'ZTM server is not providing vehicle data at the moment',
          data: []
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