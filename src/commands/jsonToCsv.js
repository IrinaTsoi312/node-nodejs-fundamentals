import path from "path";

export const jsonToCsv = async (args) => {
  const jsonPath = path.resolve(process.cwd(), args[1]);
  const csvPath = path.resolve(process.cwd(), args[3]);

  try {
    const jsonData = await fs.readFile(jsonPath, "utf8");
    const jsonArray = JSON.parse(jsonData);
    

    if (!Array.isArray(jsonArray) || jsonArray.length === 0) {
      console.error("Operation failed: JSON must be a non-empty array");
      return;
    }

    const headers = Object.keys(jsonArray[0]);
    const lines = [headers.join(",")];

    jsonArray.forEach(obj => {
      const row = headers.map(h => obj[h] ?? "").join(",");
      lines.push(row);
    });

    const csvData = lines.join("\n");
    await fs.writeFile(csvPath, csvData, "utf8");

    console.log("JSON converted to CSV:", csvPath);
  } catch (err) {
    console.error("Operation failed:", err.message);
  }
};
