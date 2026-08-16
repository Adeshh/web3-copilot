import { listConversations } from "@/db/conversations";
import { auth } from "@/auth";

export async function GET() {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const conversations = await listConversations(session.user.id);

    return Response.json({
      conversations: conversations.map(({ id, title, updatedAt }) => {
        return {
          id,
          title: title || "New Chat",
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
