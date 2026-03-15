import fs from "fs";
import fsp from "fs/promises";
import path from "path";
import crypto from "crypto";
import { pipeline } from "stream/promises";

export const encrypt = async (args) => {
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
    const salt = crypto.randomBytes(16);
    const iv = crypto.randomBytes(12);
    const key = crypto.pbkdf2Sync(password, salt, 100000, 32, "sha256");

    const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);

    const readable = fs.createReadStream(inputPath);
    const writable = fs.createWriteStream(outputPath);

    writable.write(Buffer.concat([salt, iv]));

    await pipeline(readable, cipher, writable);

    const authTag = cipher.getAuthTag();
    await fsp.appendFile(outputPath, authTag);

    console.log("File encrypted successfully:", outputPath);
  } catch (err) {
    console.log("Operation failed");
  }
};
