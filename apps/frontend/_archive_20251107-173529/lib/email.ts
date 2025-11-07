export function parseEmailAddresses(value: string): string[] {
  const seen = new Set<string>();
  const addresses: string[] = [];

  value
    .split(/[,;\n]+/)
    .map((entry) => entry.trim())
    .forEach((entry) => {
      if (!entry) {
        return;
      }
      const key = entry.toLowerCase();
      if (seen.has(key)) {
        return;
      }
      seen.add(key);
      addresses.push(entry);
    });

  return addresses;
}
