/** The most boarding calls a schedule has (the API refuses more) */
export const MAX_CALLS = 6;

/** "20, 15, 10" → [20, 15, 10]; null when it is not whole minutes, longest first, up to six. Empty text: no calls. */
export function parseCallSchedule(text?: string | null): number[] | null {
  const parts = (text ?? '').split(/[\s,;]+/).filter(Boolean);
  const minutes = parts.map((part) => (/^\d+$/.test(part) ? Number(part) : NaN));
  const valid =
    minutes.length <= MAX_CALLS &&
    minutes.every((value) => Number.isInteger(value) && value > 0) &&
    minutes.every((value, index) => index === 0 || value < minutes[index - 1]);
  return valid ? minutes : null;
}

export function formatCallSchedule(minutes?: number[] | null): string {
  return (minutes ?? []).join(', ');
}
