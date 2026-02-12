# 2000_tech_design_parser.md

## Technical Design Document: Natural Language Physics Problem Parser (`js/parser.js`)

---

### 1. Introduction

The `js/parser.js` module is a critical component of the VECTRA application, responsible for interpreting natural language descriptions of physics problems provided by the user. Its primary goal is to extract relevant numerical parameters, identify the type of physics problem, and determine the quantities the user wishes to calculate. This structured output is then consumed by the `js/simulation.js` module for physics calculations and visualization.

---

### 2. Purpose and Design Principles

**Purpose:**
To convert unstructured text input (natural language physics problems) into a structured data format (`problemData` object) that can be easily processed by the physics engine and simulation components.

**Design Principles:**
*   **Keyword-driven:** Relies heavily on identifying specific keywords and patterns to infer problem types and extract values.
*   **Regular Expression (Regex) based:** Utilizes regular expressions for robust and flexible pattern matching and data extraction.
*   **Sequential Processing:** Processes text through a series of checks, starting with problem type identification, followed by parameter extraction.
*   **Default Values & Fallbacks:** Where possible, provides sensible default values (e.g., for gravity) or attempts to infer parameters when not explicitly stated.
*   **Extensible:** Designed to allow for the addition of new problem types and parameter extraction rules as the application grows.

---

### 3. Core Function: `parsePhysicsProblem(text)`

This is the main entry point for the parser. It takes a raw string of text (the user's problem description) and returns a `problemData` object or `null` if parsing fails.

#### 3.1. Input Preprocessing

1.  **`text.toLowerCase().trim()`:** The input text is converted to lowercase and leading/trailing whitespace is removed to ensure case-insensitive matching and clean processing.
2.  **Empty Input Check:** If the processed text is empty, the function returns `null`.

#### 3.2. Problem Type Identification

The parser uses a series of `if/else if` conditions to determine the `type` of physics problem. This is the first critical step as it guides subsequent parameter extraction and calculation logic. Each condition checks for specific keywords or combinations of keywords.

**Examples of Problem Type Detection:**
*   `'newtons_laws'`: `text.includes('newton') || (text.includes('force') && (text.includes('mass') || text.includes('acceleration')))`
*   `'incline'`: `text.includes('incline') || text.includes('inclined')`
*   `'projectile'`: `text.includes('angle') || text.includes('launched') || text.includes('projectile') || text.includes('degrees')`
*   `'freefall'`: `text.includes('dropped') || text.includes('free fall')`
*   ...and so on for other types like `'work'`, `'kinetic'`, `'potential'`, `'power'`, `'conservation'`, `'vertical'`, `'horizontal_projectile'`, `'horizontal'`.

If no specific type is matched, the parser currently returns `null`.

#### 3.3. Parameter Extraction (`given` object)

Once a problem type is identified (or even if not, as some parameters are generic), the parser attempts to extract numerical values for various physical quantities using regular expressions. These extracted values form the `given` object within the `problemData` structure.

**Common Extraction Patterns:**
*   **Mass (`kg`):** `(\d+(?:\.\d+)?)\s*kg`
    *   Example: "5 kg box" -> `mass = 5`
*   **Force (`N`):**
    *   `appliedForce`: `(?:applied force of|pushed with a force of|pull with a force of|force of)\s+(\d+(?:\.\d+)?)\s*n`
    *   `force`: `(\d+(?:\.\d+)?)\s*n` (generic, used if `appliedForce` isn't found)
    *   Example: "force of 50 N" -> `force = 50`
*   **Distance (`m`):** `(\d+(?:\.\d+)?)\s*m` (with various preceding keywords like "distance", "pushed", "pulled")
    *   Example: "over 10 m" -> `distance = 10`
*   **Velocity (`m/s`):** `(\d+(?:\.\d+)?)\s*m\/s` (with "initial velocity of" or generic)
    *   Example: "at 20 m/s" -> `velocity = 20`
*   **Height (`m`):** `(\d+(?:\.\d+)?)\s*m` (with "height", "from", "at")
    *   Example: "from a height of 10m" -> `height = 10`
*   **Time (`s`, `sec`, `seconds`):** `(\d+(?:\.\d+)?)\s*(?:s|sec|seconds?)`
    *   Example: "for 5 s" -> `time = 5`
*   **Angle (`degrees`, `°`, `deg`):** `(\d+(?:\.\d+)?)\s*(?:degrees|°|deg)`
    *   Example: "at 45 degrees" -> `angle = 45`
*   **Friction Coefficient (`μ`, `mu`, `friction`):** `(?:friction|coefficient of friction|μ|mu)\s*=?\s*(\d+(?:\.\d+)?)`
    *   Example: "friction 0.2" -> `friction = "0.2"` (stored as string initially, parsed to float later)
*   **Gravity (`g=X`):** `g\s*=\s*(\d+(?:\.\d+)?)`
    *   Default value: `9.8` m/s² if not specified.

Each extracted value is converted to a `parseFloat` where applicable and stored in the `given` object.

#### 3.4. Required Results Identification (`required` array)

The parser also attempts to identify what quantities the user explicitly asks for. This is done by checking for keywords like "find acceleration", "what is the work done", "maximum height", etc. If no specific quantities are requested, a default set of relevant outputs is added to the `required` array based on the identified `problemData.type`.

**Examples of Required Result Keywords:**
*   `'acceleration'`
*   `'netForce'`, `'frictionForce'`
*   `'work'`, `'kinetic'`, `'potential'`, `'power'`
*   `'velocity'`, `'time'`, `'height'`, `'range'`

#### 3.5. Output Structure

The `parsePhysicsProblem` function returns an object with the following structure:

```javascript
{
    type: 'string', // e.g., 'projectile', 'newtons_laws', 'incline'
    given: {
        // Extracted parameters with their numerical values
        mass: 5,         // kg
        velocity: 20,    // m/s
        angle: 45,       // degrees
        height: 10,      // m
        gravity: 9.8,    // m/s^2 (default or extracted)
        // ... other parameters like force, distance, time, friction
    },
    deduced: {}, // Initially empty, filled by simulation.js
    required: [  // Array of strings indicating what results the user wants
        'height', 'range', 'time'
    ]
}
```

---

### 4. Limitations and Future Improvements

**Current Limitations:**
*   **Ambiguity:** Natural language is inherently ambiguous. The parser might misinterpret complex sentences or problems with implicit contexts.
*   **Limited Grammar:** The parser relies on specific keyword patterns. Variations in phrasing or more complex sentence structures may not be understood.
*   **No chained problems:** Cannot handle multi-step problems where the output of one scenario becomes the input for another.
*   **Unit Sensitivity:** While it extracts common units, it doesn't perform unit conversions or handle non-standard units.
*   **Limited Physics Domains:** Currently supports a specific set of kinematics, dynamics, and energy problems.
*   **Error Handling:** Provides a generic error message if parsing fails, without specific diagnostics.

**Future Improvements:**
*   **Advanced NLP Techniques:** Explore using more sophisticated NLP libraries or machine learning models for better semantic understanding.
*   **Contextual Awareness:** Develop mechanisms to maintain context across sentences or for implicit parameters.
*   **Expanded Physics Coverage:** Systematically add support for more physics topics (e.g., rotational motion, fluid dynamics, electromagnetism).
*   **Robust Error Reporting:** Provide more specific feedback to the user when a problem cannot be parsed, suggesting valid formats or missing information.
*   **Unit Conversion/Validation:** Implement a unit conversion system.
*   **Interactive Feedback:** Offer real-time suggestions or clarifications during input.
*   **Problem-solving steps:** Generate intermediate problem-solving steps rather than just final answers.

---
