import { generateReply } from "@/ai/gemini";
import { addMessage, ensureConversation, getRecentMessages } from "@/db/conversations";
import { auth } from "@/auth";
import { findRelevantChunks } from "@/lib/retrieval";

export async function POST(req: Request) {
  try {
    const session = await auth();

    //Kick anonymous users out
    if (!session?.user?.id) {
      return Response.json({
        error: "Unauthorized",
      }, { status: 401 });
    }

    const { message, conversationId } = await req.json();

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

    //Fetch the relevent chunks from postgres via pgvector
    const relevantChunks = await findRelevantChunks(message, 6);

    //Combine them into one big text block
    const contextString = relevantChunks.join("\n\n")

    //Get all messages in the conversation to create the history
    const history = await getRecentMessages(id, 20);

    //create the prompt with the chunks and history.
    const augmentedMessage = `You are a helpful Web3 assistant. Answer the user's question using ONLY the following reference documents.
    If the answer is not in the documents, say "I don't know based on the provided context."
    --- CONTEXT ---
    ${contextString}
    --- END CONTEXT ---
    User question: ${message}`;

    //Replacing the current query message that we saved earlier with the augmented Message so the model
    //dont get the current query message again, instead get the augmented message with context and history.
    if (history.length > 0) {
      history[history.length - 1].content = augmentedMessage;
    }

    const reply = await generateReply(history);

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
