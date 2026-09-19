"use client";

import "./globals.css";
import { ConvexProvider, ConvexReactClient } from "convex/react";
const convex = new ConvexReactClient("http://127.0.0.1:3210");

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <ConvexProvider client={convex}>
          {children}
        </ConvexProvider>
      </body>
    </html>
  );
}