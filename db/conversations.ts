import {prisma} from "./prisma";
import {Role} from "@/app/generated/prisma/client";

/**Create an empty conversation */
export async function createConversation(title?: string) {
    return prisma.conversation.create({data: {title}});
}

/** Append one message to conversation */
export function addMessage(conversationId: string, role: Role, content: string) {
    return prisma.message.create({
        data: {
            conversationId,
            role,
            content
        }
    });
}

/** Load a conversation with its messages, oldest first */
export async function getConversationWithMessages(id: string) {
    return prisma.conversation.findUnique({
        where: { id },
        include: { messages: { orderBy: { createdAt: "asc" } } }
    });
}

/** List conversations for a sidebar — no message bodies. */
export function listConversations() {
  return prisma.conversation.findMany({
    orderBy: { updatedAt: "desc" },
    select: { id: true, title: true, updatedAt: true },
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