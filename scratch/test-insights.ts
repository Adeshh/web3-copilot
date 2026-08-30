import { getWalletInsights } from "../lib/ai-insights";

async function run() {
    const address = "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045";
    const txUrl = `https://api.etherscan.io/api?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&page=1&offset=20&sort=desc&apikey=${process.env.ETHERSCAN_API_KEY}`;
    
    console.log("Fetching:", txUrl);
    const txResponse = await fetch(txUrl).then(res => res.json());
    console.log("Status:", txResponse.status);
    console.log("Message:", txResponse.message);
    console.log("Result is Array?", Array.isArray(txResponse.result));
    console.log("Result length:", Array.isArray(txResponse.result) ? txResponse.result.length : "N/A");
    
    if (typeof txResponse.result === 'string') {
        console.log("String Result:", txResponse.result);
    }
}

run().catch(console.error);
