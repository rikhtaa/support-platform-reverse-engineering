import { mutation, query } from "../_generated/server";
import { v } from "convex/values";
import { supportAgent } from "../system/ai/agents/supportAgent";

const ORGANIZATION_ID = "org_123";

export const getMany = query({
  args: {},

  handler: async (ctx) => {
    return await ctx.db
      .query("conversations")
      .filter((q) =>
        q.eq(q.field("organizationId"), ORGANIZATION_ID)
      )
      .order("desc")
      .collect();
  },
});

export const getOne = query({
  args: {
    conversationId: v.id("conversations"),
  },

  handler: async (ctx, args) => {
    const conversation = await ctx.db.get(
      args.conversationId
    );

    if (!conversation) {
      return null;
    }

    if (
      conversation.organizationId !==
      ORGANIZATION_ID
    ) {
      throw new Error("Unauthorized");
    }

    // Get customer/contact information
    let contactSession = null;

    if (conversation.contactSessionId) {
      contactSession = await ctx.db.get(
        conversation.contactSessionId
      );
    }

    return {
      ...conversation,
      contactSession,
    };
  },
});

export const updateStatus = mutation({
  args: {
    conversationId: v.id("conversations"),

    status: v.union(
      v.literal("unresolved"),
      v.literal("escalated"),
      v.literal("resolved")
    ),
  },

  handler: async (ctx, args) => {
    const conversation = await ctx.db.get(
      args.conversationId
    );

    if (!conversation) {
      throw new Error("Conversation not found");
    }

    if (conversation.organizationId !== ORGANIZATION_ID) {
      throw new Error("Unauthorized");
    }

    await ctx.db.patch(args.conversationId, {
      status: args.status,
    });

    return args.status;
  },
});

// Create a new customer conversation
export const create = mutation({
  args: {
    contactSessionId: v.id("contactSessions"),
  },

  handler: async (ctx, args) => {
    // Verify contact session
    const contactSession = await ctx.db.get(
      args.contactSessionId
    );

    if (!contactSession) {
      throw new Error("Contact session not found");
    }

    if (
      contactSession.organizationId !==
      contactSession.organizationId
    ) {
      throw new Error("Unauthorized");
    }

    if (
      contactSession.expiresAt < Date.now()
    ) {
      throw new Error("Contact session expired");
    }

    // Create Agent thread
    const { threadId } =
      await supportAgent.createThread(ctx, {
        userId: contactSession.organizationId,
      });

    // Create conversation
    const conversationId =
      await ctx.db.insert("conversations", {
        organizationId: contactSession.organizationId,
        threadId,
        contactSessionId:
          args.contactSessionId,
        messages: [],
        status: "unresolved",
      });

    return {
      conversationId,
      threadId,
    };
  },
});