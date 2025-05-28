import axios from "axios";
import fs from "fs";
import crypto from "crypto";
import AdmZip from "adm-zip";
import path from "path";

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
      fs.writeFileSync(outputPath, entry.getData());
    }
  });
}

export function parseTxtFile(filePath: string): string[][] {
  const content = fs.readFileSync(filePath, "utf-8");
  return content.split("\n").map((line) => line.trim().split(","));
}
