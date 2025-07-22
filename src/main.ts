import * as fs from "fs";
import * as path from "path";
import { parseInput, saveStepStatuses } from "./parser";
import runSimulation from "./simulation";

function main() {
  const args = process.argv.slice(2);
  if (args.length < 2) {
    console.error("Usage: ts-node main.ts <input.json> <output.json>");
    process.exit(1);
  }
  const inputPath = args[0];
  const outputPath = args[1];
  if (!fs.existsSync(inputPath)) {
    console.error(`Input file not found: ${inputPath}`);
    process.exit(1);
  }

  try {
    const parsedInput = parseInput(fs.readFileSync(inputPath, "utf-8"));
    const simulationResult = runSimulation(parsedInput.commands);
    saveStepStatuses(simulationResult.stepStatuses, outputPath);
  } catch (error) {
    console.error("Error during simulation", error);
    process.exit(1);
  }
}
main();
