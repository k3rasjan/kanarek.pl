import { IVehicle } from "@helpers/vehiclePositions";
import { PrismaClient } from "@root/prisma/generated";

export let data = {
  vehiclePositions: [] as IVehicle[],
};

export const prisma = new PrismaClient({
  log: ["warn", "error"],
});
