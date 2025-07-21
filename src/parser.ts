import type { Command } from "./simulation";
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
