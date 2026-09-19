"use client";

import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import {
  useAction,
  useMutation,
} from "convex/react";
import { useEffect, useState } from "react";

export const WidgetChatScreen = ({
  organizationId,
}: {
  organizationId: string;
}) => {
  const message = useAction(api.message.create);
  const addFile = useAction(api.system.files.addFile);

  const createContactSession = useMutation(
  api.public.contactSession.create
);

  const createConversation = useMutation(
    api.public.conversation.create
  );

  const [conversationId, setConversationId] =
    useState<Id<"conversations"> | null>(null);

  const [response, setResponse] =
    useState<string | null>(null);

  const [isLoading, setIsLoading] =
    useState(false);

  const [isInitializing, setIsInitializing] =
    useState(true);

  // Create/load contact session + conversation
  useEffect(() => {
    async function initialize() {
      try {
        // Check for existing session
        let contactSessionId =
          localStorage.getItem(
            "contactSessionId"
          ) as Id<"contactSessions"> | null;

        // Check for existing conversation
        let storedConversationId =
          localStorage.getItem(
            "conversationId"
          ) as Id<"conversations"> | null;

        // Create contact session if needed
        if (!contactSessionId) {
          contactSessionId =
            await createContactSession({
              organizationId,
              name: "Test Customer",
              email:
                "customer@example.com",
              metadata: {
                userAgent:
                  navigator.userAgent,
                language:
                  navigator.language,
                platform:
                  navigator.platform,
                screenResolution:
                  `${window.screen.width}x${window.screen.height}`,
                viewportSize:
                  `${window.innerWidth}x${window.innerHeight}`,
                timezone:
                  Intl.DateTimeFormat().resolvedOptions()
                    .timeZone,
                currentUrl:
                  window.location.href,
              },
            });

          localStorage.setItem(
            "contactSessionId",
            contactSessionId
          );
        }

        // Create conversation if needed
        if (!storedConversationId) {
          const result =
            await createConversation({
              contactSessionId,
            });

          storedConversationId =
            result.conversationId;

          localStorage.setItem(
            "conversationId",
            storedConversationId
          );
        }

        setConversationId(
          storedConversationId
        );
      } catch (error) {
        console.error(
          "INITIALIZATION FAILED:",
          error
        );
      } finally {
        setIsInitializing(false);
      }
    }

    initialize();
  }, [
    createContactSession,
    createConversation,
  ]);

  if (isInitializing) {
    return (
      <p>
        Starting conversation...
      </p>
    );
  }

  if (!conversationId) {
    return (
      <p>
        Unable to start conversation.
      </p>
    );
  }

  return (
    <div>
      <main>
        {/* Chat */}
        <form
          onSubmit={async (e) => {
            e.preventDefault();

            const form = e.currentTarget;

            const input =
              form.elements.namedItem(
                "text"
              ) as HTMLInputElement;

            const text = input.value;

            if (!text.trim()) return;

            setIsLoading(true);
            setResponse(null);

            try {
              const result =
                await message({
                  conversationId,
                  message: {
                    text,
                  },
                });

              setResponse(result);

              form.reset();
            } catch (error) {
              console.error(error);
              setResponse(
                "Something went wrong."
              );
            } finally {
              setIsLoading(false);
            }
          }}
        >
          <input
            name="text"
            placeholder="Ask something..."
          />

          <button
            type="submit"
            className="bg-amber-950 px-4 py-2 text-white"
          >
            Send
          </button>
        </form>

        {/* File Upload */}
        <form
          onSubmit={async (e) => {
            e.preventDefault();

            const form = e.currentTarget;

            const input =
              form.elements.namedItem(
                "file"
              ) as HTMLInputElement;

            const file =
              input.files?.[0];

            if (!file) return;

            try {
              const buffer =
                await file.arrayBuffer();

              const result =
                await addFile({
                  filename: file.name,
                  bytes: buffer,
                });

              console.log(
                "FILE UPLOADED:",
                result
              );

              form.reset();
            } catch (error) {
              console.error(
                "FILE UPLOAD FAILED:",
                error
              );
            }
          }}
        >
          <input
            name="file"
            type="file"
          />

          <button type="submit">
            Upload
          </button>
        </form>

        {/* AI response */}
        {isLoading && (
          <p>
            AI is thinking...
          </p>
        )}

        {response && (
          <div>
            <strong>AI:</strong>
            <p>{response}</p>
          </div>
        )}
      </main>
    </div>
  );
};