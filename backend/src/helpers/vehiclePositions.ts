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
  const lat1Rad = (lat1 * Math.PI) / 180;
  const lat2Rad = (lat2 * Math.PI) / 180;
  const latDiff = ((lat2 - lat1) * Math.PI) / 180;
  const lonDiff = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(latDiff / 2) * Math.sin(latDiff / 2) +
    Math.cos(lat1Rad) * Math.cos(lat2Rad) * Math.sin(lonDiff / 2) * Math.sin(lonDiff / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

function calculateVector(startLat: number, startLon: number, endLat: number, endLon: number) {
  return {
    lat: endLat - startLat,
    lon: endLon - startLon
  };
}

function calculateVectorSimilarity(vec1: { lat: number, lon: number }, vec2: { lat: number, lon: number }) {
  const dotProduct = vec1.lat * vec2.lat + vec1.lon * vec2.lon;
  const magnitude1 = Math.sqrt(vec1.lat * vec1.lat + vec1.lon * vec1.lon);
  const magnitude2 = Math.sqrt(vec2.lat * vec2.lat + vec2.lon * vec2.lon);
  
  if (magnitude1 === 0 || magnitude2 === 0) return 0;
  
  return dotProduct / (magnitude1 * magnitude2);
}

export async function getVehiclePositions(): Promise<IVehicle[]> {
  try {
    const response = await axios.get(GTFS_RT_URL, { responseType: "arraybuffer" });
    const root = await load("src/assets/gtfs/gtfs-realtime.proto");
    const FeedMessage = root.lookupType("transit_realtime.FeedMessage");
    
    const message = FeedMessage.decode(new Uint8Array(response.data));
    const feed = FeedMessage.toObject(message, {
      defaults: true,
      arrays: true,
      objects: true
    });

    if (!feed.entity || feed.entity.length === 0) {
      throw new Error('NO_VEHICLE_DATA');
    }

    if (feed.entity[0]?.vehicle?.position) {
      console.log('Vehicle position data:', {
        latitude: feed.entity[0].vehicle.position.latitude,
        longitude: feed.entity[0].vehicle.position.longitude
      });
    }

    return feed.entity.map((entity: any) => ({
      id: entity.vehicle.vehicle.id,
      tripId: entity.vehicle.trip.tripId,
      routeId: entity.vehicle.trip.routeId,
      long: entity.vehicle.position.longitude,
      lat: entity.vehicle.position.latitude,
      directionId: entity.vehicle.trip.directionId,
      hasInspector: false,
    }));
  } catch (error) {
    if (error instanceof Error && error.message === "NO_VEHICLE_DATA") {
      console.error("ZTM server is not providing vehicle data at the moment");
      throw error;
    }
    console.error("Error fetching vehicle positions:", error);
    throw error;
  }
}

export async function findMostLikelyVehicle(locations: Location[]): Promise<IVehicle | null> {
  const vehicles = await getVehiclePositions();
  const shapes = await prisma.shapes.findMany({
    include: {
      shape_points: true,
    },
  });

  const trips = await prisma.trips.findMany();

  let bestMatch: { vehicle: IVehicle; score: number } | null = null;
  const MAX_DISTANCE = 1000;
  const MAX_TIME_DIFF = 5 * 60 * 1000;

  for (const vehicle of vehicles) {
    const trip = trips.find((t) => t.trip_id === vehicle.tripId);
    if (!trip) continue;

    const shape = shapes.find((s) => s.shape_id === trip.shape_id);
    if (!shape) continue;

    let totalDistance = 0;
    let validLocations = 0;
    
    for (const location of locations) {
      const distance = calculateDistance(
        location.lat,
        location.long,
        vehicle.lat,
        vehicle.long
      );
      
      if (distance <= MAX_DISTANCE) {
        totalDistance += distance;
        validLocations++;
      }
    }

    if (validLocations === 0) continue;

    const averageDistance = totalDistance / validLocations;
    let score = Math.max(0, 1 - (averageDistance / MAX_DISTANCE));

    if (locations.length >= 2) {
      const userVector = calculateVector(
        locations[0].lat,
        locations[0].long,
        locations[locations.length - 1].lat,
        locations[locations.length - 1].long
      );

      const closestPoints = shape.shape_points
        .map(point => ({
          point,
          distance: calculateDistance(
            vehicle.lat,
            vehicle.long,
            parseFloat(point.shape_pt_lat),
            parseFloat(point.shape_pt_lon)
          )
        }))
        .sort((a, b) => a.distance - b.distance)
        .slice(0, 2);

      if (closestPoints.length === 2) {
        const vehicleVector = calculateVector(
          parseFloat(closestPoints[0].point.shape_pt_lat),
          parseFloat(closestPoints[0].point.shape_pt_lon),
          parseFloat(closestPoints[1].point.shape_pt_lat),
          parseFloat(closestPoints[1].point.shape_pt_lon)
        );

        const vectorSimilarity = calculateVectorSimilarity(userVector, vehicleVector);
        score *= (1 + vectorSimilarity) / 2;
      }
    }

    const timeDiff = Math.abs(Date.now() - locations[locations.length - 1].timestamp);
    const timeScore = Math.max(0, 1 - (timeDiff / MAX_TIME_DIFF));
    score *= timeScore;

    if (!bestMatch || score > bestMatch.score) {
      bestMatch = { vehicle, score };
    }
  }

  if (!bestMatch) {
    let closestVehicle: { vehicle: IVehicle; distance: number } | null = null;
    
    for (const vehicle of vehicles) {
      let totalDistance = 0;
      for (const location of locations) {
        const distance = calculateDistance(
          location.lat,
          location.long,
          vehicle.lat,
          vehicle.long
        );
        totalDistance += distance;
      }
      const averageDistance = totalDistance / locations.length;
      
      if (!closestVehicle || averageDistance < closestVehicle.distance) {
        closestVehicle = { vehicle, distance: averageDistance };
      }
    }
    
    return closestVehicle?.vehicle || null;
  }

  return bestMatch.vehicle;
}

export async function reportInspector(vehicleId: string): Promise<void> {
  const now = new Date();
  console.log("Reporting inspector for vehicle:", vehicleId);
  await prisma.inspectors.create({
    data: {
      vehicleId,
      reportedAt: now,
    },
  });

  vehicleStore.updateInspectorStatus(vehicleId, true);
}

export async function getVehiclesWithInspectorInfo(): Promise<IVehicle[]> {
  try {
    const vehicles = await getVehiclePositions();
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

    const inspectorReports = await prisma.inspectors.findMany({
      where: {
        reportedAt: {
          gte: fiveMinutesAgo,
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

    vehicleStore.emitUpdates();

    return vehiclesWithInspector;
  } catch (error) {
    if (error instanceof Error && error.message === "NO_VEHICLE_DATA") {
      throw error;
    }
    throw error;
  }
}
