import fsp from "fs/promises";
import path from "path";

export const csvToJson = async (args) => {
  const filePath = path.resolve(process.cwd(), args[1]);
  const jsonPath = path.resolve(process.cwd(), args[3]);
  
  try {
    const csvData = await fsp.readFile(filePath, "utf8");
    const lines = csvData.trim().split(/\r?\n/);
    const headers = lines.shift().split(",");
    
    const jsonArray = lines.map(line => {
      const values = line.split(",");
      const obj = {};
      headers.forEach((header, i) => obj[header] = values[i] ?? "");
      return obj;
    });
    
    await fsp.writeFile(jsonPath, JSON.stringify(jsonArray, null, 2), "utf8");
    console.log("CSV converted to JSON:", jsonPath);
  } catch {
    console.error("Operation failed");
  }
};
