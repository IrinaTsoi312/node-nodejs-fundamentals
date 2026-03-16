import fs from "fs";
import fsp from "fs/promises";
import path from "path";
import crypto from "crypto";
import { pipeline } from "stream/promises";

export const hashCompare = async (args) => {
  const inputIndex = args.indexOf("--input");
  const hashIndex = args.indexOf("--hash");
  const algoIndex = args.indexOf("--algorithm");

  if (inputIndex === -1 || !args[inputIndex + 1] ||
      hashIndex === -1 || !args[hashIndex + 1]) {
    console.log("Operation failed");
    return;
  }

  const inputPath = path.resolve(process.cwd(), args[inputIndex + 1]);
  const hashFilePath = path.resolve(process.cwd(), args[hashIndex + 1]);

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
    await fsp.access(hashFilePath);
  } catch {
    console.log("Operation failed");
    return;
  }

  const hash = crypto.createHash(algorithm);
  const readable = fs.createReadStream(inputPath);

  try {
    await pipeline(
      readable,
      async function* (source) {
        for await (const chunk of source) {
          hash.update(chunk);
        }
      }
    );

    const computedHash = hash.digest("hex");

    const expectedHashRaw = await fsp.readFile(hashFilePath, "utf8");
    const expectedHash = expectedHashRaw.trim().toLowerCase();

    if (computedHash.toLowerCase() === expectedHash) {
      console.log("OK");
    } else {
      console.log("MISMATCH");
    }
  } catch {
    console.log("Operation failed");
  }
};
