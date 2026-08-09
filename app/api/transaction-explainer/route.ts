import { explainTransaction } from "@/lib/transaction-explainer";

export async function POST(req: Request) {
    try {
        const { hash } = await req.json();

        // 1. Validate hash format
        if (typeof hash !== "string" || !hash.trim().startsWith("0x")) {
            return Response.json(
                { error: "Please provide a valid transaction hash starting with '0x'." },
                { status: 400 }
            );
        }

        // 2. Run the explain pipeline (Fetch Tx -> Prompt -> Gemini)
        const explanation = await explainTransaction(hash.trim());

        // 3. Return explanation to frontend
        return Response.json({ explanation });
    } catch (err) {
        console.error("[POST /api/transaction-explainer]", err);

        const errorMessage =
            err instanceof Error ? err.message : "Failed to explain transaction.";

        return Response.json(
            { error: errorMessage },
            { status: 400 }
        );
    }
}
