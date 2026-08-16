import { getClient } from "@/ai/gemini";

export async function embedText(text: string): Promise<number[]> {
    const response = await getClient().models.embedContent({
        model: "gemini-embedding-2",
        contents: text,
    });

    if(!response.embeddings || response.embeddings.length ===0) {
        throw new Error("Failed to generate embedding");

    }
    //The model returns a Float32Array or standard array of numbers
    return response.embeddings[0].values as number[];
}