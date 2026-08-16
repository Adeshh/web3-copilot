import "dotenv/config";
import { findRelevantChunks } from "../lib/retrieval";
import { prisma } from "../db/prisma";

async function main() {
    console.log("Testing retrieval function...");
    const query = "What is the transfer function in ERC-20?";
    console.log(`\nQuery: "${query}"`);
    
    try {
        const chunks = await findRelevantChunks(query, 3);
        console.log(`\nFound ${chunks.length} relevant chunks:`);
        chunks.forEach((chunk, i) => {
            console.log(`\n--- Chunk ${i + 1} ---`);
            console.log(chunk);
        });
    } catch (error) {
        console.error("Error during retrieval:", error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
