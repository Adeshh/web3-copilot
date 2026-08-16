import { prisma } from "../db/prisma";
import { embedText } from "./embeddings";

export async function findRelevantChunks(query: string, limit = 5): Promise<string[]> {
    // 1. Embed the user's natural language query
    const queryEmbedding = await embedText(query);
    const vectorString = `[${queryEmbedding.join(",")}]`;

    // 2. Query Postgres using pgvector's cosine distance (<=>) operator
    // We order by distance ascending (closest meaning first)
    const results = await prisma.$queryRaw<
        { chunk: string; distance: number }[]
    >`
        SELECT chunk,
               embedding <=> ${vectorString}::vector AS distance
        FROM "Document"
        ORDER BY embedding <=> ${vectorString}::vector
        LIMIT ${limit}
    `;

    // 3. Extract and return just the text chunks
    return results.map(r => r.chunk);
}
