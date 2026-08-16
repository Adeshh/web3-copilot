import "dotenv/config";
import { prisma } from "../db/prisma";
import { embedText } from "../lib/embeddings";
//A mini ERC20 doc version

const ERC20_DOC = `The ERC-20 standard allows for the implementation of a standard API for tokens within smart contracts.
This standard provides basic functionality to transfer tokens, as well as allow tokens to be approved so they can be spent by another on-chain third party.
A token contract must implement the following methods: totalSupply, balanceOf, transfer, transferFrom, approve, and allowance.
The transfer(address to, uint256 value) function moves the amount of tokens from the caller's account to the recipient account. It must emit a Transfer event.
The approve(address spender, uint256 value) function allows a spender to withdraw from your account, multiple times, up to the value amount. It must emit an Approval event.
The allowance(address owner, address spender) function returns the amount which spender is still allowed to withdraw from owner.`;

async function main() {
    console.log("starting ingestion");

   // 1. Split the document into chunks (by sentences/lines)
  const chunks = ERC20_DOC.split("\n").filter((line) => line.trim().length > 10);
  // 2. Loop over each chunk, embed it, and save it to the DB
  for (const chunk of chunks) {
    console.log(`Embedding chunk: "${chunk.slice(0, 30)}..."`);
    const vector = await embedText(chunk);
    // Prisma requires a raw SQL query to insert unsupported 'vector' types
    // We cast the JSON array string into the Postgres vector type
    const vectorString = `[${vector.join(",")}]`;
    const id = crypto.randomUUID();
    
    await prisma.$executeRaw`
      INSERT INTO "Document" (id, source, chunk, embedding)
      VALUES (${id}, 'ERC-20', ${chunk}, ${vectorString}::vector)
    `;
  }
  console.log(`✅ Successfully ingested ${chunks.length} chunks!`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());