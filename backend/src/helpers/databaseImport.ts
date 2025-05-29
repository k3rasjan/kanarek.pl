import axios from "axios";
import fs from "fs";
import crypto from "crypto";
import AdmZip from "adm-zip";
import path from "path";
import { prisma } from "@helpers/stores";
import { createReadStream } from "fs";
import { createInterface } from "readline";
import { PrismaClient } from "@root/prisma/generated";

const URL = "https://www.ztm.poznan.pl/pl/dla-deweloperow/getGTFSFile";
const BATCH_SIZE = 1000;
const CONCURRENT_BATCHES = 5;

type TableName = 'routes' | 'services' | 'shapes' | 'shapePoint' | 'trips' | 'inspectors';

type ShapeRecord = {
  shape_id: string;
};

type ShapePointRecord = {
  shape_id: string;
  shape_pt_lat: string;
  shape_pt_lon: string;
  shape_pt_sequence: string;
};

type ProcessedRecord = {
  shapeRecord: ShapeRecord;
  shapePointRecord: ShapePointRecord;
} | Record<string, string>;

export async function hasFileChanged(fileUrl: string, localHashPath: string, destPath: string): Promise<boolean> {
  const response = await axios.get(fileUrl, { responseType: "arraybuffer" });
  const hash = crypto.createHash("sha256").update(response.data).digest("hex");
  if (fs.existsSync(localHashPath)) {
    const savedHash = fs.readFileSync(localHashPath, "utf-8");
    if (savedHash === hash) return false;
  }
  fs.writeFileSync(localHashPath, hash);
  fs.writeFileSync(destPath, response.data);
  return true;
}

export function extractTxtFilesFromZip(zipPath: string, outputDir: string) {
  const zip = new AdmZip(zipPath);
  zip.getEntries().forEach((entry) => {
    if (entry.entryName.endsWith(".txt")) {
      const outputPath = path.join(outputDir, path.basename(entry.entryName));
      fs.writeFileSync(outputPath, entry.getData());
    }
  });
}

export async function parseTxtFile(filePath: string): Promise<Record<string, string>[]> {
  const records: Record<string, string>[] = [];
  let headers: string[] = [];
  let isFirstLine = true;

  const fileStream = createReadStream(filePath);
  const rl = createInterface({ input: fileStream, crlfDelay: Infinity });

  for await (const line of rl) {
    if (isFirstLine) {
      headers = line.trim().split(",").map(h => h.trim());
      isFirstLine = false;
      continue;
    }

    const values: string[] = [];
    let currentValue = "";
    let insideQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        insideQuotes = !insideQuotes;
      } else if (char === ',' && !insideQuotes) {
        values.push(currentValue.trim());
        currentValue = "";
      } else {
        currentValue += char;
      }
    }
    values.push(currentValue.trim());

    const entry: Record<string, string> = {};
    headers.forEach((key, index) => {
      let value = values[index] ?? "";
      if (value.startsWith('"') && value.endsWith('"')) {
        value = value.slice(1, -1);
      }
      entry[key] = value;
    });

    if (Object.keys(entry).length > 0) {
      records.push(entry);
    }
  }

  return records;
}

async function processBatch(model: any, batch: Record<string, string>[], tableName: TableName) {
  try {
    const processedBatch = batch.map(record => {
      switch (tableName) {
        case 'trips':
          return {
            trip_id: record.trip_id,
            trip_headsign: record.trip_headsign,
            direction_id: record.direction_id,
            shape_id: record.shape_id,
            wheelchair_accessible: record.wheelchair_accessible,
            brigade: record.brigade
          };
        case 'shapes':
          const shapeRecord: ShapeRecord = {
            shape_id: record.shape_id
          };
          
          const shapePointRecord: ShapePointRecord = {
            shape_id: record.shape_id,
            shape_pt_lat: record.shape_pt_lat,
            shape_pt_lon: record.shape_pt_lon,
            shape_pt_sequence: record.shape_pt_sequence
          };

          return { shapeRecord, shapePointRecord } as ProcessedRecord;
        default:
          return record;
      }
    }).filter((record): record is ProcessedRecord => {
      switch (tableName) {
        case 'trips':
          return 'trip_id' in record && 'shape_id' in record;
        case 'shapes':
          return 'shapeRecord' in record && 'shapePointRecord' in record;
        default:
          return true;
      }
    });

    if (processedBatch.length === 0) {
      throw new Error(`No valid records to process for ${tableName}`);
    }

    if (tableName === 'shapes') {
      const shapes = processedBatch.map(r => (r as { shapeRecord: ShapeRecord }).shapeRecord);
      await prisma.shapes.createMany({
        data: shapes,
        skipDuplicates: true,
      });

      const shapePoints = processedBatch.map(r => (r as { shapePointRecord: ShapePointRecord }).shapePointRecord);
      await prisma.shapePoint.createMany({
        data: shapePoints,
        skipDuplicates: true,
      });

      return processedBatch.length;
    } else {
      await model.createMany({
        data: processedBatch,
        skipDuplicates: true,
      });
      return processedBatch.length;
    }
  } catch (err) {
    console.error(`Error processing batch for ${tableName}:`, err);
    throw err;
  }
}

export async function importData(data: Record<string, string>[], tableName: TableName) {
  if (data.length === 0) return;

  const model = prisma[tableName as keyof PrismaClient];
  if (!model) throw new Error(`Model ${tableName} not found`);

  const batches = [];
  for (let i = 0; i < data.length; i += BATCH_SIZE) {
    batches.push(data.slice(i, i + BATCH_SIZE));
  }

  let imported = 0;
  for (let i = 0; i < batches.length; i += CONCURRENT_BATCHES) {
    const currentBatches = batches.slice(i, i + CONCURRENT_BATCHES);
    const results = await Promise.all(
      currentBatches.map(batch => processBatch(model, batch, tableName))
    );
    imported += results.reduce((a, b) => a + b, 0);
  }

  console.log(`Imported ${imported} records into ${tableName}`);
}

export async function updateData(tableNames: string[]) {
  try {
    const hashPath = path.resolve("src/assets/gtfs/hash.txt");
    const zipDestPath = path.resolve("src/assets/gtfs/data.zip");
    const outputDir = path.resolve("src/assets/gtfs/txt/");
    
    const hasChanged = await hasFileChanged(URL, hashPath, zipDestPath);
    if (!hasChanged) {
      console.log('No changes in GTFS data');
      return;
    }
    
    extractTxtFilesFromZip(zipDestPath, outputDir);
    
    const importOrder: TableName[] = ['shapes', 'trips'];
    const orderedTableNames = tableNames
      .map(name => name.toLowerCase() as TableName)
      .filter(name => importOrder.includes(name))
      .sort((a, b) => importOrder.indexOf(a) - importOrder.indexOf(b));

    for (const tableName of orderedTableNames) {
      console.log(`Processing ${tableName}...`);
      const data = await parseTxtFile(path.join(outputDir, tableName + ".txt"));
      await importData(data, tableName);
    }
  } catch (error) {
    console.error('Error in updateData:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}
