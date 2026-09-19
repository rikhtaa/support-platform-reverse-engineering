import { action, mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { components, internal } from "./_generated/api";
import { supportAgent } from "./system/ai/agents/supportAgent";
import { saveMessage } from "@convex-dev/agent";
import { paginationOptsValidator } from "convex/server";

// Temporary organization
const ORGANIZATION_ID = "org_123";

// FOR WIDGET
// FOR WIDGET
export const create = action({
  args: {
    conversationId: v.id("conversations"),
    message: v.object({
      text: v.string(),
    }),
  },

  handler: async (ctx, args): Promise<string> => {
    // Get conversation
    const conversation = await ctx.runQuery(
      internal.system.conversation.getConversation,
      {
        conversationId: args.conversationId,
      }
    );

    if (!conversation) {
      throw new Error("Conversation not found");
    }

    // Organization protection
    if (conversation.organizationId !== ORGANIZATION_ID) {
      throw new Error("Unauthorized");
    }

    if (!conversation.threadId) {
      throw new Error("Conversation has no thread");
    }

    // Save customer message
    await ctx.runMutation(
      internal.system.conversation.conversations,
      {
        conversationId: args.conversationId,
        message: {
          role: "user",
          text: args.message.text,
        },
      }
    );

    // IMPORTANT:
    // AI should only respond while the conversation is unresolved.
    // Escalated = human operator handles it.
    // Resolved = conversation is closed.
    if (
      conversation.status === "escalated" ||
      conversation.status === "resolved"
    ) {
      return "";
    }

    // Generate AI response
    const { text } = await supportAgent.generateText(
      ctx,
      { threadId: conversation.threadId },
      {
        prompt: args.message.text,
      }
    );

    // Save AI response
    await ctx.runMutation(
      internal.system.conversation.conversations,
      {
        conversationId: args.conversationId,
        message: {
          role: "assistant",
          text,
        },
      }
    );

    return text;
  },
});

// GET MESSAGES
export const getMany = query({
  args: {
    threadId: v.string(),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    return await supportAgent.listMessages(ctx, {
      threadId: args.threadId,
      paginationOpts: args.paginationOpts,
    });
  },
});

// FOR WEB OPERATOR
export const createOperatorMessage = mutation({
  args: {
    conversationId: v.id("conversations"),
    message: v.string(),
  },

  handler: async (ctx, args) => {
    const conversation = await ctx.db.get(
      args.conversationId
    );

    if (!conversation) {
      throw new Error("Conversation not found");
    }

    // Organization protection
    if (conversation.organizationId !== ORGANIZATION_ID) {
      throw new Error("Unauthorized");
    }

    if (!conversation.threadId) {
      throw new Error("Conversation has no thread");
    }

    await saveMessage(ctx, components.agent, {
      threadId: conversation.threadId,
      agentName: "Operator",
      message: {
        role: "assistant",
        content: args.message,
      },
    });

    return args.message;
  },
});