export const toNumber = (value: number | null | undefined | string, defaultValue = 0) => {
  const parsed = Number(value);
  return Number.isNaN(parsed) ? defaultValue : parsed;
};
