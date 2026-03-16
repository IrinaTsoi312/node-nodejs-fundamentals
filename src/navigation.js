import path from "path";
import process from "process";
import fs from "fs/promises";
import fsp from "fs/promises";

export const up = () => {
  const currentDir = process.cwd();
  const parentDir = path.dirname(currentDir);

  if (currentDir !== parentDir) {
    process.chdir(parentDir);
  }
  console.log("You are currently in this directooty:", process.cwd());
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
    console.log("You are currently in this directooty:", process.cwd());
  } catch {
    console.log("Operation failed");
  }
};

export const ls = async () => {
  try {
    const cwd = process.cwd();
    const items = await fsp.readdir(cwd, { withFileTypes: true });

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
