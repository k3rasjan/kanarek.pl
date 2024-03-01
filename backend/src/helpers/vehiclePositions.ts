import axios from "axios";
import { load } from "protobufjs";
import { prisma } from "@helpers/stores";
import { vehicleStore } from "@helpers/stores";

const GTFS_RT_URL =
  "https://www.ztm.poznan.pl/pl/dla-deweloperow/getGtfsRtFile?file=vehicle_positions.pb";

export interface IVehicle {
  id: string;
  tripId: string;
  routeId: string;
  long: number;
  lat: number;
  directionId: string;
  hasInspector: boolean;
  inspectorReportedAt?: string;
}

interface Location {
  lat: number;
  long: number;
  timestamp: number;
}

const R = 6371e3;

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

export async function getVehiclePositions(): Promise<IVehicle[]> {
  const response = await axios.get(GTFS_RT_URL, { responseType: "arraybuffer" });
  const root = await load("src/assets/gtfs/gtfs-realtime.proto");
  const FeedMessage = root.lookupType("transit_realtime.FeedMessage");
  const message = FeedMessage.decode(new Uint8Array(response.data));
  const feed = FeedMessage.toObject(message, {
    longs: String,
    enums: String,
    bytes: String,
  });

  return feed.entity.map((entity: any) => ({
    id: entity.vehicle.vehicle.id,
    tripId: entity.vehicle.trip.tripId,
    routeId: entity.vehicle.trip.routeId,
    long: entity.vehicle.position.longitude,
    lat: entity.vehicle.position.latitude,
    directionId: entity.vehicle.trip.directionId,
    hasInspector: false,
  }));
}

export async function findMostLikelyVehicle(locations: Location[]): Promise<IVehicle | null> {
  const vehicles = await getVehiclePositions();
  const shapes = await prisma.shapes.findMany({
    include: {
      shape_points: true,
    },
  });

  let bestMatch: { vehicle: IVehicle; score: number } | null = null;

  for (const vehicle of vehicles) {
    const shape = shapes.find((s) => s.shape_id === vehicle.tripId);
    if (!shape) continue;

    const shapePoints = shape.shape_points;
    let totalDistance = 0;

    for (const location of locations) {
      let minDistance = Infinity;
      for (const point of shapePoints) {
        const distance = calculateDistance(
          location.lat,
          location.long,
          parseFloat(point.shape_pt_lat),
          parseFloat(point.shape_pt_lon)
        );
        minDistance = Math.min(minDistance, distance);
      }
      totalDistance += minDistance;
    }

    const averageDistance = totalDistance / locations.length;
    let score = 1 / (1 + averageDistance);

    const direction = locations[locations.length - 1].long - locations[0].long;
    const vehicleDirection = vehicle.directionId === "0" ? 1 : -1;

    if (Math.sign(direction) === vehicleDirection) {
      score *= 0.8;
    }

    if (!bestMatch || score > bestMatch.score) {
      bestMatch = { vehicle, score };
    }
  }

  return bestMatch?.vehicle || null;
}

export async function reportInspector(vehicleId: string): Promise<void> {
  const now = new Date();
  await prisma.inspectors.create({
    data: {
      vehicleId,
      reportedAt: now,
    },
  });

  vehicleStore.updateInspectorStatus(vehicleId, true);
}

export async function getVehiclesWithInspectorInfo(): Promise<IVehicle[]> {
  const vehicles = await getVehiclePositions();
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

  const inspectorReports = await prisma.inspectors.findMany({
    where: {
      reportedAt: {
        gt: fiveMinutesAgo,
      },
    },
  });

  const vehiclesWithInspector = vehicles.map((vehicle) => {
    const report = inspectorReports.find((r) => r.vehicleId === vehicle.id);
    if (report) {
      vehicle.hasInspector = true;
      vehicle.inspectorReportedAt = report.reportedAt.toISOString();
    }
    return vehicle;
  });

  vehiclesWithInspector.forEach((vehicle) => {
    vehicleStore.updateVehicle(vehicle);
  });

  return vehiclesWithInspector;
}
