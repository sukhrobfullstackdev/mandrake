export function pickRandomly(value: unknown[] | never[] | null | undefined) {
  const len = !value ? 0 : value.length;
  return len && value ? value[Math.floor(Math.random() * len)] : undefined;
}
