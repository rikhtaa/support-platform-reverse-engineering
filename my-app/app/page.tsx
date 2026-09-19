"use client";

import { WidgetChatScreen } from "./modules/widget-chat-screen";

export default function Home() {
  return (
    <main>
      <WidgetChatScreen organizationId="org_123" />
    </main>
  );
}