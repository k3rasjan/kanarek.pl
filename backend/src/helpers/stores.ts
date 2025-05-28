import { IVehicle } from "@helpers/vehiclePositions";

export let data = {
  vehiclePositions: [] as IVehicle[],
};

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
