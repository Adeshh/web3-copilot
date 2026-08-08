import { generateReply } from "@/ai/gemini";
import { addMessage, ensureConversation, getRecentMessages } from "@/db/conversations";

export async function POST(req: Request) {
  try {
    const { message, conversationId } = await req.json();

    if (typeof message !== "string" || message.trim() === "") {
      return Response.json(
        { error: "Body must include a non-empty 'message' string." },
        { status: 400 },
      );
    }

    // Resolves to an existing conversation, or creates one when the id is absent/stale
    const id = await ensureConversation(
      typeof conversationId === "string" ? conversationId : undefined,
    );

    // Save user prompt in DB before AI call so a Gemini failure leaves a record
    await addMessage(id, "USER", message);

    // Fetch recent conversation context (last 20 messages including current query)
    const history = await getRecentMessages(id, 20);

    // Generate AI response using full conversation context
    const reply = await generateReply(history);

    // Save AI response in DB
    await addMessage(id, "ASSISTANT", reply);

    // Return authoritative conversationId and reply text
    return Response.json({ reply, conversationId: id });
  } catch (err) {
    console.error("[/api/chat]", err);
    return Response.json(
      { error: "Failed to generate a response." },
      { status: 500 },
    );
  }
}
  