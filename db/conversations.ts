import { prisma } from "./prisma";
import { Role } from "@/app/generated/prisma/client";

/**Create an empty conversation */
export async function createConversation(title?: string, userId?: string) {
  return prisma.conversation.create({ data: { title, userId } });
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

export function listConversations(userId?: string) {
  return prisma.conversation.findMany({
    where: userId ? { userId } : {},
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      title: true,
      updatedAt: true,
    },
  });
}

export async function ensureConversation(id?: string, userId?: string): Promise<string> {
  if (id) {
    const existing = await prisma.conversation.findUnique({
      where: { id },
      select: { id: true, userId: true },
    });
    
    if (existing) {
      // If the conversation is anonymous (no userId) and the user is logged in, claim it!
      if (!existing.userId && userId) {
        await prisma.conversation.update({
          where: { id },
          data: { userId }
        });
      } 
      // If the conversation belongs to someone else, force a new one
      else if (existing.userId && existing.userId !== userId) {
        const created = await createConversation(undefined, userId);
        return created.id;
      }
      return existing.id;
    }
  }
  const created = await createConversation(undefined, userId);
  return created.id;
}

/**Return the last 20 messages for given conversation id */
export async function getRecentMessages(conversationId: string, limit = 20) {
  const messages = await prisma.message.findMany({
    where: { conversationId },
    orderBy: { createdAt: "desc" },//Fetch newest 20
    take: limit,
    select: { role: true, content: true },
  });
  //Reverse the array so that it is in order with the conversation history oldest to newest
  return messages.reverse();
}