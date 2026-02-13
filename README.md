# VECTRA - AI Physics Visualization

VECTRA is an interactive web application designed to help users simulate and visualize physics problems. It allows students and enthusiasts to input physics problems in natural language, which the application then parses, calculates relevant parameters, and displays dynamic, interactive simulations.

## Features

*   **Interactive Physics Simulators:**
    *   **1D & 2D Motion (Kinematics):** Explore free fall, vertical motion (up/down), projectile motion, horizontal projectile motion, and constant velocity scenarios.
    *   **Work and Energy:** Understand concepts like work, kinetic energy, potential energy, power, conservation of energy, and inclined planes.
    *   **Newton's Laws:** Visualize forces, mass, acceleration, friction, net force, and equilibrium.
*   **Natural Language Problem Parsing:** Describe physics problems in plain English, and VECTRA will attempt to extract the relevant parameters.
*   **Detailed Parameter Display:** View both the input "Given Parameters" and the "Deduced Parameters" calculated by the physics engine. "Required Results" are highlighted based on the problem query.
*   **Dynamic Visualizations:** Enjoy engaging, canvas-based animations for motion problems, and clear force diagrams for Newton's Laws and Work & Energy scenarios.
*   **Chapter-based Learning:** Content is organized into chapters, each focusing on a specific area of physics.
*   **Responsive Design:** The application is designed to be accessible and usable across various device sizes.

## Technologies Used

*   **HTML5:** For structuring the web content.
*   **CSS3:** Styled with a retro-pixel arcade sci-fi theme, utilizing custom CSS variables and responsive design principles.
*   **JavaScript (ES6+):** Powers the core application logic, problem parsing, physics calculations, and interactive canvas simulations.
    *   **Canvas API:** Used for drawing all the dynamic physics visualizations and animations.

## File Structure

```
.
├── index.html            # Main landing page
├── README.md             # Project documentation
├── pages/                # All chapter and navigation pages
│   ├── chapter1.html     # Chapter 1: 1D & 2D Motion Simulator
│   ├── chapter2.html     # Chapter 2: Work and Energy Simulator
│   ├── chapter3.html     # Chapter 3: Newton's Laws Simulator
│   ├── chapter4.html     # Chapter 4: Additional Physics Concepts
│   └── chapters.html     # Page listing all available chapters
├── css/
│   └── style.css         # Global styles for the application
├── js/
│   ├── main.js           # Core application logic, UI interactions, and display functions
│   ├── parser.js         # Handles natural language processing for physics problems
│   └── simulation.js     # Manages canvas drawing, animation loops, and detailed physics calculations
├── assets/               # Images and media files
├── tests/                # Test and debug files
│   ├── debug_parser.html
│   ├── test_incline.html
│   ├── test_parser.html
│   ├── test_question.txt
│   └── quick_test.js
├── docs/                 # Technical documentation
└── backend/              # Backend server files (optional)
```

## How to Run

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/vectra.git
    cd vectra
    ```
2.  **Open in Browser:** Simply open the `index.html` file in your preferred web browser. All content is client-side, so no server is required.

## Usage

1.  Navigate to `index.html` and click "Start Learning" or go directly to `chapters.html`.
2.  Select a chapter (e.g., "1D and 2D Motion").
3.  On the chapter page, enter a physics problem in the provided text area (e.g., "A ball is thrown at 20 m/s at 45 degrees from a height of 10m. Find maximum height and range.").
4.  Click "Visualize" to see the parsed parameters, calculated results, and an interactive simulation of the problem.

## Demo Video
https://drive.google.com/file/d/1nKDWc1QrkrFIhJg721TPDvFgYRFE8l6R/view?usp=sharing
