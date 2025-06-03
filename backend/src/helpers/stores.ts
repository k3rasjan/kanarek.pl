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
  datasourceUrl: process.env.NODE_ENV === 'test' ? process.env.TEST_DATABASE_URL : process.env.DATABASE_URL
});

class VehicleStore {
  private vehicles: Map<string, VehicleData>;
  private io: Server | null;
  private cleanupInterval: NodeJS.Timeout | null;
  private pendingUpdates: Set<string>;

  constructor() {
    this.vehicles = new Map();
    this.io = null;
    this.cleanupInterval = null;
    this.pendingUpdates = new Set();
    this.startCleanup();
  }

  private startCleanup() {
    this.cleanupInterval = setInterval(() => {
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
      for (const [id, vehicle] of this.vehicles.entries()) {
        if (vehicle.inspectorReportedAt && new Date(vehicle.inspectorReportedAt) < fiveMinutesAgo) {
          vehicle.hasInspector = false;
          vehicle.inspectorReportedAt = undefined;
          this.pendingUpdates.add(id);
        }
      }
      this.emitUpdates();
    }, 5 * 60 * 1000);
  }

  setSocketIO(io: Server) {
    this.io = io;
  }

  updateVehicle(vehicle: VehicleData) {
    try {
      this.vehicles.set(vehicle.id, vehicle);
      this.pendingUpdates.add(vehicle.id);
    } catch (error) {
      console.error("Error updating vehicle:", error);
    }
  }

  emitUpdates() {
    if (this.pendingUpdates.size > 0) {
      this.io?.emit("vehicleUpdate", this.getVehicles());
      this.pendingUpdates.clear();
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
        this.pendingUpdates.add(vehicleId);
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
