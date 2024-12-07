export function createPasskeyUsername(): string {
  const currentDate = new Date();
  const options = {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  } as Intl.DateTimeFormatOptions;
  const dateFormat = new Intl.DateTimeFormat('en-US', options).format(currentDate);
  return `Magic Passport (${dateFormat})`;
}
