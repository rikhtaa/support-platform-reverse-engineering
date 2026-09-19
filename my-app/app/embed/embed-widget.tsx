"use client";

import { useSearchParams } from "next/navigation";
import { WidgetChatScreen } from "../modules/widget-chat-screen";

export default function EmbedWidget() {
  const searchParams = useSearchParams();

  const organizationId =
    searchParams.get("organizationId");

  if (!organizationId) {
    return <p>Missing organizationId.</p>;
  }

  return (
    <WidgetChatScreen
      organizationId={organizationId}
    />
  );
}