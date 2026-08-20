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

const ERC721_DOC = `The ERC-721 standard allows for the implementation of a standard API for Non-Fungible Tokens (NFTs) within smart contracts.
Unlike ERC-20, each ERC-721 token is completely unique and non-interchangeable.
A token contract must implement the following methods: balanceOf, ownerOf, safeTransferFrom, transferFrom, approve, and setApprovalForAll.
The ownerOf(uint256 _tokenId) function returns the address of the owner of the NFT.
The safeTransferFrom function transfers the ownership of an NFT from one address to another address safely, checking that the recipient is aware of the ERC-721 protocol to prevent tokens from being locked forever.`;

const ERC1155_DOC = `The ERC-1155 standard allows for the implementation of a standard API for Multi Token contracts within smart contracts.
ERC-1155 is a multi-token standard that can represent both fungible (like ERC-20) and non-fungible (like ERC-721) tokens in a single contract.
A token contract must implement the following methods: balanceOf, balanceOfBatch, safeTransferFrom, safeBatchTransferFrom, setApprovalForAll, and isApprovedForAll.
The safeTransferFrom(address from, address to, uint256 id, uint256 amount, bytes data) function transfers a specific amount of a specific token ID from one address to another.
The safeBatchTransferFrom function allows transferring multiple token types in a single transaction, which is more gas-efficient than multiple ERC-20 or ERC-721 transfers.
The balanceOfBatch function allows querying multiple balances in a single call, returning an array of balances for the given accounts and token IDs.
ERC-1155 tokens emit TransferSingle and TransferBatch events for single and batch transfers respectively.`;

const ALL_DOCS = [
  { source: "ERC-20", content: ERC20_DOC },
  { source: "ERC-721", content: ERC721_DOC },
  { source: "ERC-1155", content: ERC1155_DOC },
];

async function main() {
  console.log("Starting ingestion of all ERC standards...\n");

  let totalChunks = 0;

  for (const doc of ALL_DOCS) {
    console.log(`📄 Ingesting ${doc.source}...`);
    const chunks = doc.content.split("\n").filter((line) => line.trim().length > 10);

    for (const chunk of chunks) {
      console.log(`  Embedding chunk: "${chunk.slice(0, 40)}..."`);
      const vector = await embedText(chunk);
      const vectorString = `[${vector.join(",")}]`;
      const id = crypto.randomUUID();

      await prisma.$executeRaw`
        INSERT INTO "Document" (id, source, chunk, embedding)
        VALUES (${id}, ${doc.source}, ${chunk}, ${vectorString}::vector)
      `;
    }

    console.log(`  ✅ ${doc.source}: ${chunks.length} chunks ingested\n`);
    totalChunks += chunks.length;
  }

  console.log(`🎉 Done! Total chunks ingested: ${totalChunks}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());