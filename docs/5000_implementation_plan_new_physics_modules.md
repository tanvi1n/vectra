# 1000_implementation_plan_new_physics_modules.md

## Implementation Plan for Adding New Physics Modules (Chapters)

This document outlines the standard procedure for integrating new physics chapters and their corresponding interactive simulators into the VECTRA application. Adhering to this plan ensures consistency, maintainability, and proper functionality of new features.

---

### 1. Overview

Adding a new physics module (e.g., "Thermodynamics," "Electromagnetism") involves creating a new HTML page for the chapter, extending the JavaScript parsing and simulation logic, and linking it appropriately within the application's navigation.

---

### 2. File Structure for a New Module

For each new chapter `N` (e.g., Chapter 4), the following file structure should be adopted:

*   `chapterN.html`: The main HTML page for the new chapter's simulator.
*   `css/style.css`: Existing stylesheet; new chapter-specific styles should be appended or integrated carefully.
*   `js/main.js`: Existing main script; may require updates for UI elements specific to the new chapter (e.g., `problemInput`, `visualizeBtn` event listeners).
*   `js/parser.js`: Existing parser script; **will require significant updates** to understand natural language inputs relevant to the new physics domain.
*   `js/simulation.js`: Existing simulation engine; **will require significant updates** to implement the visualization and calculation logic for the new physics concepts.

---

### 3. Steps for Integration

#### 3.1. Create the New Chapter HTML Page (`chapterN.html`)

1.  **Duplicate an existing `chapterX.html`** (e.g., `chapter1.html`) and rename it to `chapterN.html` (e.g., `chapter4.html`).
2.  **Update the `<title>` tag** to reflect the new chapter's topic (e.g., `<title>Chapter 4: Thermodynamics - VECTRA</title>`).
3.  **Modify the `chapter-page-title` H2 tag** to the new simulator's name (e.g., `<h2>Thermodynamics Simulator</h2>`).
4.  **Update the `problem-textarea` placeholder text** and `helper-text` to provide examples and supported concepts relevant to the new chapter.
5.  **Ensure all `script` tags** at the bottom correctly link to `js/parser.js`, `js/simulation.js`, and `js/main.js` in the correct order.

#### 3.2. Extend JavaScript Logic (`js/parser.js`, `js/simulation.js`, `js/main.js`)

##### `js/parser.js`

1.  **Identify the new problem `type`:** Add logic within `parsePhysicsProblem(text)` to detect keywords or phrases specific to the new chapter's physics domain. Assign a unique `type` string (e.g., `'thermodynamics'`).
2.  **Extract `given` parameters:** Implement regular expressions and parsing logic to extract numerical values and units for parameters relevant to the new physics problems (e.g., temperature, pressure, volume, heat, work, entropy).
3.  **Determine `required` results:** Add logic to identify what the user is asking to calculate (e.g., `'heat_transfer'`, `'work_done'`, `'efficiency'`).
4.  **Return structured `data`:** Ensure the `parsePhysicsProblem` function returns a `data` object containing `type`, `given`, and `required` fields.

##### `js/simulation.js`

1.  **Implement new `calculatePhysics(data)` logic:**
    *   Add a new `if/else if` block within `calculatePhysics` that checks for the new chapter's `type` (e.g., `if (type === 'thermodynamics')`).
    *   Inside this block, implement the actual physics equations and formulas to deduce results based on the `given` parameters. Store these results in the `deduced` object within the `data` structure.
    *   Ensure all relevant `required` results are calculated.
2.  **Implement new visualization logic:**
    *   Add a new `if/else if` block within `animate()` or create a dedicated function (e.g., `drawThermodynamicsVisualization(ctx, canvas, data)`) to handle the visual representation of the new physics.
    *   This will involve using the Canvas 2D API (`ctx`) to draw relevant diagrams, graphs (e.g., PV diagrams), or animations.
    *   Consider how to represent parameters (e.g., using text overlays, bar charts, moving elements).

##### `js/main.js`

1.  **`displayGivenParameters(given)`:** Update this function to include formatting and display logic for any new `given` parameters specific to the new chapter.
2.  **`displayDeducedParameters(deduced)`:** Update this function to display the new `deduced` parameters calculated by `calculatePhysics`.
3.  **`displayRequiredResults(deduced, required)`:** Update this function to highlight and display the `required` results for the new chapter.
4.  **Chapter-specific UI adjustments (if necessary):** If the new chapter has unique UI elements or behaviors, add event listeners or modifications within the `DOMContentLoaded` listener.

#### 3.3. Update `chapters.html`

1.  **Add a new `<a>` tag (`chapter-card`)** within the `chapters-grid` to link to the newly created `chapterN.html`.
2.  **Update `href` attribute** to point to `chapterN.html`.
3.  **Set `data-keywords` attribute** to include relevant search terms for the new chapter (e.g., `data-keywords="thermodynamics heat work entropy"`) to ensure search functionality works.
4.  **Fill in `chapter-header`, `chapter-subtitle`, and `chapter-description`** with appropriate text for the new chapter.

---

### 4. Testing

After implementing a new module:

1.  Thoroughly test the parsing functionality with various natural language inputs.
2.  Verify the correctness of physics calculations for different scenarios.
3.  Ensure the visualization accurately represents the physics phenomena.
4.  Check for responsiveness and cross-browser compatibility.

---
