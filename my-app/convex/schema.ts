import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  conversations: defineTable({
    organizationId: v.string(),

    threadId: v.optional(v.string()),

    // Contact/session connected to this conversation.
    // OPTIONAL for now because existing conversations
    // were created before we added contact sessions.
    contactSessionId: v.optional(
      v.id("contactSessions")
    ),

    messages: v.array(
      v.object({
        role: v.string(),
        text: v.string(),
      })
    ),

    status: v.union(
      v.literal("unresolved"),
      v.literal("escalated"),
      v.literal("resolved")
    ),
  }),

  // Customer/session information
  contactSessions: defineTable({
    name: v.optional(v.string()),

    email: v.optional(v.string()),

    organizationId: v.string(),

    expiresAt: v.number(),

    metadata: v.optional(
      v.object({
        userAgent: v.optional(v.string()),
        language: v.optional(v.string()),
        languages: v.optional(v.string()),
        platform: v.optional(v.string()),
        vendor: v.optional(v.string()),
        screenResolution: v.optional(v.string()),
        viewportSize: v.optional(v.string()),
        timezone: v.optional(v.string()),
        timezoneOffset: v.optional(v.number()),
        cookieEnabled: v.optional(v.boolean()),
        referrer: v.optional(v.string()),
        currentUrl: v.optional(v.string()),
      })
    ),
  })
    .index("by_organizationId", ["organizationId"])
    .index("expiresAt", ["expiresAt"]),
});