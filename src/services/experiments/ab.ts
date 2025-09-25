export function getCohort(name: string, buckets: string[] = ['A', 'B']): string {
  try {
    const key = `exp:${name}`;
    const existing = localStorage.getItem(key);
    if (existing) return existing;
    const bucket = buckets[Math.floor(Math.random() * buckets.length)] ?? 'A';
    localStorage.setItem(key, bucket);
    return bucket;
  } catch {
    return buckets[0] ?? 'A';
  }
}

export function isFlagEnabled(flagName: string, defaultValue = true): boolean {
  try {
    const v = localStorage.getItem(`flag:${flagName}`);
    if (v === null) return defaultValue;
    return v === 'true';
  } catch {
    return defaultValue;
  }
}
