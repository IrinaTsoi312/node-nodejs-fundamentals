import readline from "readline";
import process from "process";
import { logStats } from "./workers/logWorker.js";
import { ls, cd, up } from "./navigation.js";
import { csvToJson } from "./commands/csvToJson.js";
import { jsonToCsv } from "./commands/jsonToCsv.js";
import { count } from "./commands/count.js";
import { hash } from "./commands/hash.js";
import { hashCompare } from './commands/hashCompare.js';
import { encrypt } from './commands/encrypt.js';
import { decrypt } from './commands/decrypt.js';

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
      case "hash-compare":
        await hashCompare(args);
        break;
      case "encrypt":
        await encrypt(args);
        break;
      case "decrypt":
        await decrypt(args);
        break;
      case "log-stats":
        await logStats(args);
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