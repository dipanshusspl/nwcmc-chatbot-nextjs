import { DEFAULT_WATER_PAYMENT_LINK } from "@/lib/constants";
import { makeDuesHandlers } from "@/lib/dues";

export const dynamic = "force-dynamic";
export const maxDuration = 20;

export const { OPTIONS, POST, GET } = makeDuesHandlers({
  name: "water_dues_api",
  envVar: "DUES_API_URL_WATER",
  label: "Water dues",
  idField: "service_no",
  idRegex: /^[A-Za-z0-9\-/]{4,30}$/,
  invalidIdMsg: "Invalid Service Number.",
  buildPayload: (no) => ({ service_no: no, serviceno: no, type: "water" }),
  ownerKeys: ["owner_name", "ownername", "consumer_name", "name"],
  amountKeys: ["payable_amount", "total_payable", "due_amount", "total_dues", "net_payable"],
  dueDateKeys: ["due_date", "duedate", "last_date", "bill_date"],
  defaultLink: DEFAULT_WATER_PAYMENT_LINK,
});
