import { NextResponse } from "next/server";
import { analyzeContract } from "@/lib/contract-analyzer";
import { getContractSourceCode } from "@/lib/blockchain";


export async function POST(req: Request) {
    try {
        const { address } = await req.json();
        
        if (!address) {
            return NextResponse.json({ error: "Address is required" }, { status: 400 });
        }

        const [auditReport, sourceCode] = await Promise.all([
            analyzeContract(address),
            getContractSourceCode(address)
        ]);
        
        return NextResponse.json({ auditReport, sourceCode });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
