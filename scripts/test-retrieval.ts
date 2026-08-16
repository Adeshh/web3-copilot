import "dotenv/config";
import { findRelevantChunks } from "@/lib/retrieval";
import { prisma } from "@/db/prisma";


async function main() {
    try {
        const testQuestion = "What is the transfer function in ERC-20?";
        console.log(`Asking: "${testQuestion}"\n`);
    
        // Call the function and ask for 3 chunks
        const chunks = await findRelevantChunks(testQuestion, 3);
        console.log(`Found ${chunks.length} chunks! Here they are:`);
    
        chunks.forEach((chunk, index) => {
            console.log(`\n--- Chunk ${index + 1} ---`);
            console.log(chunk);
        });

    } catch (error) {
        console.error("Oops, something went wrong:", error);
    } finally {
        // This makes sure the script closes when it's done!
        await prisma.$disconnect();
    }
}

main();
