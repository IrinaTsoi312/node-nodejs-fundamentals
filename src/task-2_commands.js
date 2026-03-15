import path from "path";
import process from "process";
import fs from "fs/promises";
import fsp from "fs/promises";
import fs2 from "fs";
import crypto from "crypto";

export const up = () => {
  const currentDir = process.cwd();
  const parentDir = path.dirname(currentDir);

  if (currentDir !== parentDir) {
    process.chdir(parentDir);
  }
};

export const cd = async (pathDir) => {
  try {
    const target = path.resolve(process.cwd(), pathDir);
    const stats = await fs.stat(target);

    if (!stats.isDirectory()) {
      console.log("Operation failed");
      return;
    }

    process.chdir(target);
  } catch {
    console.log("Operation failed");
  }
};

export const ls = async () => {
  try {
    const cwd = process.cwd();
    const items = await fs.readdir(cwd, { withFileTypes: true });

    const folders = [];
    const files = [];

    for (const item of items) {
      if (item.isDirectory()) {
        folders.push(`${item.name}    [folder]`);
      } else if (item.isFile()) {
        files.push(`${item.name}    [file]`);
      }
    }

    folders.sort();
    files.sort();

    const allEntries = [...folders, ...files];
    allEntries.forEach(entry => console.log(entry));
  } catch {
    console.log("FS operation failed");
  }
};

export const csvToJson = async (args) => {
  const filePath = path.resolve(process.cwd(), args[1]);
  const jsonPath = path.resolve(process.cwd(), args[3]);
  
  try {
    const csvData = await fs.readFile(filePath, "utf8");
    const lines = csvData.trim().split(/\r?\n/);
    const headers = lines.shift().split(",");
    
    const jsonArray = lines.map(line => {
      const values = line.split(",");
      const obj = {};
      headers.forEach((header, i) => obj[header] = values[i] ?? "");
      return obj;
    });
    
    await fs.writeFile(jsonPath, JSON.stringify(jsonArray, null, 2), "utf8");
    console.log("CSV converted to JSON:", jsonPath);
  } catch {
    console.error("Operation failed");
  }
};

export const jsonToCsv = async (args) => {
  const jsonPath = path.resolve(process.cwd(), args[1]);
  const csvPath = path.resolve(process.cwd(), args[3]);

  try {
    const jsonData = await fs.readFile(jsonPath, "utf8");
    const jsonArray = JSON.parse(jsonData);
    

    if (!Array.isArray(jsonArray) || jsonArray.length === 0) {
      console.error("Operation failed: JSON must be a non-empty array");
      return;
    }

    const headers = Object.keys(jsonArray[0]);
    const lines = [headers.join(",")];

    jsonArray.forEach(obj => {
      const row = headers.map(h => obj[h] ?? "").join(",");
      lines.push(row);
    });

    const csvData = lines.join("\n");
    await fs.writeFile(csvPath, csvData, "utf8");

    console.log("JSON converted to CSV:", csvPath);
  } catch (err) {
    console.error("Operation failed:", err.message);
  }
};

export const count = async (args) => {
  const inputPath = path.resolve(process.cwd(), args[1]);
  
  try {
    await fs.access(inputPath);
  } catch {
    console.log("Operation failed");
    return;
  }
  
  let lines = 0;
  let words = 0;
  let characters = 0;
  let leftover = "";

  const readable = fs2.createReadStream(inputPath, { encoding: "utf8" });

  readable.on("data", chunk => {
    characters += chunk.length;

    const data = leftover + chunk;
    const parts = data.split(/\r?\n/);
    leftover = parts.pop();

    lines += parts.length;
    for (const line of parts) {
      words += line.trim().split(/\s+/).filter(Boolean).length;
    }
  });

  readable.on("end", () => {
    if (leftover) {
      lines += 1;
      words += leftover.trim().split(/\s+/).filter(Boolean).length;
    }
    console.log(`Lines: ${lines}`);
    console.log(`Words: ${words}`);
    console.log(`Characters: ${characters}`);
  });

  readable.on("error", () => {
    console.log("Operation failed");
  });
};

export const hash = async (args) => {
  const inputIndex = args.indexOf("--input");
  const algoIndex = args.indexOf("--algorithm");
  const saveFlag = args.indexOf("--save");
  
  if (inputIndex === -1 || !args[inputIndex + 1]) {
    console.log("Operation failed");
    return;
  }
  
  const inputPath = path.resolve(process.cwd(), args[inputIndex + 1]);
  
  let algorithm = "sha256";
  if (algoIndex !== -1 && args[algoIndex + 1]) {
    algorithm = args[algoIndex + 1];
  }
  
  const supported = ["sha256", "md5", "sha512"];
  if (!supported.includes(algorithm)) {
    console.log("Operation failed");
    return;
  }
  
  try {
    await fsp.access(inputPath);
    console.log(hash);
  } catch {
    console.log("Operation failed");
    return;
  }
  
  const hash = crypto.createHash(algorithm);
  const stream = fs.createReadStream(inputPath);

  stream.on("data", (chunk) => {
    hash.update(chunk);
  });

  stream.on("end", async () => {
    const digest = hash.digest("hex");
    const output = `${algorithm}: ${digest}`;
    console.log(output);

    if (saveFlag) {
      const outputFile = `${inputPath}.${algorithm}`;
      try {
        await fsp.writeFile(outputFile, digest, "utf8");
      } catch {
        console.log("Operation failed");
      }
    }
  });

  stream.on("error", () => {
    console.log("Operation failed");
  });
};

