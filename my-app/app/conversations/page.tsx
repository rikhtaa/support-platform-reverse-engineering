"use client";

import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import Link from "next/link";

export default function ConversationsPage() {
  const conversations = useQuery(
    api.public.conversation.getMany
  );

  if (conversations === undefined) {
    return (
      <div className="flex h-screen items-center justify-center bg-white text-sm text-gray-500">
        Loading conversations...
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-white">

      {/* Sidebar */}
      <aside className="w-[360px] shrink-0 border-r border-gray-200">

        {/* Header */}
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

        {/* Conversations */}
        <div className="overflow-y-auto">

          {conversations.length === 0 ? (
            <div className="p-5 text-sm text-gray-500">
              No conversations yet.
            </div>
          ) : (
            conversations.map((conversation) => {

              const lastMessage =
                conversation.messages.length > 0
                  ? conversation.messages[
                      conversation.messages.length - 1
                    ].text
                  : "No messages yet";

              return (
                <Link
                  key={conversation._id}
                  href={`/conversations/${conversation._id}`}
                  className="flex h-[108px] items-center gap-4 border-b border-gray-100 px-5 transition hover:bg-gray-50"
                >

                  {/* Avatar */}
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-sky-300 text-lg font-medium text-white">
                    C
                  </div>

                  {/* Preview */}
                  <div className="min-w-0 flex-1">

                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-700">
                        Customer
                      </p>

                      <span className="text-xs text-gray-400">
                        {conversation.messages.length}
                      </span>
                    </div>

                    <p className="mt-2 truncate text-sm text-gray-500">
                      ↪ {lastMessage}
                    </p>

                  </div>

                  {/* Status */}
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-green-500 text-sm text-white">
                    ✓
                  </div>

                </Link>
              );
            })
          )}

        </div>

      </aside>

      {/* Empty main area */}
      <main className="flex flex-1 items-center justify-center bg-gray-50">
        <div className="text-center">

          <h1 className="text-lg font-medium text-gray-700">
            Conversations
          </h1>

          <p className="mt-2 text-sm text-gray-400">
            Select a conversation to view the messages.
          </p>

        </div>
      </main>

    </div>
  );
}