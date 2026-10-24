// Usage: npm run hash-password -- "MyStrongPassword"
import bcrypt from "bcryptjs";
const pw = process.argv[2];
if (!pw) { console.error('Usage: npm run hash-password -- "YourPassword"'); process.exit(1); }
const hash = bcrypt.hashSync(pw, 12);
console.log("\nBcrypt hash:\n" + hash);
console.log("\nFor Vercel's dashboard paste it as-is.");
console.log("For a .env.local file escape the dollars:\n" + hash.replace(/\$/g, "\\$") + "\n");
