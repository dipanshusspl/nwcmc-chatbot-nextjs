import { db } from "@/lib/db";
import { PageHeader, Shell } from "@/components/ui";
import UrlManager from "./UrlManager";

export const metadata = { title: "Live URL" };
export const maxDuration = 60;

export default async function UrlPage() {
  const rows = await db()<{ id: string; url: string }[]>`select id, url from chatbot_url order by id desc`;
  return (
    <Shell>
      <PageHeader title="Live URL" subtitle="Add the required web page to connect it to your workspace." />
      <UrlManager urls={rows.map((r) => ({ id: String(r.id), url: r.url }))} />
    </Shell>
  );
}
