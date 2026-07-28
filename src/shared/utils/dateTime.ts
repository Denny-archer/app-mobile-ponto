const pad = (value: number) => String(value).padStart(2, "0");

export function toISODate(date = new Date()) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function toApiDateTime(date: string, time: string) {
  return `${date} ${time}`;
}

export function startOfMonth(date = new Date()) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function endOfMonth(date = new Date()) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

export function formatDateLong(date = new Date()) {
  return date.toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export function formatDateShort(value: string | Date) {
  const date = typeof value === "string" ? new Date(value) : value;
  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function formatTime(value: string | Date) {
  const date = typeof value === "string" ? new Date(value) : value;
  return date.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatMonthName(date: Date) {
  const value = date.toLocaleDateString("pt-BR", { month: "long" });
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export function formatMonthApiDate(date: Date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-01`;
}

export function parseTimeToMinutes(value?: string | null) {
  if (!value || value === "-") return 0;
  const normalized = value.trim();
  const negative = normalized.startsWith("-");
  const [hoursRaw = "0", minutesRaw = "0"] = normalized.replace("-", "").split(":");
  const total = Number(hoursRaw) * 60 + Number(minutesRaw);
  return negative ? -total : total;
}

export function formatMinutesCompact(totalMinutes: number) {
  const negative = totalMinutes < 0;
  const abs = Math.abs(totalMinutes);
  const hours = Math.floor(abs / 60);
  const minutes = abs % 60;
  return `${negative ? "-" : ""}${hours}h ${pad(minutes)}m`;
}

export function addMonths(date: Date, amount: number) {
  return new Date(date.getFullYear(), date.getMonth() + amount, 1);
}