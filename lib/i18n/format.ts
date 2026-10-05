/** Replace `{key}` placeholders. Safe on both server and client. */
export function t(template: string, vars: Record<string, string | number> = {}) {
  return template.replace(/\{(\w+)\}/g, (_, k) => (k in vars ? String(vars[k]) : `{${k}}`));
}

export function formatDuration(minutes: number, labels: { minutes: string; hours: string }) {
  if (minutes < 60) return t(labels.minutes, { n: minutes });
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return t(labels.hours, { h, m: m ? String(m).padStart(2, "0") : "" }).trim();
}
