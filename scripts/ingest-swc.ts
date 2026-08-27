import "dotenv/config";
import { prisma } from "../db/prisma";
import { embedText } from "../lib/embeddings";

const swcEntries = [
  "SWC-107: Reentrancy. Occurs when a contract calls an external contract before updating its own state. Attackers can recursively call the original function to drain funds. Always use the Checks-Effects-Interactions pattern.",
  "SWC-101: Integer Overflow and Underflow. Occurs in Solidity <0.8.0 when arithmetic operations exceed the maximum or minimum size of a type. Always use SafeMath for older contracts.",
  "SWC-112: Delegatecall to Untrusted Callee. Using delegatecall with untrusted inputs allows an attacker to execute malicious code in the context of your contract, potentially destroying it or stealing funds.",
  "SWC-115: tx.origin Authorization. Using tx.origin for authorization is vulnerable to phishing attacks. A malicious contract can trick the owner into interacting with it, allowing the attacker to bypass access controls. Use msg.sender instead."
];

async function ingestSWC() {
  console.log("📥 Ingesting SWC Vulnerability Data into pgvector...");
  
  for (const entry of swcEntries) {
    const embedding = await embedText(entry);
    const vectorString = `[${embedding.join(",")}]`;
    
    const id = crypto.randomUUID();
    await prisma.$executeRaw`
      INSERT INTO "Document" (id, source, chunk, embedding)
      VALUES (${id}, 'SWC-Registry', ${entry}, ${vectorString}::vector)
    `;
    console.log(`✅ Embedded: ${entry.substring(0, 40)}...`);
  }
  console.log("🎉 SWC Ingestion Complete!");
}

ingestSWC();
