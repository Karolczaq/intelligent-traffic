import * as fs from "fs";
import { parseInput, saveStepStatuses } from "./parser";
import runSimulation from "./simulation";

function main() {
  const args = process.argv.slice(2);
  const modeArg = args[2] ?? "singleLane";
  if (args.length < 2 || (modeArg !== "singleLane" && modeArg !== "dualLane")) {
    console.error(
      "Usage: npm run simulation <input.json> <output.json> [mode]"
    );
    console.error("Modes: singleLane (default) | dualLane");
    process.exit(1);
  }
  const inputPath = args[0];
  const outputPath = args[1];

  console.log(`Running in ${modeArg} mode.`);

  if (!fs.existsSync(inputPath)) {
    console.error(`Input file not found: ${inputPath}`);
    process.exit(1);
  }

  try {
    const parsedInput = parseInput(fs.readFileSync(inputPath, "utf-8"));
    const simulationResult = runSimulation(parsedInput.commands, modeArg);
    saveStepStatuses(simulationResult.stepStatuses, outputPath);
    console.log(
      `Simulation completed successfully! Results saved to ${outputPath}`
    );
  } catch (error) {
    console.error("Error during simulation", error);
    process.exit(1);
  }
}
main();
