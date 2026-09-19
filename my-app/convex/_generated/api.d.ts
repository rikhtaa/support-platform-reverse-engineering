/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as message from "../message.js";
import type * as public_contactSession from "../public/contactSession.js";
import type * as public_conversation from "../public/conversation.js";
import type * as public_enhanceResponse from "../public/enhanceResponse.js";
import type * as system_ai_agents_supportAgent from "../system/ai/agents/supportAgent.js";
import type * as system_ai_rag from "../system/ai/rag.js";
import type * as system_ai_tools_search from "../system/ai/tools/search.js";
import type * as system_conversation from "../system/conversation.js";
import type * as system_files from "../system/files.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  message: typeof message;
  "public/contactSession": typeof public_contactSession;
  "public/conversation": typeof public_conversation;
  "public/enhanceResponse": typeof public_enhanceResponse;
  "system/ai/agents/supportAgent": typeof system_ai_agents_supportAgent;
  "system/ai/rag": typeof system_ai_rag;
  "system/ai/tools/search": typeof system_ai_tools_search;
  "system/conversation": typeof system_conversation;
  "system/files": typeof system_files;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {
  agent: import("@convex-dev/agent/_generated/component.js").ComponentApi<"agent">;
  rag: import("@convex-dev/rag/_generated/component.js").ComponentApi<"rag">;
};
