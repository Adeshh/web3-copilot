import { BaseCheckpointSaver, Checkpoint, CheckpointMetadata, CheckpointTuple, PendingWrite } from "@langchain/langgraph-checkpoint";
import { RunnableConfig } from "@langchain/core/runnables";
import { prisma } from "@/db/prisma";

export class PrismaSaver extends BaseCheckpointSaver {
  
  // 1. GET: How LangGraph reads the memory when the conversation resumes
  async getTuple(config: RunnableConfig): Promise<CheckpointTuple | undefined> {
    const threadId = config.configurable?.thread_id;
    if (!threadId) return undefined;
    
    const state = await prisma.agentState.findFirst({
      where: { threadId },
      orderBy: { createdAt: 'desc' }
    });
    
    if (!state) return undefined;
    
    return {
      config,
      checkpoint: state.checkpoint as any,
      metadata: { source: "loop" as const, step: -1, parents: {} },
      pendingWrites: []
    };
  }

  // 2. PUT: How LangGraph saves the memory after it finishes thinking
  async put(config: RunnableConfig, checkpoint: Checkpoint, metadata: CheckpointMetadata, newVersions: Record<string, number | string>): Promise<RunnableConfig> {
    const threadId = config.configurable?.thread_id;
    if (!threadId) throw new Error("Thread ID is required");

    await prisma.agentState.create({
      data: {
        threadId,
        checkpoint: checkpoint as any,
      }
    });

    return {
      configurable: {
        thread_id: threadId,
        checkpoint_ns: config.configurable?.checkpoint_ns ?? "",
        checkpoint_id: checkpoint.id,
      }
    };
  }

  // (These last two are required by the LangGraph interface, but we don't need them for basic chat)
  async *list(config: RunnableConfig, options?: any): AsyncGenerator<CheckpointTuple> {
    yield* [];
  }
  
  async putWrites(config: RunnableConfig, writes: PendingWrite[], taskId: string): Promise<void> {}

  // 3. DELETE: Clear the thread memory (required by BaseCheckpointSaver)
  async deleteThread(threadId: string): Promise<void> {
    await prisma.agentState.deleteMany({
      where: { threadId }
    });
  }
}
