import { getConversationWithMessages } from "@/db/conversations";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const conversationId = searchParams.get("conversationId");

    if (!conversationId || conversationId.trim() === "") {
      return Response.json(
        { error: "Query must include a non-empty 'conversationId'." },
        { status: 400 },
      );
    }

    const conversation = await getConversationWithMessages(conversationId);

    if (!conversation) {
      return Response.json(
        { error: "Conversation not found." },
        { status: 404 },
      );
    }

    return Response.json({
      conversationId: conversation.id,
      messages: conversation.messages.map(({ id, role, content, createdAt }) => ({
        id,
        role,
        content,
        createdAt,
      })),
    });
  } catch (err) {
    console.error("[/api/messages]", err);
    return Response.json(
      { error: "Failed to load messages." },
      { status: 500 },
    );
  }
}
