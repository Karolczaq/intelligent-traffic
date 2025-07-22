import { step } from "./singleLaneLogic";
export type Directions = {
  north: 1;
  east: 2;
  south: 3;
  west: 4;
};

export type AddVehicleCommand = {
  type: "addVehicle";
  vehicleId: string;
  startRoad: keyof Directions;
  endRoad: keyof Directions;
};

export type StepCommand = {
  type: "step";
};

export type Command = AddVehicleCommand | StepCommand;

type Vehicle = {
  vehicleId: string;
  startRoad: keyof Directions;
  endRoad: keyof Directions;
  waitingFor: number;
};

interface Road {
  vehicles: Vehicle[];
  light: "green" | "yellow" | "red" | "redyellow";
}

export type Simulation = Record<keyof Directions, Road>;

export type StepStatus = {
  leftVehicles: string[];
};

type SimulationResult = {
  stepStatuses: StepStatus[];
};

const simulation: Simulation = {
  north: { vehicles: [], light: "red" },
  west: { vehicles: [], light: "red" },
  east: { vehicles: [], light: "red" },
  south: { vehicles: [], light: "red" },
};

function addVehicle(
  simulation: Simulation,
  vehicleId: string,
  startRoad: keyof Directions,
  endRoad: keyof Directions
): void {
  console.log(`Adding vehicle ${vehicleId} from ${startRoad} to ${endRoad}`);
  const vehicle: Vehicle = { vehicleId, startRoad, endRoad, waitingFor: 0 };
  simulation[startRoad].vehicles.push(vehicle);
}

export default function runSimulation(commands: Command[]) {
  const stepStatuses: StepStatus[] = [];
  commands.forEach((command) => {
    switch (command.type) {
      case "addVehicle":
        addVehicle(
          simulation,
          command.vehicleId,
          command.startRoad,
          command.endRoad
        );

        break;
      case "step":
        stepStatuses.push(step(simulation));
        break;
    }
  });
  console.log("Simulation state:", simulation);
  return { stepStatuses };
}
