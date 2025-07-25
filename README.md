# 🚦 Intelligent Traffic Simulation

A TypeScript-based traffic intersection simulation that models realistic traffic light behavior at intersections.

## 🇵🇱 Polish Traffic Light System

This simulation follows the Polish traffic light sequence:

- 🔴 **Red** → 🟠 **Red+Yellow** → 🟢 **Green** → 🟡 **Yellow** → 🔴 **Red**

Unlike many other countries, Poland uses a **Red+Yellow** phase to prepare drivers for the upcoming green light, giving them time to prepare.

This simulation also assumes that during the yellow light phase, one last vehicle can still cross the intersection before the light turns red.

> [!IMPORTANT] > **🚨 Simulation Completion Notice**
>
> Due to the gradual nature of the traffic light system, some scenarios may require additional simulation steps beyond the initial command sequence to allow all vehicles to completely clear the intersection. This is normal behavior that reflects the realistic Polish traffic light transitions (Red → Red+Yellow → Green → Yellow → Red) where vehicles need time to fully exit intersections before new traffic can proceed.

## 📋 Table of Contents

- [Traffic Logic](#traffic-logic)
- [1: Single Lane Intersections](#1-single-lane-intersections)
- [Installation](#installation)
- [Usage](#usage)
- [Input Format](#input-format)

## 🧮 Traffic Logic

### Priority Calculation

The system evaluates directions using:

```
Combination Value = Σ(waitingTime²) for all vehicles in combination
```

This prevents situations where a single vehicle from a side road gets stuck waiting for an extremely long time while a busy main road has continuous traffic flow.

## 1: Single Lane Intersections

### 🛣️ Conflict Intersections (Skrzyżowania Kolizyjne)

This simulation models **conflict intersections** where vehicle paths cross each other. The most common scenario is when:

- 🚗 **Vehicle A** drives straight through the intersection
- 🚙 **Vehicle B** from the opposite direction turns left, crossing Vehicle A's path

### 👥 Gentleman's Agreement Protocol on Single Lane Intersections

In driving culture, drivers follow an unwritten **gentleman's agreement** at conflict intersections:

> **"No vehicle enters the intersection until the previous vehicle from their lane has completely cleared the intersection."**

This prevents gridlock and ensures smooth traffic flow even when paths cross. The simulation implements this by:

1. **Queue-based movement**: Only the first vehicle in each lane can move
2. **Complete clearance**: Vehicles must fully exit before the next can enter
3. **Conflict resolution**: Opposing straight and left-turn movements are coordinated

### 🚦 Single Lane Logic

Each road has exactly **one lane going to the intersection** that can accommodate vehicles going:

- ⬆️ **Straight** through the intersection
- ↩️ **Left** turn (crossing oncoming traffic)
- ↪️ **Right** turn (non-conflicting)
- 🔄 **U-Turn** (follows the same priority rules as left turns)

### 🔢 Priority Calculation for Single Lane Intersections

There are exactly **two possible outcomes** for Single Lane Intersections:

- 🟢 **North-South path is active**
- 🟢 **East-West path is active**

The combination value doesn't depend on where the cars are going, but **from which road they originate**.

#### North-South Combination Value:

```
North-South Value = Σ(waitingTime²) for all vehicles on north road +
                    Σ(waitingTime²) for all vehicles on south road
```

#### East-West Combination Value:

```
East-West Value = Σ(waitingTime²) for all vehicles on east road +
                  Σ(waitingTime²) for all vehicles on west road
```

The system compares these two values and activates the direction with the **higher priority score**.

## 🚀 Installation

```bash
# Clone the repository
git clone https://github.com/Karolczaq/intelligent-traffic.git
cd intelligent-traffic

# Install dependencies
npm install

# Install TypeScript globally (if not already installed)
npm install -g typescript ts-node
```

## 💻 Usage

### Basic Simulation

```bash
ts-node src/main.ts input.json output.json
```

### Example Commands

```bash
# Run the provided test scenario
ts-node src/main.ts input.json results.json

# Run with custom input
ts-node src/main.ts my-scenario.json my-results.json
```

## 📝 Input Format

```json
{
  "commands": [
    {
      "type": "addVehicle",
      "vehicleId": "vehicle1",
      "startRoad": "north",
      "endRoad": "south"
    },
    {
      "type": "step"
    }
  ]
}
```

### Command Types:

- **`addVehicle`**: Adds a vehicle to the specified road

  - `vehicleId`: Unique identifier for the vehicle
  - `startRoad`: One of `"north"`, `"south"`, `"east"`, `"west"`
  - `endRoad`: Destination road (can be any direction)

- **`step`**: Advances the simulation by one time step

## 📊 Output Format

```json
{
  "stepStatuses": [
    {
      "leftVehicles": ["vehicle1", "vehicle2"]
    },
    {
      "leftVehicles": []
    }
  ]
}
```

Each step records which vehicles successfully passed through the intersection.

## 🧮 Traffic Logic

### Priority Calculation

The system evaluates directions using:

```
Direction Value = Σ(waitingTime²) for all vehicles in direction
```

### Light Cycle Management

- **Default cycle**: 5 vehicles per direction
- **Extension logic**: +5 vehicles if same direction remains optimal
