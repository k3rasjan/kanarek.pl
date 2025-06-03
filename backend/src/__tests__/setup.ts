import dotenv from 'dotenv';
import { PrismaClient } from '@root/prisma/generated';

dotenv.config();

if (!process.env.TEST_DATABASE_URL) {
  throw new Error('TEST_DATABASE_URL environment variable is not set');
}

const prisma = new PrismaClient({
  datasourceUrl: process.env.TEST_DATABASE_URL,
  log: ['error']
});

jest.mock('axios', () => ({
  get: jest.fn()
}));

jest.mock('@helpers/stores', () => ({
  vehicleStore: {
    updateInspectorStatus: jest.fn(),
    getVehicles: jest.fn(),
    setSocketIO: jest.fn(),
    updateVehicle: jest.fn(),
    emitUpdates: jest.fn(),
    getVehicle: jest.fn(),
    cleanup: jest.fn()
  },
  prisma
}));

beforeAll(async () => {
  await prisma.$connect();
});

afterAll(async () => {
  await prisma.$disconnect();
});

beforeEach(async () => {
  await prisma.inspectors.deleteMany();
  await prisma.trips.deleteMany();
  await prisma.shapePoint.deleteMany();
  await prisma.shapes.deleteMany();
});

describe('Test Setup', () => {
  it('should have a working database connection', async () => {
    expect(prisma).toBeDefined();
    await expect(prisma.$queryRaw`SELECT 1`).resolves.toBeDefined();
  });
}); 