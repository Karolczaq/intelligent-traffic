import type { Simulation, StepStatus, Directions, Vehicle } from "./simulation";

// Traffic light state management
let currentGreenDirection: "northSouth" | "eastWest" | null = null;
let durationOfCurrentCycle = 0;
const DURATION_OF_CYCLE = 5;

export function step(simulation: Simulation): StepStatus {
  console.log("=== Executing step ===");

  // Increment waiting time for all vehicles
  Object.values(simulation).forEach((road) => {
    road.vehicles.forEach((vehicle) => {
      vehicle.waitingFor++;
    });
  });

  const leftVehicles: string[] = [];

  // Initialize traffic lights if this is the first step
  if (currentGreenDirection === null) {
    currentGreenDirection = evaluateBestDirection(simulation);
    durationOfCurrentCycle = 0;
    setTrafficLights(simulation, currentGreenDirection, "green");
    const oppositeDirection =
      currentGreenDirection === "northSouth" ? "eastWest" : "northSouth";
    setTrafficLights(simulation, oppositeDirection, "red");
    console.log(`Initial green light: ${currentGreenDirection}`);
  }

  //Move vehicles based on current mainLight state (green or yellow can pass)
  Object.entries(simulation).forEach(([roadName, road]) => {
    console.log(
      `Road ${roadName}: mainLight=${road.mainLight}, vehicles=${road.vehicles.length}`
    );

    if (
      (road.mainLight === "green" || road.mainLight === "yellow") &&
      road.vehicles.length > 0
    ) {
      const vehicle = road.vehicles.shift();
      if (vehicle) {
        leftVehicles.push(vehicle.vehicleId);
        console.log(
          `Vehicle ${vehicle.vehicleId} left ${roadName} (waited ${vehicle.waitingFor} steps) heading to ${vehicle.endRoad}`
        );
      }
    }
  });

  //Update cycle duration if vehicles moved
  if (leftVehicles.length > 0) {
    durationOfCurrentCycle++;
    console.log(
      `Duration of current cycle: ${durationOfCurrentCycle}/${DURATION_OF_CYCLE}`
    );
  }

  //Check for mainLight transitions
  const hasYellowLights = Object.values(simulation).some(
    (road) => road.mainLight === "yellow"
  );

  if (hasYellowLights) {
    // Complete transition: yellow -> red, redyellow -> green
    console.log("🚦 Completing mainLight transition...");
    const newDirection =
      currentGreenDirection === "northSouth" ? "eastWest" : "northSouth"; //direction swap

    setTrafficLights(simulation, currentGreenDirection, "red");
    setTrafficLights(simulation, newDirection, "green");
    currentGreenDirection = newDirection;
    durationOfCurrentCycle = 0;

    console.log(`MainLight changed to: ${currentGreenDirection}`);
  } else {
    //Evaluate if we need to change lights
    const shouldEvaluate =
      durationOfCurrentCycle >= DURATION_OF_CYCLE - 1 || // Near end of cycle
      turnsLeftToEmptyDirection(simulation, currentGreenDirection) <= 1; // Current direction almost empty

    if (shouldEvaluate && !hasYellowLights) {
      console.log("🚦 Evaluating for potential mainLight change...");
      const bestDirection = evaluateBestDirection(simulation);
      const oppositeDirection =
        currentGreenDirection === "northSouth" ? "eastWest" : "northSouth";

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
        turnsLeftToEmptyDirection(simulation, currentGreenDirection) === 0
      ) {
        // Only change if opposite direction has vehicles waiting
        if (turnsLeftToEmptyDirection(simulation, oppositeDirection) > 0) {
          console.log(
            `Preparing to change from ${currentGreenDirection} to ${oppositeDirection}`
          );

          // Start mainLight transition
          setTrafficLights(simulation, currentGreenDirection, "yellow");
          setTrafficLights(simulation, oppositeDirection, "redyellow");
        }
      }
    }
  }

  console.log(`Vehicles that left this step: [${leftVehicles.join(", ")}]`);
  console.log("=== Step completed ===\n");

  return { leftVehicles };
}

function setTrafficLights(
  simulation: Simulation,
  direction: "northSouth" | "eastWest",
  state: "green" | "red" | "yellow" | "redyellow"
): void {
  // Check if we're beginning the simulation
  const allLightsNull = Object.values(simulation).every(
    (road) => road.mainLight === null || road.mainLight === undefined
  );

  if (allLightsNull) {
    if (direction === "northSouth") {
      simulation.north.mainLight = state;
      simulation.south.mainLight = state;
      simulation.east.mainLight = "red";
      simulation.west.mainLight = "red";
    } else {
      simulation.north.mainLight = "red";
      simulation.south.mainLight = "red";
      simulation.east.mainLight = state;
      simulation.west.mainLight = state;
    }
  } else {
    switch (direction) {
      case "northSouth":
        simulation.north.mainLight = state;
        simulation.south.mainLight = state;
        break;

      case "eastWest":
        simulation.east.mainLight = state;
        simulation.west.mainLight = state;
        break;
    }
  }
}

function turnsLeftToEmptyDirection(
  simulation: Simulation,
  direction: "northSouth" | "eastWest"
): number {
  if (direction === "northSouth") {
    return Math.max(
      simulation.north.vehicles.length,
      simulation.south.vehicles.length
    );
  } else {
    return Math.max(
      simulation.east.vehicles.length,
      simulation.west.vehicles.length
    );
  }
}

export function evaluateBestDirection(
  simulation: Simulation
): "northSouth" | "eastWest" {
  const northSouthValue =
    simulation.north.vehicles.reduce(
      (sum, vehicle) => sum + Math.pow(vehicle.waitingFor, 2),
      0
    ) +
    simulation.south.vehicles.reduce(
      (sum, vehicle) => sum + Math.pow(vehicle.waitingFor, 2),
      0
    );

  const eastWestValue =
    simulation.east.vehicles.reduce(
      (sum, vehicle) => sum + Math.pow(vehicle.waitingFor, 2),
      0
    ) +
    simulation.west.vehicles.reduce(
      (sum, vehicle) => sum + Math.pow(vehicle.waitingFor, 2),
      0
    );

  return northSouthValue >= eastWestValue ? "northSouth" : "eastWest";
}

export function addVehicle(
  simulation: Simulation,
  vehicleId: string,
  startRoad: keyof Directions,
  endRoad: keyof Directions
) {
  console.log(`Adding vehicle ${vehicleId} from ${startRoad} to ${endRoad}`);
  const vehicle: Vehicle = { vehicleId, startRoad, endRoad, waitingFor: 0 };
  simulation[startRoad].vehicles.push(vehicle);
}
