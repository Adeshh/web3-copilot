import { config } from 'dotenv';
config();
import { GoogleGenAI } from "@google/genai";

async function main() {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: "Hello",
    });
    console.log("Success! Quota is fine.");
  } catch (e) {
    console.error("Failed:", e);
  }
}
main();
