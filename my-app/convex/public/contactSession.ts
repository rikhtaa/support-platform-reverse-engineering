import { mutation } from "../_generated/server";
import { v } from "convex/values";


export const create = mutation({
  args: {
    organizationId: v.string(),
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    metadata: v.optional(
      v.object({
        userAgent: v.optional(v.string()),
        language: v.optional(v.string()),
        platform: v.optional(v.string()),
        screenResolution: v.optional(v.string()),
        viewportSize: v.optional(v.string()),
        timezone: v.optional(v.string()),
        currentUrl: v.optional(v.string()),
      })
    ),
  },

  handler: async (ctx, args) => {
    const expiresAt =
      Date.now() + 1000 * 60 * 60 * 24 * 30;

    const contactSessionId = await ctx.db.insert(
      "contactSessions",
      {
        name: args.name,
        email: args.email,
        organizationId: args.organizationId,
        expiresAt,
        metadata: args.metadata,
      }
    );

    return contactSessionId;
  },
});