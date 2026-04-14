import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ 
  apiKey: process.env.GEMINI_API_KEY || "" 
});

export const model = "gemini-3-flash-preview";

export async function generateResponse(prompt: string, systemInstruction?: string) {
  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        systemInstruction,
      },
    });
    return response.text;
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
}

export async function* generateResponseStream(prompt: string, systemInstruction?: string) {
  try {
    const response = await ai.models.generateContentStream({
      model,
      contents: prompt,
      config: {
        systemInstruction,
      },
    });
    for await (const chunk of response) {
      yield chunk.text;
    }
  } catch (error) {
    console.error("Gemini API Streaming Error:", error);
    throw error;
  }
}
