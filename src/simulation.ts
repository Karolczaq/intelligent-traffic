import {
  step as singleLaneStep,
  addVehicle as addVehicleSingleLane,
} from "./singleLaneLogic";
import {
  addVehicle as addVehicleDualLane,
  step as dualLaneStep,
} from "./dualLaneLogic";

export const directions = {
  north: 0,
  east: 1,
  south: 2,
  west: 3,
} as const;
export type Directions = typeof directions;

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

export type Vehicle = {
  vehicleId: string;
  startRoad: keyof Directions;
  endRoad: keyof Directions;
  waitingFor: number;
  turnValue?: number;
};

interface Road {
  vehicles: Vehicle[]; // For single lane mode
  leftLane: Vehicle[]; // For left turns
  rightLane: Vehicle[]; // For straight and right turns
  mainLight: "green" | "yellow" | "red" | "redyellow";
  leftTurnLight?: "green" | "yellow" | "red" | "redyellow"; // For dual lane left turns
  rightArrow?: boolean;
}

export type Simulation = Record<keyof Directions, Road>;

export type StepStatus = {
  leftVehicles: string[];
};

const simulation: Simulation = {
  north: { vehicles: [], leftLane: [], rightLane: [], mainLight: "red" },
  west: { vehicles: [], leftLane: [], rightLane: [], mainLight: "red" },
  east: { vehicles: [], leftLane: [], rightLane: [], mainLight: "red" },
  south: { vehicles: [], leftLane: [], rightLane: [], mainLight: "red" },
};

function addVehicle(
  simulation: Simulation,
  vehicleId: string,
  startRoad: keyof Directions,
  endRoad: keyof Directions,
  mode: "singleLane" | "dualLane" = "singleLane"
): void {
  if (mode === "dualLane") {
    addVehicleDualLane(simulation, vehicleId, startRoad, endRoad);
  } else {
    addVehicleSingleLane(simulation, vehicleId, startRoad, endRoad);
  }
}

export default function runSimulation(
  commands: Command[],
  mode: "singleLane" | "dualLane" = "singleLane"
) {
  const stepStatuses: StepStatus[] = [];
  commands.forEach((command) => {
    switch (command.type) {
      case "addVehicle":
        addVehicle(
          simulation,
          command.vehicleId,
          command.startRoad,
          command.endRoad,
          mode
        );
        break;
      case "step":
        if (mode === "dualLane") {
          stepStatuses.push(dualLaneStep(simulation));
        } else {
          stepStatuses.push(singleLaneStep(simulation));
        }
        break;
    }
  });
  return { stepStatuses };
}
