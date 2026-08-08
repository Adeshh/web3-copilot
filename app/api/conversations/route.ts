import { listConversations } from "@/db/conversations";

export async function GET() {
  try {
    const conversations = await listConversations();

    return Response.json({
      conversations: conversations.map(({ id, title, updatedAt, messages }) => {
        const firstMessage = messages[0]?.content;
        const displayTitle =
          title ||
          (firstMessage
            ? firstMessage.length > 40
              ? `${firstMessage.slice(0, 40)}...`
              : firstMessage
            : "New Chat");

        return {
          id,
          title: displayTitle,
          updatedAt,
        };
      }),
    });
  } catch (err) {
    console.error("[/api/conversations]", err);
    return Response.json(
      { error: "Failed to load conversations." },
      { status: 500 },
    );
  }
}
