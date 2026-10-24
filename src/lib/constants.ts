export const FALLBACK_REPLY =
  "I don't have information about that in my knowledge base. " +
  "Please contact our support team for more details.";

export const STOP_WORDS = new Set([
  "who", "what", "where", "when", "why", "how", "is", "are", "the", "and",
  "or", "for", "tell", "me", "please", "give", "show", "details",
  "steps", "process", "i", "a", "an", "to", "of", "in", "on", "can", "you",
]);

export const MAX_CHAT_QUERY_LEN = 2000;
export const MAX_ADMIN_TEXT_LEN = 5000;
// Vercel serverless functions reject request bodies above 4.5 MB.
export const MAX_UPLOAD_BYTES = 4 * 1024 * 1024;
export const MAX_EXTRACTED_TEXT = 500_000;
export const MAX_WEBSITE_TEXT = 100_000;
export const MAX_URL_LENGTH = 2048;
export const ALLOWED_UPLOAD_EXTENSIONS = new Set([".pdf", ".txt"]);

export const RATE_LIMIT_WINDOW_SECONDS = 60;
export const RATE_LIMIT_MAX_REQUESTS = 20;
export const CHATLOG_RETENTION_DAYS = 20;

export const ALLOWED_PAYMENT_LINK_HOSTS = new Set(["nwcmc.gov.in", "www.nwcmc.gov.in"]);
export const DEFAULT_PROPERTY_PAYMENT_LINK =
  "https://nwcmc.gov.in/web/citizen/property/ptsearchnanded.php?uid=MjM0&id=ENG&fwdurl=pbill.php#gsc.tab=0";
export const DEFAULT_WATER_PAYMENT_LINK =
  "https://nwcmc.gov.in/web/citizen/water/waterchargespaymentsearch.php?uid=NDMw&id=ENG&cmd=clear#gsc.tab=0";

export const DISPLAY_TIMEZONE = process.env.DISPLAY_TIMEZONE || "Asia/Kolkata";
