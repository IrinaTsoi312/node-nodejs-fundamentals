import fs from "fs/promises";
import path from "path";

export async function createSnapshot() {
  try {
    const rootPath = path.join(process.cwd(), 'src/workspace');
    const savePath = path.join(process.cwd(), 'src');
    console.log(savePath);
    

    const stats = await fs.stat(rootPath);
    if (!stats.isDirectory()) {
      throw new Error();
    }

    const entries = [];

    const walk = async (currentPath) => {
      const items = await fs.readdir(currentPath, { withFileTypes: true });

      for (const item of items) {
        const fullPath = path.join(currentPath, item.name);
        const relativePath = path.relative(rootPath, fullPath);

        if (item.isDirectory()) {
          entries.push({
            path: relativePath,
            type: "directory"
          });

          await walk(fullPath);
        }

        if (item.isFile()) {
          const fileBuffer = await fs.readFile(fullPath);
          const stat = await fs.stat(fullPath);

          entries.push({
            path: relativePath,
            type: "file",
            size: stat.size,
            content: fileBuffer.toString("base64")
          });
        }
      }
    };

    await walk(rootPath);

    const snapshot = {
      rootPath,
      entries
    };

    const snapshotPath = path.join(savePath, "snapshot.json");

    await fs.writeFile(
      snapshotPath,
      JSON.stringify(snapshot, null, 2),
      "utf8"
    );

    return snapshot;

  } catch {
    throw new Error("FS operation failed");
  }
}

await createSnapshot();
