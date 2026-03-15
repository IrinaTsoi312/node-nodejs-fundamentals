import fs from "fs/promises";
import path from "path";

const findByExt = async () => {
  let ext = ".txt";
  const args = process.argv.slice(2);
  const extIndex = args.indexOf("--ext");
  if (extIndex !== -1 && args[extIndex + 1]) {
    ext = args[extIndex + 1].startsWith(".") ? args[extIndex + 1] : "." + args[extIndex + 1];
  }

  const rootDir = path.join(process.cwd(), 'src/workspace');

  try {
    const stats = await fs.stat(rootDir);
    if (!stats.isDirectory()) throw new Error();
  } catch {
    throw new Error("FS operation failed");
  }

  const recursiveFind = async (dir) => {
    let results = [];
    const items = await fs.readdir(dir, { withFileTypes: true });

    for (const item of items) {
      const fullPath = path.join(dir, item.name);
      const relativePath = path.relative(rootDir, fullPath);

      if (item.isDirectory()) {
        const subResults = await recursiveFind(fullPath);
        results = results.concat(subResults);
      } else if (item.isFile() && path.extname(item.name).toLowerCase() === ext.toLowerCase()) {        
        results.push(relativePath);
      }
    }
    return results;
  };

  try {
    const files = await recursiveFind(rootDir);
    files.sort();
    files.forEach(f => console.log(f));
  } catch {
    throw new Error("FS operation failed");
  }
};

await findByExt();
