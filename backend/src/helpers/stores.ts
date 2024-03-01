import { IVehicle } from "@helpers/vehiclePositions";
import { Server } from 'socket.io';
import { PrismaClient } from "@root/prisma/generated";

export let data = {
  vehiclePositions: [] as IVehicle[],
};

export interface VehicleData {
  id: string;
  tripId: string;
  routeId: string;
  long: number;
  lat: number;
  directionId: string;
  hasInspector: boolean;
  inspectorReportedAt?: string;
}

export const prisma = new PrismaClient({
  log: ["warn", "error"],
});

class VehicleStore {
  private vehicles: Map<string, VehicleData>;
  private io: Server | null;
  private cleanupInterval: NodeJS.Timeout | null;

  constructor() {
    this.vehicles = new Map();
    this.io = null;
    this.cleanupInterval = null;
    this.startCleanup();
  }

  private startCleanup() {
    // Clean up old vehicle data every 5 minutes
    this.cleanupInterval = setInterval(() => {
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
      for (const [id, vehicle] of this.vehicles.entries()) {
        if (vehicle.inspectorReportedAt && new Date(vehicle.inspectorReportedAt) < fiveMinutesAgo) {
          this.vehicles.delete(id);
        }
      }
    }, 5 * 60 * 1000);
  }

  setSocketIO(io: Server) {
    this.io = io;
  }

  updateVehicle(vehicle: VehicleData) {
    try {
      this.vehicles.set(vehicle.id, vehicle);
      this.io?.emit("vehicleUpdate", vehicle);
    } catch (error) {
      console.error("Error updating vehicle:", error);
    }
  }

  getVehicles(): VehicleData[] {
    return Array.from(this.vehicles.values());
  }

  updateInspectorStatus(vehicleId: string, hasInspector: boolean) {
    try {
      const vehicle = this.vehicles.get(vehicleId);
      if (vehicle) {
        vehicle.hasInspector = hasInspector;
        vehicle.inspectorReportedAt = hasInspector ? new Date().toISOString() : undefined;
        this.io?.emit("vehicleUpdate", vehicle);
      }
    } catch (error) {
      console.error("Error updating inspector status:", error);
    }
  }

  getVehicle(vehicleId: string): VehicleData | undefined {
    return this.vehicles.get(vehicleId);
  }

  cleanup() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
  }
}

export const vehicleStore = new VehicleStore();
