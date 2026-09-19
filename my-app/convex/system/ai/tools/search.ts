import { createTool } from "@convex-dev/agent";
import { generateText } from "ai";
import { groq } from "@ai-sdk/groq";
import z from "zod";

import { internal } from "../../../_generated/api";
import rag from "../rag";

export const search = createTool({
  description:
    "ALWAYS use this tool when the user asks about the refund policy. Do not answer from your own knowledge.",

  inputSchema: z.object({
    query: z.string().describe("The topic to search for."),
  }),

  execute: async (ctx, args) => {
    if (!ctx.threadId) {
      return "Missing thread ID";
    }

    const conversation = await ctx.runQuery(
      internal.system.conversation.getByThreadId,
      {
        threadId: ctx.threadId,
      }
    );

    if (!conversation) {
      return "Conversation not found";
    }

    const result = await rag.search(ctx, {
      namespace: conversation.organizationId,
      query: args.query,
      limit: 5,
    });

    const contextText = `
Here is the relevant knowledge:

${result.text}
`;

    const response = await generateText({
      model: groq("openai/gpt-oss-20b"),
      messages: [
        {
          role: "system",
          content:
            "Answer the user's question using only the provided search results. Do not add information that is not present in the search results.",
        },
        {
          role: "user",
          content: `User asked: "${args.query}"

Search results:
${contextText}`,
        },
      ],
    });

    return response.text;
  },
});

// Namespace → separates each organization's knowledge.
// rag.add() → stores knowledge + creates embeddings.
// rag.search() → retrieves relevant knowledge.
// score → indicates how relevant the retrieved result was.
// entries → metadata/results returned by RAG.
// result.text → actual retrieved context.
// contextText → packages that context for the interpreter model.
// Second generateText() → interprets the retrieved context before returning it to the main Agent.