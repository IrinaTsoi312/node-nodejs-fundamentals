import fs from "fs";
import fsp from "fs/promises";
import path from "path";

export const count = async (args) => {
  const inputPath = path.resolve(process.cwd(), args[1]);
  
  try {
    await fsp.access(inputPath);
  } catch {
    console.log("Operation failed");
    return;
  }
  
  let lines = 0;
  let words = 0;
  let characters = 0;
  let leftover = "";

  const readable = fs.createReadStream(inputPath, { encoding: "utf8" });

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
