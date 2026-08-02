import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(req: Request) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return Response.json(
        { error: "GEMINI_API_KEY is not set on the server." },
        { status: 500 },
      );
    }

    const { message } = await req.json();

    if (typeof message !== "string" || message.trim() === "") {
      return Response.json(
        { error: "Body must include a non-empty 'message' string." },
        { status: 400 },
      );
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: message,
    });

    return Response.json({ reply: response.text });
  } catch (err) {
    console.error("[/api/chat]", err);
    return Response.json(
      { error: "Failed to generate a response." },
      { status: 500 },
    );
  }
}
