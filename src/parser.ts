import type { Command } from "./simulation";
import * as fs from "fs";
import * as path from "path";
export function parseInput(jsonContent: string) {
  try {
    const parsed = JSON.parse(jsonContent);

    if (!parsed.commands || !Array.isArray(parsed.commands)) {
      throw new Error("Invalid JSON structure: missing commands array");
    }
    const validCommands = parsed.commands.filter((command: Command) => {
      if (command.type === "addVehicle") {
        if (!command.vehicleId || !command.startRoad || !command.endRoad) {
          console.warn(
            `Removing invalid addVehicle command: missing required fields`
          );
          return false;
        }
      }
      if (command.type === "step") {
        return true;
      }
      return true;
    });

    return {
      commands: validCommands,
    };
  } catch (error) {
    throw new Error(`Invalid JSON: ${error}`);
  }
}

export function saveStepStatuses(
  stepStatuses: { leftVehicles: string[] }[],
  outputPath: string
): void {
  const result = {
    stepStatuses,
  };

  try {
    fs.writeFileSync(outputPath, JSON.stringify(result, null, 2));
    console.log(`Step statuses saved to ${outputPath}`);
  } catch (error) {
    throw new Error(`Failed to save step statuses: ${error}`);
  }
}
