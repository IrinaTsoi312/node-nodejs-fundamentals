import fs from "fs/promises";
import path from "path";

const merge = async () => {
  const cwd = process.cwd();
  const partsDir = path.join(cwd, "src/workspace/parts");
  console.log("partsDir:", partsDir);
  
  const mergedFilePath = path.join(cwd, "workspace", "merged.txt");
  
  const args = process.argv.slice(2);
  const filesIndex = args.indexOf("--files");
  let filesToMerge = [];
  
  if (filesIndex !== -1 && args[filesIndex + 1]) {
    filesToMerge = args[filesIndex + 1].split(",").map(f => f.trim());
  }
  
  try {
    const partsStats = await fs.stat(partsDir);
    console.log('partsStats');
    if (!partsStats.isDirectory()) throw new Error();
    
    if (filesToMerge.length === 0) {
      const items = await fs.readdir(partsDir, { withFileTypes: true });
      filesToMerge = items
        .filter(i => i.isFile() && i.name.endsWith(".txt"))
        .map(i => i.name)
        .sort();

      if (filesToMerge.length === 0) throw new Error();
    } else {
      for (const f of filesToMerge) {
        const fPath = path.join(partsDir, f);
        const stats = await fs.stat(fPath).catch(() => null);
        if (!stats || !stats.isFile()) throw new Error();
      }
    }

    let mergedContent = "";
    for (const f of filesToMerge) {
      const fPath = path.join(partsDir, f);
      const content = await fs.readFile(fPath, "utf8");
      mergedContent += content;
    }

    await fs.writeFile(mergedFilePath, mergedContent, "utf8");
    console.log(`Merged ${filesToMerge.length} files into merged.txt`);
  } catch {
    throw new Error("FS operation failed");
  }
};

await merge();
