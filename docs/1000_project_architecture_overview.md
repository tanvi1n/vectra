# 0000_project_architecture_overview.md

## Project Architecture Overview: VECTRA - AI Physics Visualization

---

### 1. Introduction

VECTRA is a web-based interactive physics education and visualization tool. Its primary function is to allow users to input physics problems in natural language, which are then parsed, calculated, and visualized through dynamic simulations on an HTML5 Canvas. The application is structured around a modular design to facilitate extensibility and maintainability for various physics topics.

---

### 2. High-Level Architecture

The VECTRA application follows a client-side, single-page application (SPA) like architecture, leveraging standard web technologies (HTML, CSS, JavaScript) to deliver interactive content without requiring a backend server for its core functionality.

```
+-------------------+     +---------------------+
|                   |     |                     |
|  User (Browser)   | <-> |  index.html         |
|                   |     |  chapters.html      |
|                   |     |  chapterN.html      |
+-------------------+     +----------^----------+
                                     |
                                     |
                                     v
+--------------------------------------------------------------------------+
|                        Client-Side Application                           |
|                                                                          |
|  +----------------+    +----------------+    +----------------------+  |
|  |                |    |                |    |                      |  |
|  |  main.js       | -> |  parser.js     | -> |  simulation.js       |  |
|  | (UI Logic,     |    | (NLP for       |    | (Physics Calc. &     |  |
|  |  Coordination) |    |  Problem Parsing) |    |  Canvas Simulation)  |  |
|  |                |    |                |    |                      |  |
|  +------^---------+    +----------------+    +----------^-----------+  |
|         |                                                |             |
|         +------------------------------------------------+             |
|                                                                          |
|  +--------------------------------------------------------------------+  |
|  |                         style.css                                  |  |
|  | (Styling, Layout, Responsive Design)                               |  |
|  +--------------------------------------------------------------------+  |
+--------------------------------------------------------------------------+
```

---

### 3. Core Components and Their Interactions

#### 3.1. HTML Pages (`index.html`, `chapters.html`, `chapterN.html`)

*   **`index.html` (Landing Page):** Provides an entry point to the application with a hero section and a call to action to start learning.
*   **`chapters.html` (Chapter Listing):** Displays a grid of available physics chapters. Includes a search bar for filtering chapters by keywords. Each chapter card links to its dedicated HTML page.
*   **`chapterN.html` (Individual Chapter Pages):** These are the core interactive pages for each physics module (e.g., `chapter1.html` for 1D & 2D Motion, `chapter2.html` for Work & Energy, `chapter3.html` for Newton's Laws).
    *   Each page contains a `textarea` for user input, display areas for "Given Parameters," "Deduced Parameters," and "Required Results," and an HTML5 `canvas` element for the simulation.
    *   They load `js/parser.js`, `js/simulation.js`, and `js/main.js` scripts.

#### 3.2. Styling (`css/style.css`)

*   A single, comprehensive CSS file manages the entire application's visual presentation.
*   It defines a "Retro Pixel-Arcade Sci-Fi" theme using CSS variables for colors, spacing, and borders.
*   Includes a CSS reset, base styles, layout utilities, typography, and responsive media queries (`@media`) for adapting the layout to different screen sizes.
*   Contains specific styles for navigation, hero sections, chapter cards, input forms, result displays, and the simulation canvas.

#### 3.3. JavaScript Modules

##### 3.3.1. `js/main.js` (UI Logic & Orchestration)

*   **Role:** Acts as the main application script, coordinating interactions between the UI, parser, and simulation engine.
*   **Key Responsibilities:**
    *   **Chapter Search:** Handles filtering chapter cards on `chapters.html` based on user input.
    *   **Animation on Scroll:** Implements `IntersectionObserver` for fade-in animations as elements enter the viewport.
    *   **Chapter Page Input UX:** Manages the `problemInput` `textarea` (character count, enabling/disabling "Visualize" button).
    *   **"Visualize" Button Handler:** On click, it:
        1.  Sets loading state for the button.
        2.  Calls `parsePhysicsProblem()` from `js/parser.js`.
        3.  Handles parsing errors.
        4.  Calls `calculatePhysics()` from `js/simulation.js`.
        5.  Calls display functions (`displayGivenParameters`, `displayDeducedParameters`, `displayRequiredResults`) to update the UI.
        6.  Calls `startSimulation()` from `js/simulation.js` to begin the visual simulation.
        7.  Resets the button state after processing.
*   **Display Functions:** Contains utility functions (`displayGivenParameters`, `displayDeducedParameters`, `displayRequiredResults`) for rendering structured physics data onto the HTML page.

##### 3.3.2. `js/parser.js` (Natural Language Processing)

*   **Role:** Interprets free-form text input from the user to extract physics problem data.
*   **Key Responsibilities:**
    *   **`parsePhysicsProblem(text)`:** The main function.
    *   **Text Preprocessing:** Converts input to lowercase and trims whitespace.
    *   **Problem Type Detection:** Identifies the broad category of physics problem (e.g., `'projectile'`, `'newtons_laws'`) using keyword-based regular expressions.
    *   **Parameter Extraction:** Uses regular expressions to find and extract numerical values and units for physical quantities (e.g., mass, velocity, angle, height, force, friction).
    *   **Required Results Identification:** Determines what specific quantities the user is asking to find.
    *   **Output:** Returns a structured `problemData` object containing `type`, `given` parameters, and an array of `required` results.

##### 3.3.3. `js/simulation.js` (Physics Engine & Canvas Visualization)

*   **Role:** Performs physics calculations and renders interactive visual simulations or diagrams on an HTML5 Canvas element.
*   **Key Responsibilities:**
    *   **`startSimulation(data)`:** Initializes and starts the animation loop.
    *   **`animate()`:** The core `requestAnimationFrame` loop that drives the visualization. It clears the canvas, updates physics states, and draws elements for each frame.
    *   **`calculatePhysics(data)`:** Contains the physics formulas and logic to compute deduced parameters (e.g., acceleration, net force, range, max height, energy values) based on the `given` input and `problemData.type`.
    *   **`getPosition(t, data)` & `getVelocity(t, data)`:** For motion simulations, calculates the exact position and velocity vectors of objects at a given time `t`.
    *   **`calculateScale(data, canvas)`:** Determines how to map physics units (meters) to canvas pixels to ensure simulations fit and are visually coherent.
    *   **Drawing Functions:** A comprehensive set of functions to draw various elements on the canvas: ground, projectile, trajectory, velocity vectors, force vectors, key points (launch, max height, landing), info panels, and specific visualizations for Newton's Laws and Work & Energy (e.g., inclined plane animation, energy bar charts).
    *   **`stopSimulation()`:** Halts the animation loop.

---

### 4. Data Flow

1.  **User Input:** User types a physics problem into the `textarea` on a `chapterN.html` page.
2.  **`main.js` Trigger:** The "Visualize" button click event in `main.js` initiates the parsing process.
3.  **Parsing (`parser.js`):** `main.js` calls `parser.js`'s `parsePhysicsProblem()` with the user's text. `parser.js` returns a `problemData` object (or `null` on failure).
4.  **Physics Calculation (`simulation.js`):** `main.js` then passes the `problemData` object to `simulation.js`'s `calculatePhysics()`. This function enriches `problemData` with `deduced` values.
5.  **UI Update (`main.js`):** `main.js` uses its display functions to update the "Given Parameters," "Deduced Parameters," and "Required Results" sections of the HTML page using the information from the now-complete `problemData` object.
6.  **Visualization (`simulation.js`):** `main.js` calls `simulation.js`'s `startSimulation()` with the `problemData`. The `simulation.js` module then begins its animation loop, drawing the visual representation on the `canvas` based on the calculated physics states.

---

### 5. Future Considerations

*   **Backend Integration:** For user accounts, saving problems, or more complex calculations / AI processing.
*   **Web Workers:** Offload heavy physics calculations or rendering tasks to prevent UI blocking.
*   **Dedicated Physics Engine Library:** Integrate a more robust 2D physics engine for advanced collision detection and interactions.
*   **Accessibility Enhancements:** Improve accessibility for users with disabilities, especially for the visual simulations.
*   **Expanded Physics Domains:** Continuously add support for new and more complex physics topics.
*   **User Guides/Tutorials:** Develop interactive guides within the application.

---
