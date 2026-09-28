export function getDailyUsageFactor(date: Date, applianceId: string): number {
  const dateKey = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
  const seed = `${dateKey}:${applianceId}`.split('').reduce(
    (hash, character) => (hash * 31 + character.charCodeAt(0)) >>> 0,
    7
  );

  return 0.85 + (seed % 31) / 100;
}