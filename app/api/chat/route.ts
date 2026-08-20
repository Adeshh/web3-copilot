import { runAgent } from "@/ai/agents";
import { addMessage, ensureConversation, getRecentMessages } from "@/db/conversations";
import { auth } from "@/auth";

export async function POST(req: Request) {
  try {
    const session = await auth();

    //Kick anonymous users out
    if (!session?.user?.id) {
      return Response.json({
        error: "Unauthorized",
      }, { status: 401 });
    }

    const { message, conversationId, useRag } = await req.json();

    if (typeof message !== "string" || message.trim() === "") {
      return Response.json(
        { error: "Body must include a non-empty 'message' string." },
        { status: 400 },
      );
    }

    // Resolves to an existing conversation, or creates one based on session
    const id = await ensureConversation(
      typeof conversationId === "string" ? conversationId : undefined, session.user.id
    );

    // Saved before the model call so a Gemini failure still leaves a record
    // of what was asked, and so createdAt reflects when it was asked.
    await addMessage(id, "USER", message);

   
    // 3. Send the entire history array (either augmented or plain) to Gemini
    const agentResult = await runAgent(message, id);

    await addMessage(id, "ASSISTANT", agentResult.content);

    // Always return the authoritative id so a stale client self-heals.
    return Response.json({ 
      reply: agentResult.content, 
      toolsUsed: agentResult.toolsUsed,
      conversationId: id 
    });
  } catch (err) {
    console.error("[/api/chat]", err);
    return Response.json(
      { error: "Failed to generate a response." },
      { status: 500 },
    );
  }
}
