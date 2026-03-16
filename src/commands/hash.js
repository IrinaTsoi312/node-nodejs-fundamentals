import fs from "fs";
import fsp from "fs/promises";
import path from "path";
import crypto from "crypto";
import { pipeline } from "stream/promises";

export const hash = async (args) => {
  const inputIndex = args.indexOf("--input");
  const algoIndex = args.indexOf("--algorithm");
  const saveFlag = args.includes("--save");

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

    const digest = hash.digest("hex");
    console.log(`${algorithm}: ${digest}`);

    if (saveFlag) {
      const outputFile = `${inputPath}.${algorithm}`;
      await fsp.writeFile(outputFile, digest, "utf8");
    }
  } catch {
    console.log("Operation failed");
  }
};
