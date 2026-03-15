import fs from "fs/promises";
import path from "path";

export async function restoreSnapshot() {
  const cwd = process.cwd();
  const snapshotPath = path.join(cwd, "snapshot.json");
  const restoreDir = path.join(cwd, "workspace_restored");

  try {
    await fs.access(snapshotPath);
  } catch {
    throw new Error("FS operation failed");
  }

  try {
    await fs.access(restoreDir);
    throw new Error("FS operation failed");
  } catch (err) {
    if (err.code !== "ENOENT") throw err;
  }

  // Read and parse snapshot.json
  let snapshotData;
  try {
    snapshotData = await fs.readFile(snapshotPath, "utf8");
  } catch {
    throw new Error("FS operation failed");
  }

  let snapshot;
  try {
    snapshot = JSON.parse(snapshotData);
  } catch {
    throw new Error("FS operation failed");
  }

  const { entries } = snapshot;

  entries.sort((a, b) => {
    if (a.type === "directory" && b.type === "file") return -1;
    if (a.type === "file" && b.type === "directory") return 1;
    return 0;
  });

  for (const entry of entries) {
    const targetPath = path.join(restoreDir, entry.path);

    if (entry.type === "directory") {
      try {
        await fs.mkdir(targetPath, { recursive: true });
      } catch {
        throw new Error("FS operation failed");
      }
    } else if (entry.type === "file") {
      try {
        await fs.mkdir(path.dirname(targetPath), { recursive: true });

        const buffer = Buffer.from(entry.content || "", "base64");
        await fs.writeFile(targetPath, buffer);
      } catch {
        throw new Error("FS operation failed");
      }
    }
  }

  console.log("Restore completed successfully.");
}

await restoreSnapshot();
