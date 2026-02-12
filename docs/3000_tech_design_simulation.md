# 3000_tech_design_simulation.md

## Technical Design Document: Physics Simulation Engine (`js/simulation.js`)

---

### 1. Introduction

The `js/simulation.js` module is the core of VECTRA's interactive visualization capabilities. It receives structured physics problem data from `js/parser.js`, performs the necessary physics calculations, and then renders dynamic, animated simulations or static force diagrams on an HTML5 Canvas.

---

### 2. Purpose and Design Principles

**Purpose:**
To accurately calculate physics parameters based on parsed input and visually represent these physics concepts through interactive canvas graphics, enabling users to understand phenomena like motion, forces, and energy transformations.

**Design Principles:**
*   **Modularity:** Calculations and drawing logic are separated as much as possible for different physics domains.
*   **Accuracy:** Physics calculations aim for reasonable accuracy within the scope of typical introductory physics problems.
*   **Visual Clarity:** Simulations are designed to be clear, highlighting key aspects like trajectories, vectors, and energy states.
*   **Real-time (Pseudo):** Animation loops provide a sense of real-time progression for motion-based simulations.
*   **Scalability:** Graphics scale dynamically to fit the canvas and the magnitude of the physics problem (e.g., large ranges, high velocities).

---

### 3. Core Functions and Workflow

The `js/simulation.js` module orchestrates the entire simulation process, from initial setup to rendering and animation.

#### 3.1. `startSimulation(data)`

*   **Initialization:** Called with the `problemData` object received from `js/main.js` (which in turn gets it from `js/parser.js`).
*   **Animation Control:** Manages `animationId` to ensure only one simulation runs at a time. It cancels any previously running animation.
*   **Timing:** Records `startTime` for calculating elapsed time during animation.
*   **Duration Calculation:** For specific problem types (e.g., 'incline'), it calculates `animationDuration` to control the speed and length of the visual animation.
*   **Starts Animation Loop:** Invokes `animate()` to begin the rendering process.

#### 3.2. `animate()` (Main Animation Loop)

*   **Conditional Rendering:** Checks `simulationData.type` to determine which drawing function to call.
    *   For 'work', 'kinetic', 'potential', 'power', 'conservation': calls `drawWorkEnergyVisualization`.
    *   For 'newtons_laws': calls `drawNewtonsLawsVisualization`.
    *   For all motion-based types ('projectile', 'freefall', 'vertical', 'horizontal_projectile', 'horizontal'): proceeds with the step-by-step animation logic.
*   **Time Management:** Calculates `elapsed` time since `startTime`.
*   **Animation Completion:** If `elapsed` exceeds `totalTime` (from `deduced.timeOfFlight`), it draws the final frame and stops the animation using `stopSimulation()`.
*   **Canvas Clearing:** Clears the entire canvas at the beginning of each frame.
*   **Position and Velocity Calculation:** Calls `getPosition(t, data)` and `getVelocity(t, data)` for the current time `t`.
*   **Drawing Order:** Renders elements in a specific order: ground, trajectory, key points, velocity vector, projectile, and info panel.
*   **RequestAnimationFrame:** Uses `requestAnimationFrame(animate)` to schedule the next frame, ensuring smooth, browser-optimized animation.

#### 3.3. Physics Calculation Helper: `calculatePhysics(data)`

This function takes the raw `problemData` (with `type` and `given`) and populates the `data.deduced` object with calculated physics quantities.

*   **Gravitational Constant:** Uses `g = given.gravity || 9.8`.
*   **Type-Specific Logic:** Contains extensive `if/else if` blocks, each dedicated to a specific `problemData.type`.
*   **Formulas:** Implements standard physics formulas for each type:
    *   **'incline':** Normal force, friction force, parallel force, net force, acceleration, work (gravity, friction, net), final velocity (using work-energy theorem), height change.
    *   **'work':** Work done, kinetic energy, final velocity.
    *   **'kinetic':** Kinetic energy.
    *   **'potential':** Potential energy.
    *   **'power':** Power calculation (from work/time or force/distance/time).
    *   **'conservation':** Potential, kinetic, total energy, final velocity, max height (for energy conservation).
    *   **'projectile':** Horizontal (vx) and vertical (vy) initial velocities, time to max height, max height, time of flight, range.
    *   **'freefall':** Time of flight, final velocity.
    *   **'vertical' (up/down):** Time to max height, max height, time of flight, final velocity.
    *   **'horizontal_projectile':** Time of flight, range, final velocity.
    *   **'newtons_laws':** Normal force, friction force, net force, acceleration, and kinematic equations for final velocity, distance, and time if applicable.
    *   **'horizontal':** Range, time of flight, final velocity (constant).

#### 3.4. Position and Velocity over Time: `getPosition(t, data)` & `getVelocity(t, data)`

These functions are crucial for motion simulations. They calculate the `(x, y)` coordinates and `(vx, vy)` components of velocity of the projectile at any given `time (t)`.

*   **Kinematic Equations:** Apply appropriate kinematic equations based on the `problemData.type` (e.g., `x = v_x * t`, `y = h_0 + v_y * t - 0.5 * g * t^2`).
*   **Gravity:** Integrates gravitational acceleration (`-g`) into vertical motion calculations.

#### 3.5. Scaling and Coordinates: `calculateScale(data, canvas)`

*   **Dynamic Scaling:** Determines an appropriate `scale` factor to map physics units (meters) to canvas pixels.
*   **Max Range/Height:** Considers the `deduced.range` and `deduced.maxHeight` to ensure the entire trajectory fits within the canvas dimensions while maximizing visibility.
*   **Offsets:** Defines `offsetX` and `offsetY` to position the origin (0,0 physics coordinates) correctly on the canvas (typically bottom-left).

#### 3.6. Drawing Functions (Canvas API)

A suite of functions uses the HTML5 Canvas 2D API (`ctx`) to render various elements:

*   **`drawGround(ctx, canvas, offsetY)`:** Draws the ground line and label.
*   **`drawTrajectory(ctx, data, scale, offsetX, offsetY)`:** Plots the path of the projectile using a series of line segments, often dashed.
*   **`drawProjectile(ctx, position, scale, offsetX, offsetY)`:** Renders the moving object (e.g., a ball) at its current `(x, y)` position.
*   **`drawKeyPoints(ctx, data, scale, offsetX, offsetY)`:** Marks and labels significant points like launch, max height, and landing.
*   **`drawVelocityVector(ctx, position, velocity, scale, offsetX, offsetY)`:** Draws an arrow representing the magnitude and direction of the projectile's velocity.
*   **`drawInfoPanel(ctx, canvas, t, totalTime, position, velocity)`:** Displays real-time numerical information (time, position, velocity) during the animation.
*   **`drawFinalFrame(...)`:** Called once the animation completes to render the final state.
*   **`drawNewtonsLawsVisualization(ctx, canvas, data)`:** Renders a static diagram for Newton's Laws problems, showing a block and force vectors (gravity, normal, applied, friction, net, acceleration). Includes an info panel.
*   **`drawWorkEnergyVisualization(ctx, canvas, data)`:** Renders a bar chart comparing different forms of energy (work, kinetic, potential) or a specific visualization for inclined planes.
*   **`drawInclinedPlane(ctx, canvas, data)`:** Renders an animated block on an inclined plane, showing forces and relevant parameters.
*   **`drawArrow(ctx, x, y, dx, dy, color, label, labelOffset)`:** A utility function for drawing customizable arrows with labels, used for force and velocity vectors.

---

### 4. Limitations and Future Improvements

**Current Limitations:**
*   **2D Only:** All simulations are currently restricted to 2D space.
*   **Simplified Models:** Assumes ideal conditions (e.g., no air resistance unless friction is explicitly modeled in specific scenarios).
*   **Fixed Camera:** The view of the simulation is static and cannot be panned or zoomed by the user.
*   **Limited Interactivity:** Users cannot directly manipulate objects within the simulation.
*   **No Simultaneous Forces:** Force visualizations currently focus on a single object in equilibrium or undergoing simple acceleration.
*   **Animation Detail:** Visualizations are illustrative rather than high-fidelity physics engines.

**Future Improvements:**
*   **Air Resistance/Drag:** Incorporate more realistic models for air resistance.
*   **Multiple Objects:** Simulate interactions between multiple objects.
*   **User Interaction:** Allow users to drag objects, change parameters in real-time, or pause/resume simulations.
*   **Camera Controls:** Implement pan, zoom, and perhaps even simple 3D views for certain problems.
*   **Advanced Visualizations:** Explore more complex visual representations for fields (e.g., electric fields), waves, or thermal processes.
*   **Graphical Libraries:** Consider integrating a dedicated 2D physics engine (e.g., Matter.js, Box2D.js) for more complex interactions and collision detection.
*   **Accessibility:** Ensure simulations are accessible to users with disabilities (e.g., screen reader compatibility, alternative input methods).

---
