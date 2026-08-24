import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { AUDITOR_PROMPT } from "./prompts";
import { getContractSourceCode } from "./blockchain";
import { prisma } from "@/db/prisma";
import { z } from "zod"

const AuditSchema = z.object({
  summary: z.string().describe("A brief overview of the contract's overall security posture."),
  overallRisk: z.enum(["SAFE", "CAUTION", "DANGEROUS"]).describe("The overall risk level of the contract."),
  vulnerabilities: z.array(z.object({
    name: z.string(),
    severity: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]),
    description: z.string(),
    lineNumbers: z.array(z.number()).optional()
  }))
});


export async function analyzeContract(address: string) {
    // 1. Check if we already audited this contract today (cache)
    const existing = await prisma.contractAnalysis.findUnique({ where: { address } });
    if (existing) return existing;

    // 2. Fetch the raw code
    const sourceCode = await getContractSourceCode(address);

    // 3. Initialize LLM
    const llm = new ChatGoogleGenerativeAI({
        model: "gemini-3.6-flash",
        apiKey: process.env.GEMINI_API_KEY,
    });

    // 4. Force Structured Output
    const structuredLlm = llm.withStructuredOutput(AuditSchema, { name: "AuditReport" });

    // 5. Invoke the AI (It will automatically return a parsed JS object matching our Zod schema!)
    const auditReport = await structuredLlm.invoke([
        { role: "system", content: AUDITOR_PROMPT },
        { role: "user", content: `Here is the Solidity code:\n\n${sourceCode}` }
    ]);

    // 6. Save to Database
    const savedReport = await prisma.contractAnalysis.create({
        data: {
            address,
            summary: auditReport.summary,
            overallRisk: auditReport.overallRisk,
            vulnerabilities: auditReport.vulnerabilities,
        }
    });

    return savedReport;
}

