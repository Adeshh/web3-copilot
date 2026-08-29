import { NextResponse } from "next/server";
import { getWalletOverview } from "@/lib/wallet";

export async function POST(req: Request) {
    try {
        const { address } = await req.json();
        
        if (!address) {
            return NextResponse.json({ error: "Address is required" }, { status: 400 });
        }

        const overview = await getWalletOverview(address);
        return NextResponse.json(overview);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
