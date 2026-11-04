import { createChatHandler } from "@/lib/chat-handler";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

/** Integration response: { url?, answer }; each field is at most 250 characters. */
const handler = createChatHandler(true);
export const POST = handler.POST;
export const GET = handler.GET;
export const OPTIONS = handler.OPTIONS;