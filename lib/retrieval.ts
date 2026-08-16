import { prisma } from "@/db/prisma";
import { embedText } from "@/lib/embeddings";

export async function findRelevantChunks(query: string, limit = 5): Promise<string[]> {
    // 1. Get the vector numbers for the query
    const queryEmbedding = await embedText(query);
    
    // 2. Format for postgress
    const vectorString = `[${queryEmbedding.join(",")} ]`;

    //3. Actual Semantic Search Database Query
    const results = await prisma.$queryRaw<
        { chunk: string; distance: number }[]
    >`
        SELECT chunk,
               embedding <=> ${vectorString}::vector AS distance
        FROM "Document"
        ORDER BY distance
        LIMIT ${limit}
    `;

    return results.map(r => r.chunk);
    
}