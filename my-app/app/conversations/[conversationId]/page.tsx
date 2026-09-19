"use client";

import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import {
  useAction,
  useMutation,
  usePaginatedQuery,
  useQuery,
} from "convex/react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";

export default function ConversationPage() {
  const params = useParams();
  const [isEnhancing, setIsEnhancing] = useState(false);

  const conversationId =
    params.conversationId as Id<"conversations">;

  const conversation = useQuery(
    api.public.conversation.getOne,
    {
      conversationId,
    }
  );

  const conversations = useQuery(
    api.public.conversation.getMany
  );

  // Messages with pagination
  const {
    results: messages,
    status: messagesStatus,
    loadMore,
  } = usePaginatedQuery(
    api.message.getMany,
    conversation?.threadId
      ? {
          threadId: conversation.threadId,
        }
      : "skip",
    {
      initialNumItems: 20,
    }
  );
  

  const createOperatorMessage = useMutation(
    api.message.createOperatorMessage
  );

  const enhanceResponse = useAction(
  api.public.enhanceResponse.enhanceResponse
);

  async function handleEnhance() {
  if (!text.trim() || isEnhancing) return;

  setIsEnhancing(true);

  try {
    const enhanced = await enhanceResponse({
      prompt: text.trim(),
    });

    setText(enhanced);
  } catch (error) {
    console.error("ENHANCE FAILED:", error);
  } finally {
    setIsEnhancing(false);
  }
}

  const updateStatus = useMutation(
    api.public.conversation.updateStatus
  );

  const [text, setText] = useState("");
  const [isSending, setIsSending] = useState(false);

  async function handleStatusChange(
    status:
      | "unresolved"
      | "escalated"
      | "resolved"
  ) {
    try {
      await updateStatus({
        conversationId,
        status,
      });
    } catch (error) {
      console.error(
        "STATUS UPDATE FAILED:",
        error
      );
    }
  }

  async function handleSend(
    e: React.FormEvent
  ) {
    e.preventDefault();

    if (!text.trim() || isSending) return;

    setIsSending(true);

    try {
      await createOperatorMessage({
        conversationId,
        message: text.trim(),
      });

      setText("");
    } catch (error) {
      console.error(error);
    } finally {
      setIsSending(false);
    }
  }

  if (conversation === undefined) {
    return (
      <div className="flex h-screen items-center justify-center bg-white text-sm text-gray-500">
        Loading conversation...
      </div>
    );
  }

  if (conversation === null) {
    return (
      <div className="flex h-screen items-center justify-center bg-white text-sm text-gray-500">
        Conversation not found.
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-white text-gray-900">

      {/* LEFT — Conversation inbox */}
      <aside className="flex w-[360px] shrink-0 flex-col border-r border-gray-200">

        {/* Inbox header */}
        <div className="flex h-[72px] items-center justify-between border-b border-gray-200 px-5">
          <div className="flex items-center gap-3">
            <span className="text-xl text-gray-700">
              ☰
            </span>

            <span className="text-lg font-medium">
              All
            </span>

            <span className="text-gray-500">
              ⌄
            </span>
          </div>

          <button className="text-xl text-gray-600">
            •••
          </button>
        </div>

        {/* Conversation list */}
        <div className="flex-1 overflow-y-auto">

          {conversations === undefined ? (
            <div className="p-5 text-sm text-gray-500">
              Loading conversations...
            </div>
          ) : conversations.length === 0 ? (
            <div className="p-5 text-sm text-gray-500">
              No conversations yet.
            </div>
          ) : (
            conversations.map((item) => {
              const isSelected =
                item._id === conversationId;

              const lastMessage =
                item.messages.length > 0
                  ? item.messages[
                      item.messages.length - 1
                    ].text
                  : "No messages yet";

              return (
                <Link
                  key={item._id}
                  href={`/conversations/${item._id}`}
                  className={`flex h-[108px] items-center gap-4 border-b border-gray-100 px-5 transition ${
                    isSelected
                      ? "bg-gray-50"
                      : "hover:bg-gray-50"
                  }`}
                >
                  {/* Avatar */}
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-sky-300 text-lg font-medium text-white">
                    C
                  </div>

                  {/* Preview */}
                  <div className="min-w-0 flex-1">

                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-sm font-medium text-gray-700">
                        Customer
                      </p>

                      <span className="shrink-0 text-xs text-gray-400">
                        {item.messages.length}
                      </span>
                    </div>

                    <p className="mt-2 truncate text-sm text-gray-500">
                      ↪ {lastMessage}
                    </p>

                  </div>

                  {/* Status indicator */}
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-green-500 text-sm text-white">
                    ✓
                  </div>
                </Link>
              );
            })
          )}

        </div>
      </aside>

      {/* RIGHT — Conversation */}
      <main className="flex min-w-0 flex-1 flex-col">

        {/* Conversation header */}
        <header className="flex h-[72px] shrink-0 items-center justify-between border-b border-gray-200 px-6">

          <div>
  <p className="text-sm font-medium text-gray-800">
    {conversation.contactSession?.name ||
      "Customer"}
  </p>

  <p className="mt-1 text-xs text-gray-400">
    {conversation.contactSession?.email ||
      "No email provided"}
  </p>
</div>
          {/* Status */}
          <select
            value={
              conversation.status ??
              "unresolved"
            }
            onChange={(e) =>
              handleStatusChange(
                e.target.value as
                  | "unresolved"
                  | "escalated"
                  | "resolved"
              )
            }
            className={`rounded-lg px-4 py-2 text-sm font-medium text-white outline-none ${
              conversation.status ===
              "resolved"
                ? "bg-green-600"
                : conversation.status ===
                  "escalated"
                ? "bg-orange-500"
                : "bg-gray-500"
            }`}
          >
            <option value="unresolved">
              Unresolved
            </option>

            <option value="escalated">
              Escalated
            </option>

            <option value="resolved">
              ✓ Resolved
            </option>
          </select>

        </header>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto bg-gray-50 px-8 py-6">

          {/* Load older messages */}
          {messagesStatus ===
            "CanLoadMore" && (
            <div className="mb-6 flex justify-center">
              <button
                type="button"
                onClick={() =>
                  loadMore(20)
                }
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                Load older messages
              </button>
            </div>
          )}

          {messagesStatus ===
            "LoadingMore" && (
            <div className="mb-6 text-center text-sm text-gray-500">
              Loading older messages...
            </div>
          )}

          {/* Initial loading */}
          {messagesStatus ===
          "LoadingFirstPage" ? (
            <div className="text-sm text-gray-500">
              Loading messages...
            </div>
          ) : messages.length === 0 ? (
            <div className="flex h-full items-center justify-center text-sm text-gray-500">
              No messages yet.
            </div>
          ) : (
            <div className="mx-auto flex max-w-3xl flex-col gap-5">

              {messages
                .filter(
                  (message) =>
                    message.text?.trim()
                )
                .slice()
                .reverse()
                .map((message) => {

                  const isOperator =
                    message.agentName ===
                    "Operator";

                  const isAI =
                    !isOperator &&
                    Boolean(message.model);

                  const isCustomer =
                    !isOperator && !isAI;

                  return (
                    <div
                      key={message.id}
                      className={`flex ${
                        isCustomer
                          ? "justify-start"
                          : "justify-end"
                      }`}
                    >

                      {/* Customer avatar */}
                      {isCustomer && (
                        <div className="mr-3 mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sky-300 text-sm font-medium text-white">
                          C
                        </div>
                      )}

                      <div
                        className={`max-w-[70%] ${
                          isCustomer
                            ? ""
                            : "text-right"
                        }`}
                      >

                        {/* Sender */}
                        <p
                          className={`mb-1 px-1 text-xs font-medium ${
                            isCustomer
                              ? "text-gray-500"
                              : isOperator
                              ? "text-blue-600"
                              : "text-gray-500"
                          }`}
                        >
                          {isCustomer
                            ? "Customer"
                            : isOperator
                            ? "Human Operator"
                            : "AI Assistant"}
                        </p>

                        {/* Message */}
                        <div
                          className={`rounded-2xl px-5 py-3 text-[15px] leading-7 ${
                            isCustomer
                              ? "rounded-tl-md border border-gray-200 bg-white text-gray-800"
                              : isOperator
                              ? "rounded-tr-md bg-blue-500 text-white"
                              : "rounded-tr-md bg-gray-900 text-white"
                          }`}
                        >
                          {message.text}
                        </div>

                      </div>
                    </div>
                  );
                })}

            </div>
          )}

        </div>

        {/* Composer */}
        {/* Composer */}
<div className="border-t border-gray-200 bg-white p-4">

  <form
    onSubmit={handleSend}
    className="mx-auto max-w-3xl"
  >

    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Reply to customer..."
        rows={3}
        disabled={
          isEnhancing ||
          conversation.status === "resolved"
        }
        className="w-full resize-none border-0 px-4 py-3 text-sm text-gray-800 outline-none placeholder:text-gray-400"
      />

      <div className="flex items-center justify-between border-t border-gray-100 px-3 py-2">

        {/* Enhance */}
        <button
          type="button"
          onClick={handleEnhance}
          disabled={
            isEnhancing ||
            isSending ||
            !text.trim() ||
            conversation.status === "resolved"
          }
          className="rounded-lg px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {isEnhancing
            ? "Enhancing..."
            : "✨ Enhance"}
        </button>

        {/* Send */}
        <button
          type="submit"
          disabled={
            isSending ||
            isEnhancing ||
            !text.trim() ||
            conversation.status === "resolved"
          }
          className="rounded-lg bg-blue-500 px-5 py-2 text-sm font-medium text-white transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {isSending
            ? "Sending..."
            : "Send"}
        </button>

      </div>
    </div>

  </form>

</div>

      </main>
    </div>
  );
}