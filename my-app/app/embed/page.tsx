import { Suspense } from "react";
import EmbedWidget from "./embed-widget";

export default function EmbedPage() {
  return (
    <Suspense fallback={<p>Loading widget...</p>}>
      <EmbedWidget />
    </Suspense>
  );
}