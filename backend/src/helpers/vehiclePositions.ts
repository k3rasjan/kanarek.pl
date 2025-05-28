import { load } from "protobufjs";
import https from "https";
import { FeedMessage } from "@assets/gtfs/gtfs-realtime";
import path from "path";

const URL =
  "https://www.ztm.poznan.pl/pl/dla-deweloperow/getGtfsRtFile?file=vehicle_positions.pb";

export interface IVehicle {
  id: number;
  routeId: number;
  long: number;
  lat: number;
}

const PROTO_PATH = path.join(__dirname, "../assets/gtfs/gtfs-realtime.proto");

export async function getVehiclePositions(): Promise<IVehicle[]> {
  return new Promise((resolve, reject) => {
    load(PROTO_PATH, (err, root) => {
      if (err) throw err;

      const FeedMessage = root!.lookupType("transit_realtime.FeedMessage");

      https
        .get(URL, (res) => {
          const chunks: Buffer[] = [];
          res.on("data", (chunk) => chunks.push(chunk));
          res.on("end", () => {
            try {
              const buffer = Buffer.concat(chunks);
              const message = FeedMessage.decode(buffer);
              const object = FeedMessage.toObject(message, {
                defaults: true,
                arrays: true,
                objects: true,
              });

              const vehicle: IVehicle[] = object.entity
                .filter((e: any) => e.vehicle.position)
                .map((e: any) => ({
                  id: e.id,
                  routeId: e.vehicle.trip.routeId,
                  long: e.vehicle.position.longitude,
                  lat: e.vehicle.position.latitude,
                }));
              resolve(vehicle);
            } catch (err) {
              reject(err);
            }
          });
        })
        .on("error", reject);
    });
  });
}
