import { NextResponse } from "next/server";
import { getWalletInsights } from "@/lib/ai-insights";

export async function POST(req: Request) {
    try {
        const { address } = await req.json();
        if (!address) return NextResponse.json({ error: "Address is required" }, { status: 400 });

        const txUrl = `https://api.etherscan.io/v2/api?chainid=1&module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&page=1&offset=20&sort=desc&apikey=${process.env.ETHERSCAN_API_KEY}`;
        const txResponse = await fetch(txUrl).then(res => res.json());
        console.log("Etherscan Insights Response:", txResponse);
        
        if (txResponse.status === "0" && typeof txResponse.result === "string") {
            if (txResponse.result === "Max rate limit reached") {
                 console.warn("Etherscan Rate Limit Hit. Consider adding a small delay or upgrading API key.");
                 return NextResponse.json({ 
                    spendingPatterns: "Could not analyze: Etherscan rate limit hit.", 
                    defiActivity: "Please wait 1 second and try again.", 
                    riskFlags: [] 
                 });
            }
            if (txResponse.message === "No transactions found") {
                return NextResponse.json({ spendingPatterns: "No activity", defiActivity: "None", riskFlags: [] });
            }
            throw new Error(`Etherscan API Error: ${txResponse.result}`);
        }

        if (!txResponse.result || !Array.isArray(txResponse.result) || txResponse.result.length === 0) {
            return NextResponse.json({ spendingPatterns: "No activity", defiActivity: "None", riskFlags: [] });
        }

        const insights = await getWalletInsights(txResponse.result);
        return NextResponse.json(insights);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
