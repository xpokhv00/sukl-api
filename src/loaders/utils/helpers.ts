export function extractFirstCode(value?: string): string | null {
  if (!value) return null;
  return value.split(",")[0].trim() || null;
}

export function normalizeSuklCode(value?: string | null): string | null {
  if (!value) return null;
  // SUKL codes in source CSV can be shorter than 7 digits; the canonical form always has
  // leading zeros (e.g. "12345" → "0012345"). This must match the DB primary key format.
  const trimmed = value.trim();
  if (!trimmed) return null;
  return trimmed.padStart(7, "0");
}

export function normalizeType(value?: string): string | null {
  if (!value) return null;

  const v = value.toLowerCase();
  if (v.includes("zahajeni")) return "START";
  if (v.includes("preruseni")) return "INTERRUPTION";
  if (v.includes("ukonceni")) return "ENDED";
  if (v.includes("obnoveni")) return "RESUMED";

  return value;
}

export async function insertMany<T>(
  model: any,
  data: T[],
  modelName?: string,
  batchSize = 1000
) {
  for (let i = 0; i < data.length; i += batchSize) {
    const chunk = data.slice(i, i + batchSize);
    await model.createMany({ data: chunk, skipDuplicates: true });
  }
  console.log(`Loaded ${data.length} ${modelName || "records"}`);
}