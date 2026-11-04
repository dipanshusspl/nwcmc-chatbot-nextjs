import { createChatHandler } from "@/lib/chat-handler";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

/** Public endpoint used by the embeddable widget (multi-FAQ matching). */
const handler = createChatHandler(false);
export const POST = handler.POST;
export const GET = handler.GET;
export const OPTIONS = handler.OPTIONS;
