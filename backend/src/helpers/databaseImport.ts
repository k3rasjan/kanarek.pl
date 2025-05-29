import axios from "axios";
import fs from "fs";
import crypto from "crypto";
import AdmZip from "adm-zip";
import path from "path";
import { prisma } from "@helpers/stores";
import { PrismaClient } from "@root/prisma/generated";

const URL = "https://www.ztm.poznan.pl/pl/dla-deweloperow/getGTFSFile";

export async function hasFileChanged(
  fileUrl: string,
  localHashPath: string,
  destPath: string,
): Promise<boolean> {
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
      console.log(`Extracting ${entry.entryName} to ${outputPath}`);
      fs.writeFileSync(outputPath, entry.getData());
    }
  });
}

export function parseTxtFile(filePath: string): Record<string, any>[] {
  const content = fs.readFileSync(filePath, "utf-8");
  const lines = content.trim().split("\n");
  console.log("Parsing data");

  if (lines.length < 2) return [];

  const headers = lines[0].trim().split(",");

  return lines.slice(1).map((line) => {
    const values = line.trim().split(",");
    const entry: Record<string, any> = {};

    headers.forEach((key, index) => {
      entry[key] = values[index] ?? "";
    });

    return entry;
  });
}

export async function importData(
  data: Record<string, any>[],
  tableName: keyof PrismaClient,
) {
  if (data.length === 0) {
    console.warn(`No data to import for table "${tableName.toString()}".`);
    return;
  }
  const model = prisma[tableName] as any;
  if (!model || typeof model.createMany !== "function") {
    throw new Error(
      `Model "${tableName.toString()}" not found on PrismaClient or does not support createMany.`,
    );
  }

  try {
    await model.createMany({
      data,
    });
    console.log(`Imported ${data.length} records into ${tableName.toString()}`);
  } catch (err) {
    console.error(`Failed to import data into ${tableName.toString()}:`, err);
  }
}

export async function updateData(tableNames: string[]) {
  const hashPath = path.resolve("src/assets/gtfs/hash.txt");
  const zipDestPath = path.resolve("src/assets/gtfs/data.zip");
  const outputDir = path.resolve("src/assets/gtfs/txt/");
  const hasChanged = await hasFileChanged(URL, hashPath, zipDestPath);
  if (!hasChanged) {
    console.log("Nothing has changed.");
  }
  extractTxtFilesFromZip(zipDestPath, outputDir);
  tableNames.forEach(async (tableName) => {
    const data = parseTxtFile(path.join(outputDir, tableName + ".txt"));
    await importData(data, tableName as keyof PrismaClient);
  });
}
