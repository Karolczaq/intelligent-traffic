import * as fs from "fs";
import * as path from "path";
import { parseInput } from "./parser";
type Directions = {
  north: 1;
  east: 2;
  south: 3;
  west: 4;
};

type Vehicle = {
  vehicleId: string;
  startRoad: keyof Directions;
  endRoad: keyof Directions;
};

type Road = Vehicle[];

type Simulation = {
  north: Road;
  west: Road;
  east: Road;
  south: Road;
};

const simulation: Simulation = {
  north: [],
  west: [],
  east: [],
  south: [],
};

// Add vehicle function
function addVehicle(
  simulation: Simulation,
  vehicleId: string,
  startRoad: keyof Directions,
  endRoad: keyof Directions
): void {
  console.log(`Adding vehicle ${vehicleId} from ${startRoad} to ${endRoad}`);
  const vehicle: Vehicle = { vehicleId, startRoad, endRoad };
  simulation[`${startRoad}` as keyof Simulation].push(vehicle);
}

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
    const parsedCommands = parseInput(fs.readFileSync(inputPath, "utf-8"));
    console.log(parsedCommands);
  } catch (error) {
    console.error("Error during simulation", error);
    process.exit(1);
  }
}
main();
