import readline from "readline";
import process from "process";
import { up, cd, ls, csvToJson, jsonToCsv, count, hash } from "./task-2_commands.js";

console.log("Welcome to Data Processing CLI!");
console.log("Current working directory:", process.cwd());

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: "> "
});

rl.prompt();

rl.on("line", async (line) => {
  const input = line.trim();
  if (!input) {
    rl.prompt();
    return;
  }

  const [command, ...args] = input.split(" ");

  try {
    switch (command) {
      case ".exit":
        rl.close();
        break;
      case "up":
        up();
        break;
      case "cd":
        await cd(args[0]);
        break;
      case "ls":
        await ls();
        break;
      case "csv-to-json":
        await csvToJson(args);
        break;
      case "json-to-csv":
        await jsonToCsv(args);
        break;
      case "count":
        await count(args);
        break;
      case "hash":
        await hash(args);
        break;
      default:
        console.error(`Unknown command: ${command}`);
        break;
    }

  } catch (err) {
    console.error("Error:", err.message || err);
  }

  rl.prompt();
});

rl.on("close", () => {
  process.exit(0);
});

rl.on("SIGINT", () => {
  console.log("\nThank you for using Data Processing CLI!");
  rl.close();
});