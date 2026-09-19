import { Agent, stepCountIs } from "@convex-dev/agent";
import { groq } from "@ai-sdk/groq";
import { components } from "../../../_generated/api";
import { search } from "../tools/search";

export const supportAgent = new Agent(components.agent, {
  name: "Support Agent",
  languageModel: groq("openai/gpt-oss-120b"),
  tools: {
    search,
  },
  stopWhen: stepCountIs(3),
});

