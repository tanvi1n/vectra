const { GoogleGenerativeAI } = require('@google/generative-ai');

// IMPORTANT: Replace 'YOUR_GEMINI_API_KEY' with your actual Gemini API Key.
// Use the SAME API key you put in server.js
const GEMINI_API_KEY = 'AIzaSyBOuwg-ElV8uuJ4LbxTjJLYkr98nzvkj3g'; 

async function listModels() {
  if (GEMINI_API_KEY === 'YOUR_GEMINI_API_KEY' || !GEMINI_API_KEY) {
      console.error('Gemini API Key is not configured. Please replace "YOUR_GEMINI_API_KEY" in list_models.js');
      return;
  }

  const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

  try {
    const { models } = await genAI.listModels();

    console.log('Available Gemini Models (with generateContent support):');
    let foundCompatibleModel = false;
    for (const model of models) {
      // Check if the model supports generateContent (text-only or multimodal)
      if (model.supportedGenerationMethods.includes('generateContent')) {
        console.log(`  - ${model.name} (displayName: ${model.displayName}, version: ${model.version})`);
        foundCompatibleModel = true;
      }
    }
    if (!foundCompatibleModel) {
        console.log("No models found that support 'generateContent' with your API key.");
        console.log("Please ensure your API key has the necessary permissions.");
    }

  } catch (error) {
    console.error('Error listing models:', error);
    console.error('Please ensure your API key is correct and has access to the Gemini API.');
    if (error.response && error.response.status === 403) {
        console.error('A 403 error often means the API key is not authorized for the requested operation or service. Check project permissions and API enablement.');
    }
  }
}

listModels();
