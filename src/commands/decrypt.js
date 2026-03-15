import fs from "fs";
import fsp from "fs/promises";
import path from "path";
import crypto from "crypto";
import { pipeline } from "stream/promises";

export const decrypt = async (args) => {
  const inputIndex = args.indexOf("--input");
  const outputIndex = args.indexOf("--output");
  const passwordIndex = args.indexOf("--password");

  if (
    inputIndex === -1 || !args[inputIndex + 1] ||
    outputIndex === -1 || !args[outputIndex + 1] ||
    passwordIndex === -1 || !args[passwordIndex + 1]
  ) {
    console.log("Operation failed");
    return;
  }

  const inputPath = path.resolve(process.cwd(), args[inputIndex + 1]);
  const outputPath = path.resolve(process.cwd(), args[outputIndex + 1]);
  const password = args[passwordIndex + 1];

  try {
    await fsp.access(inputPath);
  } catch {
    console.log("Operation failed");
    return;
  }

  try {
    const stats = await fsp.stat(inputPath);
    if (stats.size < 44) {
      throw new Error("Invalid file size");
    }

    const readable = fs.createReadStream(inputPath, { start: 0, end: 43 });
    const header = Buffer.alloc(28);
    await new Promise((resolve, reject) => {
      let offset = 0;
      readable.on("data", chunk => {
        chunk.copy(header, offset);
        offset += chunk.length;
      });
      readable.on("end", resolve);
      readable.on("error", reject);
    });

    const salt = header.slice(0, 16);
    const iv = header.slice(16, 28);

    const authTagBuffer = Buffer.alloc(16);
    const authTagFd = await fsp.open(inputPath, "r");
    await authTagFd.read(authTagBuffer, 0, 16, stats.size - 16);
    await authTagFd.close();

    const key = crypto.pbkdf2Sync(password, salt, 100000, 32, "sha256");

    const cipherReadable = fs.createReadStream(inputPath, { start: 28, end: stats.size - 17 });
    const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
    decipher.setAuthTag(authTagBuffer);

    const writable = fs.createWriteStream(outputPath);

    await pipeline(cipherReadable, decipher, writable);

    console.log("File decrypted successfully:", outputPath);
  } catch {
    console.log("Operation failed");
  }
};
