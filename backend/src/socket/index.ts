import { Server } from 'socket.io';
import { getVehiclesWithInspectorInfo } from '@helpers/vehiclePositions';
import { vehicleStore } from '@helpers/stores';

export function initializeSocket(io: Server) {
  // Set the socket.io instance in the store
  vehicleStore.setSocketIO(io);

  // Emit vehicle positions every 10 seconds
  setInterval(async () => {
    try {
      const vehicles = await getVehiclesWithInspectorInfo();
      io.emit('vehiclePositions', vehicles);
    } catch (error) {
      console.error('Error emitting vehicle positions:', error);
    }
  }, 10000);

  // Handle socket connections
  io.on('connection', (socket) => {
    console.log('Client connected');

    // Send initial vehicle data to the new client
    const vehicles = vehicleStore.getVehicles();
    socket.emit('vehiclePositions', "SAdasd");

    socket.on('disconnect', () => {
      console.log('Client disconnected');
    });
  });
} 