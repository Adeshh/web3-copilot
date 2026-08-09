import { getTransaction } from "../lib/blockchain";

const TEST_HASH = "0x5c504ed432cb51138bcf09aa5e8a410dd4a1e204ef84bfed1be16dfba1b22060";
console.log("HI")
try {
    const tx = await getTransaction(TEST_HASH);
    console.log(tx);
} catch (err) {
    console.error("Error:", err);
}
