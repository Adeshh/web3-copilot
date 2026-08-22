import { config } from 'dotenv';
config();
import { runAgent } from './ai/agents';
async function main() {
  try {
    const res = await runAgent("Hello, what is ETH balance of vitalik.eth?", "test-thread-3");
    console.log("Success:", res);
  } catch (e) {
    console.error("Error running agent:", e);
  }
}
main();
