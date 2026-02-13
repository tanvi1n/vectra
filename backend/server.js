const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const cors = require('cors'); // Import cors

const app = express();
const port = 3000;

// IMPORTANT: Replace 'YOUR_GEMINI_API_KEY' with your actual Gemini API Key.
// It's highly recommended to use environment variables for API keys in a production setup.
const GEMINI_API_KEY = 'AIzaSyBOuwg-ElV8uuJ4LbxTjJLYkr98nzvkj3g';

// Use CORS to allow requests from your frontend (e.g., http://localhost:8080 or file://)
// For a production environment, you should restrict this to your specific frontend origin.
app.use(cors());
app.use(express.json()); // Middleware to parse JSON request bodies

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

app.post('/ask-llm', async (req, res) => {
    const { question } = req.body;

    if (!question) {
        return res.status(400).json({ error: 'Question is required in the request body.' });
    }

    if (GEMINI_API_KEY === 'YOUR_GEMINI_API_KEY' || !GEMINI_API_KEY) {
        return res.status(500).json({ error: 'Gemini API Key is not configured. Please replace "YOUR_GEMINI_API_KEY" in server.js' });
    }

    try {
        const model = genAI.getGenerativeModel({
            model: "models/gemini-flash-latest",
            systemInstruction: "You are an expert physics tutor and problem generator. Your task is to respond ONLY in JSON format. The JSON should contain two keys: 'problemStatement' and 'explanationAndCalculation'. The 'problemStatement' value must be a natural language description of a physics problem suitable for a physics simulation, including numerical values and units for parameters like mass, velocity, height, angle, distance, time, and specifying what needs to be calculated (e.g., 'A ball is dropped from 50m and thrown at 20 m/s at 45 degrees, calculate time of flight and range.'). The 'explanationAndCalculation' value should be a detailed, Markdown-formatted explanation of the user's query, including relevant physics principles, step-by-step calculations, and the final answers. Ensure clear presentation of numerical results within the explanation."
        });

        const prompt = `Based on the following user query: "${question}", generate a physics problem statement for a simulation AND a detailed explanation with calculations.
        
        **Problem Statement for Simulation:** Create a natural language problem statement that is parseable by a physics engine for visualization. Include all necessary numerical parameters (e.g., "A ball is dropped from 50m with 0 initial velocity.").
        
        **Explanation and Calculations:** Provide a markdown-formatted explanation of the physics, including formulas, step-by-step calculations for the problem, and the final answers.
        
        Your final response MUST be a single JSON object with the keys 'problemStatement' and 'explanationAndCalculation'.`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        res.json({ answer: text });
    } catch (error) {
        console.error('Error calling Gemini API:', error);
        res.status(500).json({ error: 'Failed to get response from Gemini API.' });
    }
});

app.listen(port, () => {
    console.log(`Backend server listening at http://localhost:${port}`);
});
