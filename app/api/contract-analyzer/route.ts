import { NextResponse } from "next/server";
import { analyzeContract } from "@/lib/contract-analyzer";

export async function POST(req: Request) {
    try {
        const { address } = await req.json();
        
        if (!address) {
            return NextResponse.json({ error: "Address is required" }, { status: 400 });
        }

        const auditReport = await analyzeContract(address);
        
        return NextResponse.json(auditReport);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
