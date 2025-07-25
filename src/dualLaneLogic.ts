import {
  type Simulation,
  Directions,
  directions,
  Vehicle,
  StepStatus,
} from "./simulation";

// Traffic light state management
let currentGreenDirection:
  | "northSouthStraightRight"
  | "eastWestStraightRight"
  | "northSouthLeftTurn"
  | "eastWestLeftTurn"
  | null = null;
let durationOfCurrentCycle = 0;
const DURATION_OF_CYCLE = 5;

export function step(simulation: Simulation): StepStatus {
  console.log("=== Executing dual lane step ===");

  // Increment waiting time for all vehicles in both lanes
  Object.values(simulation).forEach((road) => {
    road.leftLane.forEach((vehicle) => {
      vehicle.waitingFor++;
    });
    road.rightLane.forEach((vehicle) => {
      vehicle.waitingFor++;
    });
  });

  const leftVehicles: string[] = [];

  // Initialize traffic lights if this is the first step
  if (currentGreenDirection === null) {
    currentGreenDirection = evaluateBestDirectionDualLane(simulation);
    durationOfCurrentCycle = 0;
    resetTrafficLights(simulation);
    setTrafficLightsDualLane(simulation, currentGreenDirection, "green");
    console.log(`Initial green light: ${currentGreenDirection}`);
  }

  console.log(
    `[Road,LeftLight,MainLight,GreenArrow]
N(${simulation.north.leftTurnLight}/${simulation.north.mainLight}${
      simulation.north.rightArrow ? "/➡️)" : ""
    }) E(${simulation.east.leftTurnLight}/${simulation.east.mainLight}${
      simulation.east.rightArrow ? "/➡️)" : ""
    }) S(${simulation.south.leftTurnLight}/${simulation.south.mainLight}${
      simulation.south.rightArrow ? "/➡️)" : ""
    }) W(${simulation.west.leftTurnLight}/${simulation.west.mainLight}${
      simulation.west.rightArrow ? "/➡️)" : ""
    })`
  );

  // Move vehicles based on current light state
  Object.entries(simulation).forEach(([roadName, road]) => {
    const roadKey = roadName as keyof typeof simulation;

    // Check left lane vehicles (left turns)
    if (road.leftTurnLight === "green" || road.leftTurnLight === "yellow") {
      if (road.leftLane.length > 0) {
        const vehicle = road.leftLane.shift()!;
        leftVehicles.push(vehicle.vehicleId);
        console.log(
          `Vehicle ${vehicle.vehicleId} left ${roadName} LEFT LANE (waited ${vehicle.waitingFor} steps)`
        );
      }
    }

    // Check right lane vehicles (straight/right turns)
    if (road.mainLight === "green" || road.mainLight === "yellow") {
      if (road.rightLane.length > 0) {
        const vehicle = road.rightLane.shift()!;
        leftVehicles.push(vehicle.vehicleId);
        console.log(
          `Vehicle ${vehicle.vehicleId} left ${roadName} RIGHT LANE (waited ${vehicle.waitingFor} steps)`
        );
      }
    }

    // Check right arrow for right turns
    if (road.rightArrow && road.rightLane.length > 0) {
      const firstVehicle = road.rightLane[0];
      if (firstVehicle.turnValue === 3) {
        const vehicle = road.rightLane.shift()!;
        leftVehicles.push(vehicle.vehicleId);
        console.log(
          `Vehicle ${vehicle.vehicleId} left ${roadName} RIGHT LANE via RIGHT ARROW (waited ${vehicle.waitingFor} steps)`
        );
      }
    }
  });

  // Update cycle duration if vehicles moved
  if (leftVehicles.length > 0) {
    durationOfCurrentCycle++;
    console.log(
      `Duration of current cycle: ${durationOfCurrentCycle}/${DURATION_OF_CYCLE}`
    );
  }

  // Check for light transitions
  const hasYellowLights = Object.values(simulation).some(
    (road) => road.mainLight === "yellow" || road.leftTurnLight === "yellow"
  );

  if (hasYellowLights) {
    // Complete transition: yellow -> red, then evaluate new direction
    console.log("🚦 Completing light transition...");
    const newDirection = evaluateBestDirectionDualLane(simulation);
    resetTrafficLights(simulation);
    setTrafficLightsDualLane(simulation, newDirection, "green");
    currentGreenDirection = newDirection;
    durationOfCurrentCycle = 0;
    console.log(`Light changed to: ${currentGreenDirection}`);
  } else {
    // Evaluate if we need to change lights
    const shouldEvaluate =
      durationOfCurrentCycle >= DURATION_OF_CYCLE - 1 ||
      turnsLeftToEmptyPhase(simulation, currentGreenDirection) <= 1;

    if (shouldEvaluate && !hasYellowLights) {
      console.log("🚦 Evaluating for potential light change...");
      const bestDirection = evaluateBestDirectionDualLane(simulation);

      if (
        bestDirection === currentGreenDirection &&
        durationOfCurrentCycle >= DURATION_OF_CYCLE - 1
      ) {
        console.log(
          `Extending ${currentGreenDirection} cycle by ${DURATION_OF_CYCLE} more turns`
        );
        durationOfCurrentCycle = 0;
      } else if (
        bestDirection !== currentGreenDirection ||
        turnsLeftToEmptyPhase(simulation, currentGreenDirection) === 0
      ) {
        if (turnsLeftToEmptyPhase(simulation, bestDirection) > 0) {
          console.log(
            `Preparing to change from ${currentGreenDirection} to ${bestDirection}`
          );
          // Start light transition to yellow
          resetTrafficLights(simulation);
          setTrafficLightsDualLane(simulation, currentGreenDirection, "yellow");
          setTrafficLightsDualLane(simulation, bestDirection, "redyellow");
        }
      }
    }
  }

  console.log(`Vehicles that left this step: [${leftVehicles.join(", ")}]`);
  console.log("=== Dual lane step completed ===\n");
  return { leftVehicles };
}

export function addVehicle(
  simulation: Simulation,
  vehicleId: string,
  startRoad: keyof Directions,
  endRoad: keyof Directions
) {
  const directionDiff = (directions[endRoad] - directions[startRoad] + 4) % 4;
  //Explained in readme

  const vehicle: Vehicle = {
    vehicleId,
    startRoad,
    endRoad,
    waitingFor: 0,
    turnValue: directionDiff,
  };
  if (directionDiff === 1 || directionDiff === 0) {
    simulation[startRoad].leftLane.push(vehicle);
    console.log(
      `Adding vehicle ${vehicleId} from ${startRoad} to ${endRoad} (LEFT LANE - turn type: ${
        directionDiff === 0 ? "U-turn" : "left turn"
      })`
    );
  } else {
    simulation[startRoad].rightLane.push(vehicle);
    console.log(
      `Adding vehicle ${vehicleId} from ${startRoad} to ${endRoad} (RIGHT LANE - turn type: ${
        directionDiff === 2 ? "straight" : "right turn"
      })`
    );
  }
}

export function evaluateBestDirectionDualLane(
  simulation: Simulation
):
  | "northSouthStraightRight"
  | "eastWestStraightRight"
  | "northSouthLeftTurn"
  | "eastWestLeftTurn" {
  const northSouthStraightRightValue =
    simulation.north.rightLane.reduce(
      (sum, vehicle) => sum + Math.pow(vehicle.waitingFor, 2),
      0
    ) +
    simulation.south.rightLane.reduce(
      (sum, vehicle) => sum + Math.pow(vehicle.waitingFor, 2),
      0
    );

  const eastWestStraightRightValue =
    simulation.east.rightLane.reduce(
      (sum, vehicle) => sum + Math.pow(vehicle.waitingFor, 2),
      0
    ) +
    simulation.west.rightLane.reduce(
      (sum, vehicle) => sum + Math.pow(vehicle.waitingFor, 2),
      0
    );

  const northSouthLeftTurnValue =
    simulation.north.leftLane.reduce(
      (sum, vehicle) => sum + Math.pow(vehicle.waitingFor, 2),
      0
    ) +
    simulation.south.leftLane.reduce(
      (sum, vehicle) => sum + Math.pow(vehicle.waitingFor, 2),
      0
    );

  const eastWestLeftTurnValue =
    simulation.east.leftLane.reduce(
      (sum, vehicle) => sum + Math.pow(vehicle.waitingFor, 2),
      0
    ) +
    simulation.west.leftLane.reduce(
      (sum, vehicle) => sum + Math.pow(vehicle.waitingFor, 2),
      0
    );

  console.log(
    `Dual lane values: NS-Straight/Right: ${northSouthStraightRightValue}, EW-Straight/Right: ${eastWestStraightRightValue}, NS-Left/U: ${northSouthLeftTurnValue}, EW-Left/U: ${eastWestLeftTurnValue}`
  );

  const values = {
    northSouthStraightRight: northSouthStraightRightValue,
    eastWestStraightRight: eastWestStraightRightValue,
    northSouthLeftTurn: northSouthLeftTurnValue,
    eastWestLeftTurn: eastWestLeftTurnValue,
  };

  let bestDirection = "northSouthStraightRight" as keyof typeof values;
  let maxValue = values.northSouthStraightRight;

  for (const [direction, value] of Object.entries(values)) {
    if (value > maxValue) {
      maxValue = value;
      bestDirection = direction as keyof typeof values;
    }
  }

  return bestDirection;
}

function resetTrafficLights(simulation: Simulation) {
  Object.values(simulation).forEach((road) => {
    road.mainLight = "red";
    road.leftTurnLight = "red";
    road.rightArrow = false;
  });
}

export function setTrafficLightsDualLane(
  simulation: Simulation,
  activeCase:
    | "northSouthStraightRight"
    | "eastWestStraightRight"
    | "northSouthLeftTurn"
    | "eastWestLeftTurn",
  state: "green" | "red" | "yellow" | "redyellow"
): void {
  switch (activeCase) {
    case "northSouthStraightRight":
      // North and South roads: right lanes (straight/right turns) get green
      simulation.north.mainLight = state;
      simulation.south.mainLight = state;
      break;

    case "eastWestStraightRight":
      // East and West roads: right lanes (straight/right turns) get green
      simulation.east.mainLight = state;
      simulation.west.mainLight = state;
      break;

    case "northSouthLeftTurn":
      // North and South roads: left lanes (left turns/U-turns) get green
      simulation.north.leftTurnLight = state;
      simulation.south.leftTurnLight = state;
      if (state != "red") {
        simulation.east.rightArrow = true;
        simulation.west.rightArrow = true;
      }

      break;

    case "eastWestLeftTurn":
      // East and West roads: left lanes (left turns/U-turns) get green
      simulation.east.leftTurnLight = state;
      simulation.west.leftTurnLight = state;
      if (state != "red") {
        simulation.north.rightArrow = true;
        simulation.south.rightArrow = true;
      }
      break;
  }

  console.log(`🚦 Set traffic lights for ${activeCase} to ${state}`);
}

const ACTIVE_LANES_BY_PHASE = {
  northSouthStraightRight: ["north.rightLane", "south.rightLane"] as const,
  eastWestStraightRight: ["east.rightLane", "west.rightLane"] as const,
  northSouthLeftTurn: ["north.leftLane", "south.leftLane"] as const,
  eastWestLeftTurn: ["east.leftLane", "west.leftLane"] as const,
} as const;

function getActiveLanesForPhase(
  simulation: Simulation,
  activePhase:
    | "northSouthStraightRight"
    | "eastWestStraightRight"
    | "northSouthLeftTurn"
    | "eastWestLeftTurn"
): Vehicle[][] {
  const lanePaths = ACTIVE_LANES_BY_PHASE[activePhase];
  return lanePaths.map((path) => {
    const [road, lane] = path.split(".") as [
      keyof Simulation,
      "leftLane" | "rightLane"
    ];
    return simulation[road][lane];
  });
}

function turnsLeftToEmptyPhase(
  simulation: Simulation,
  activePhase:
    | "northSouthStraightRight"
    | "eastWestStraightRight"
    | "northSouthLeftTurn"
    | "eastWestLeftTurn"
): number {
  const activeLanes = getActiveLanesForPhase(simulation, activePhase);
  return Math.max(...activeLanes.map((lane) => lane.length));
}
