import { getConversationWithMessages } from "@/db/conversations";
import { auth } from "@/auth";

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

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

    if (conversation.userId && conversation.userId !== session.user.id) {
      return Response.json({ error: "Forbidden" }, { status: 403 });
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
