import { NextResponse } from "next/server";
import { isRateLimited } from "./rate-limit";
import { corsHeaders, readBody, sanitizePaymentLink } from "./security";

type Upstream = Record<string, unknown>;
const pick = (d: Upstream, keys: string[]) => {
  for (const k of keys) if (d[k]) return d[k];
  return undefined;
};

interface Cfg {
  name: string;              // rate-limit key
  envVar: string;            // upstream URL env var
  label: string;             // "Water dues" / "Dues"
  idField: "pin" | "service_no";
  idRegex: RegExp;
  invalidIdMsg: string;
  buildPayload: (id: string) => Record<string, unknown>;
  ownerKeys: string[];
  amountKeys: string[];
  dueDateKeys: string[];
  defaultLink: string;
}

export function makeDuesHandlers(cfg: Cfg) {
  const reply = (req: Request, body: unknown, status = 200) =>
    NextResponse.json(body, { status, headers: corsHeaders(req) });
  const err = (req: Request, msg: string, status: number) => reply(req, { status: "error", msg }, status);

  async function OPTIONS(req: Request) {
    return new NextResponse(null, { status: 204, headers: corsHeaders(req) });
  }

  async function POST(req: Request) {
    if (await isRateLimited(req.headers, cfg.name, 10, 60)) {
      return err(req, "Too many requests. Please try again later.", 429);
    }
    const body = await readBody(req);
    if (!body || !Object.keys(body).length) return err(req, "Invalid request body.", 400);

    const id = String(
      (cfg.idField === "pin" ? body.pin || body.serviceno : body.service_no || body.serviceno) || "",
    ).trim();
    if (!cfg.idRegex.test(id)) return err(req, cfg.invalidIdMsg, 400);

    const upstreamUrl = process.env[cfg.envVar] || "";
    if (!upstreamUrl) return err(req, `${cfg.label} service is not configured.`, 503);

    let data: Upstream;
    try {
      const res = await fetch(upstreamUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cfg.buildPayload(id)),
        signal: AbortSignal.timeout(10_000),
        cache: "no-store",
      });
      if (!res.ok) throw new Error(`upstream ${res.status}`);
      const parsed = await res.json();
      if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error("bad payload");
      data = parsed as Upstream;
    } catch (e) {
      const name = (e as Error)?.name;
      if (name === "TimeoutError" || name === "AbortError") {
        return err(req, `${cfg.label} service timed out. Please try again.`, 504);
      }
      if ((e as Error)?.message === "fetch failed") {
        return err(req, `Unable to connect to ${cfg.label.toLowerCase()} service.`, 502);
      }
      console.warn(`[${cfg.name}] upstream error`, e);
      return err(req, `Unable to fetch ${cfg.label.toLowerCase()} details right now.`, 502);
    }

    const owner = pick(data, cfg.ownerKeys) ?? "N/A";
    const amount = pick(data, cfg.amountKeys) ?? data.amount ?? "0.00";
    const due = pick(data, cfg.dueDateKeys) ?? "";
    const address = pick(data, ["property_address", "address"]) ?? "";

    return reply(req, {
      status: "success",
      data: {
        owner_name: String(owner).slice(0, 200),
        [cfg.idField]: id,
        property_address: String(address).slice(0, 500),
        payable_amount: String(amount).slice(0, 50),
        due_date: String(due).slice(0, 50),
        payment_link: sanitizePaymentLink(data.payment_link, cfg.defaultLink),
      },
    });
  }

  async function GET(req: Request) {
    return err(req, "Method not allowed.", 405);
  }
  return { OPTIONS, POST, GET };
}
