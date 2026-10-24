import { DEFAULT_PROPERTY_PAYMENT_LINK } from "@/lib/constants";
import { makeDuesHandlers } from "@/lib/dues";

export const dynamic = "force-dynamic";
export const maxDuration = 20;

export const { OPTIONS, POST, GET } = makeDuesHandlers({
  name: "dues_api",
  envVar: "DUES_API_URL",
  label: "Dues",
  idField: "pin",
  idRegex: /^[A-Za-z0-9\-/]{4,20}$/,
  invalidIdMsg: "Invalid PIN or details not found.",
  buildPayload: (pin) => ({ pin, holding_no: pin, type: "property" }),
  ownerKeys: ["owner_name", "ownername", "name"],
  amountKeys: ["total_payable", "payable_amount", "due_amount", "total_dues"],
  dueDateKeys: ["due_date", "duedate", "last_date"],
  defaultLink: DEFAULT_PROPERTY_PAYMENT_LINK,
});
