import { action } from "../_generated/server";
import { v } from "convex/values";
import { generateText } from "ai";
import { groq } from "@ai-sdk/groq";

const OPERATOR_MESSAGE_ENHANCEMENT_PROMPT = `
You are an assistant that improves customer support operator messages.

Your job is to make the operator's message:

- Professional yet friendly
- Clear and concise
- Empathetic when appropriate
- Natural and conversational

Improve:
- Grammar and spelling
- Clarity
- Sentence structure
- Logical flow
- Redundancy

Preserve:
- The original meaning and intent
- Prices, dates, names, numbers, and other specific details
- Technical terms that are intentionally used
- The operator's general tone

Rules:
- Do not add information that is not in the original message.
- Do not change the meaning.
- Do not make the message unnecessarily long.
- Keep it as a single paragraph unless a list is clearly intended.
- Return ONLY the enhanced message.
`;

export const enhanceResponse = action({
  args: {
    prompt: v.string(),
  },

  handler: async (ctx, args) => {
    const response = await generateText({
      model: groq("openai/gpt-oss-120b"),

      messages: [
        {
          role: "system",
          content:
            OPERATOR_MESSAGE_ENHANCEMENT_PROMPT,
        },
        {
          role: "user",
          content: args.prompt,
        },
      ],
    });

    return response.text;
  },
});