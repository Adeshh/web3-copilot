import {prisma} from "./prisma";
import {Role} from "@/app/generated/prisma/client";

/**Create an empty conversation */
export async function createConversation(title?: string) {
    return prisma.conversation.create({data: {title}});
}

/** Append one message to conversation */
export async function addMessage(conversationId: string, role: Role, content: string) {
    const message = await prisma.message.create({
        data: {
            conversationId,
            role,
            content
        }
    });

    // Automatically set conversation title from the first user message
    if (role === "USER") {
        const conv = await prisma.conversation.findUnique({
            where: { id: conversationId },
            select: { title: true }
        });

        if (conv && !conv.title) {
            const title = content.length > 40 ? `${content.slice(0, 40)}...` : content;
            await prisma.conversation.update({
                where: { id: conversationId },
                data: { title }
            });
        }
    }

    return message;
}

/** Load a conversation with its messages, oldest first */
export async function getConversationWithMessages(id: string) {
    return prisma.conversation.findUnique({
        where: { id },
        include: { messages: { orderBy: { createdAt: "asc" } } }
    });
}

/** List conversations for a sidebar — including first message fallback. */
export function listConversations() {
  return prisma.conversation.findMany({
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      title: true,
      updatedAt: true,
      messages: {
        take: 1,
        orderBy: { createdAt: "asc" },
        select: { content: true }
      }
    },
  });
}

/** Return the given conversation's id, creating one if it's missing or unknown. */
export async function ensureConversation(id?: string): Promise<string> {
  if (id) {
    const existing = await prisma.conversation.findUnique({
      where: { id },
      select: { id: true },
    });
    if (existing) return existing.id;
  }
  const created = await prisma.conversation.create({ data: {} });
  return created.id;
}

/** Fetch the last N messages for context, ordered chronologically (oldest to newest) */
export async function getRecentMessages(conversationId: string, limit = 20) {
  // Fetch the newest messages up to the limit
  const messages = await prisma.message.findMany({
    where: { conversationId },
    orderBy: { createdAt: "desc" },
    take: limit,
    select: { role: true, content: true },
  });

  // Reverse so context reads chronologically (oldest to newest)
  return messages.reverse();
}