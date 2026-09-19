import { v } from "convex/values";
import { internalMutation, internalQuery, mutation, query } from "../_generated/server";
import { supportAgent } from "./ai/agents/supportAgent";
import rag from "../system/ai/rag"

export const conversations = internalMutation({
  args: {
    conversationId: v.id("conversations"),
    message: v.object({
      role: v.string(),
      text: v.string(),
    }),
  },

  handler: async (ctx, args) => {
    const conversation = await ctx.db.get(args.conversationId);

    if (!conversation) {
      throw new Error("Conversation not found");
    }

    let threadId = conversation.threadId;

    if (!threadId) {
      const thread = await supportAgent.createThread(ctx, {});
      threadId = thread.threadId;
    }

    await ctx.db.patch(args.conversationId, {
      threadId,
      messages: [
        ...conversation.messages,
        args.message,
      ],
    });
  },
});

export const getConversation = internalQuery({
  args: {
    conversationId: v.id("conversations"),
  },

  handler: async (ctx, args) => {
    return await ctx.db.get(args.conversationId);
  },
});

export const getByThreadId = internalQuery({
  args: {
    threadId: v.string(),
  },

  handler: async (ctx, args) => {
    const conversation = await ctx.db
      .query("conversations")
      .filter((q) => q.eq(q.field("threadId"), args.threadId))
      .first();

    return conversation;
  },
});
