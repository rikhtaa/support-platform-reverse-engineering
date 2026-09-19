import { v } from "convex/values";
import { action } from "../_generated/server";
import rag from "./ai/rag";
import { contentHashFromArrayBuffer } from "@convex-dev/rag";
import { Id } from "../_generated/dataModel";

type EntryMetadata = {
  storageId: Id<"_storage">
  uploadBy: string
  filename: string
}

//rag ingestion pipeline
export const addFile = action({
  args: {
    filename: v.string(),
    bytes: v.bytes(),
  },

  handler: async (ctx, args) => {
    const blob = new Blob([args.bytes]);

    const storageId = await ctx.storage.store(blob);

    const url = await ctx.storage.getUrl(storageId);

    const text = new TextDecoder().decode(args.bytes);

    console.log("EXTRACTED TEXT:", text);

    // A hashing function takes those bytes and produces a unique-looking value:
    const { entryId, created } = await rag.add(ctx, {
      namespace: "org_123",
      text,
      key: args.filename,
      title: args.filename,
      metadata: {
        storageId,
        uploadBy: "org_123",
        filename: args.filename,
      } as EntryMetadata,
      contentHash: await contentHashFromArrayBuffer(args.bytes),
    });

    if (!created) {
      console.debug("entry already exists, skipping upload metadata");
      await ctx.storage.delete(storageId);
    }

    return {
      url,
      entryId,
    };
  },
});