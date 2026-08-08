import { generateReply } from "@/ai/gemini";
import { addMessage, ensureConversation } from "@/db/conversations";

export async function POST(req: Request) {
  try {
    const { message, conversationId } = await req.json();

    if (typeof message !== "string" || message.trim() === "") {
      return Response.json(
        { error: "Body must include a non-empty 'message' string." },
        { status: 400 },
      );
    }

    // Resolves to an existing conversation, or creates one when the id is
    // absent or stale (e.g. a localStorage value from a deleted thread).
    const id = await ensureConversation(
      typeof conversationId === "string" ? conversationId : undefined,
    );

    // Saved before the model call so a Gemini failure still leaves a record
    // of what was asked, and so createdAt reflects when it was asked.
    await addMessage(id, "USER", message);

    const reply = await generateReply(message);

    await addMessage(id, "ASSISTANT", reply);

    // Always return the authoritative id so a stale client self-heals.
    return Response.json({ reply, conversationId: id });
  } catch (err) {
    console.error("[/api/chat]", err);
    return Response.json(
      { error: "Failed to generate a response." },
      { status: 500 },
    );
  }
}
  