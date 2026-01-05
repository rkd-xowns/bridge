
import { GoogleGenAI, Type } from "@google/genai";
import { CalendarEvent, AnalysisResult } from "../types";

export const analyzeOverlap = async (
  myEvents: CalendarEvent[],
  partnerEvents: CalendarEvent[],
  myLocation: string,
  partnerLocation: string
): Promise<AnalysisResult> => {
  // Fix: Move initialization inside function to ensure up-to-date API key
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `
    Analyze two daily schedules for a long-distance couple. 
    User A Location: ${myLocation}
    User B Location: ${partnerLocation}
    
    User A Schedule: ${JSON.stringify(myEvents)}
    User B Schedule: ${JSON.stringify(partnerEvents)}
    
    Please:
    1. Identify 'Golden Windows' where both are awake and not working (in UTC).
    2. Suggest activities for their next date based on gaps.
    3. Summarize the day's connectivity potential.
    
    Return in JSON format.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            overlapWindows: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  start: { type: Type.STRING },
                  end: { type: Type.STRING },
                  quality: { type: Type.STRING }
                },
                required: ["start", "end", "quality"]
              }
            },
            suggestions: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            summary: { type: Type.STRING }
          },
          required: ["overlapWindows", "suggestions", "summary"]
        }
      }
    });

    // Fix: Access response.text directly as a property, not a method.
    const textOutput = response.text || "{}";
    return JSON.parse(textOutput);
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return {
      overlapWindows: [],
      suggestions: ["Couldn't analyze right now. Try a manual sync!"],
      summary: "Communication glitch with the stars."
    };
  }
};