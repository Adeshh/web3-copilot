import { listConversations } from "@/db/conversations";

export async function GET() {
  try {
    const conversations = await listConversations();

    return Response.json({
      conversations: conversations.map(({ id, title, updatedAt }) => ({
        id,
        title,
        updatedAt,
      })),
    });
  } catch (err) {
    console.error("[/api/conversations]", err);
    return Response.json(
      { error: "Failed to load conversations." },
      { status: 500 },
    );
  }
}
