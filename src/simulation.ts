type Directions = {
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

type Road = Vehicle[];

type Simulation = Record<keyof Directions, Road>;

type StepStatus = {
  leftVehicles: string[];
};

type SimulationResult = {
  stepStatuses: StepStatus[];
};

const simulation: Simulation = {
  north: [],
  west: [],
  east: [],
  south: [],
};
function addVehicle(
  simulation: Simulation,
  vehicleId: string,
  startRoad: keyof Directions,
  endRoad: keyof Directions
): void {
  console.log(`Adding vehicle ${vehicleId} from ${startRoad} to ${endRoad}`);
  const vehicle: Vehicle = { vehicleId, startRoad, endRoad, waitingFor: 0 };
  simulation[startRoad].push(vehicle);
}

export default function runSimulation(commands: Command[]) {
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
        break;
    }
  });
  console.log("Simulation state:", simulation);
  return simulation;
}
