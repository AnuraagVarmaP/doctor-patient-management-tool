import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.REACT_APP_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);


export const getAvailableModels = async () => {
  if (!apiKey) return [];

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    if (!response.ok) return [];

    const data = await response.json();
    const models = data.models
      .filter(m => m.supportedGenerationMethods.includes("generateContent") && m.name.includes("flash"))
      .map(m => m.name.replace('models/', ''));

    const preferredOrder = ["gemini-2.5-flash", "gemini-1.5-flash", "gemini-2.0-flash", "gemini-pro", "gemini-1.0-pro"];

    models.sort((a, b) => {
      const indexA = preferredOrder.indexOf(a);
      const indexB = preferredOrder.indexOf(b);

      if (indexA !== -1 && indexB !== -1) return indexA - indexB;
      if (indexA !== -1) return -1;
      if (indexB !== -1) return 1;
      return a.localeCompare(b);
    });

    return models;
  } catch (error) {
    console.error("Error fetching models:", error);
    return [];
  }
};

export const analyzeSymptoms = async (symptoms, selectedModelName = "gemini-2.5-flash", specialty = "General Practitioner") => {
  if (!apiKey) {
    throw new Error("Gemini API key is not configured");
  }

  try {
    const model = genAI.getGenerativeModel({ model: selectedModelName });

    const prompt = `You are a highly advanced AI medical assistant designed to help doctors quickly analyze patient symptoms. 
    You are specifically assisting a doctor who specializes in: **${specialty || "General Practice"}**. 
    Please tailor your possible issues, possible medications, and health suggestions to be highly relevant to this specific medical specialty, while still identifying general medicine issues if the symptoms clearly point elsewhere.
    
    The doctor has provided the following symptoms: "${symptoms}"
    
    Please analyze these symptoms and provide a response formatted EXACTLY as a JSON object with the following structure. Make sure your descriptions and suggestions are clear bullet points (short and concise). Do NOT include markdown code blocks or any other text around the JSON.
    
    {
      "possibleIssues": [
        "Issue 1 with brief description",
        "Issue 2 with brief description"
      ],
      "possibleMedications": [
        "Medication class 1 (e.g., NSAIDs)",
        "Medication class 2"
      ],
      "healthSuggestions": [
        "Actionable advice 1",
        "Actionable advice 2"
      ],
      "summary": "A 1-2 sentence clinical summary of the potential situation."
    }`;

    const result = await model.generateContent(prompt);
    const genResponse = await result.response;
    const text = genResponse.text();

    let jsonString = text;
    if (jsonString.startsWith("```json")) {
      jsonString = jsonString.replace(/```json/g, "").replace(/```/g, "").trim();
    } else if (jsonString.startsWith("```")) {
      jsonString = jsonString.replace(/```/g, "").trim();
    }

    return JSON.parse(jsonString);

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw new Error("Failed to analyze symptoms. " + error.message);
  }
};
