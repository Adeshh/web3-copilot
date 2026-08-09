import { prisma } from "./prisma";


/** Save a generated transaction explanation to PostgreSQL */
export async function saveTransactionAnalysis(hash: string, explanation: string) {
    return prisma.transactionAnalysis.create({
        data: {
            hash: hash,
            explanation: explanation,
        },
    });
}
