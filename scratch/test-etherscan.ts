import { getContractSourceCode } from "../lib/blockchain";

async function run() {
  try {
    const code = await getContractSourceCode("0xdAC17F958D2ee523a2206206994597C13D831ec7");
    console.log("✅ Success! Fetched code length:", code.length);
    console.log("Snippet:", code.substring(0, 150));
  } catch (err: any) {
    console.error("❌ Error:", err.message);
  }
}

run();
