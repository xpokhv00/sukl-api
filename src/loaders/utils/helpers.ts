/* Helpers for data processing */
export function extractFirstCode(value?: string): string | null {
  if (!value) return null;
  return value.split(",")[0].trim() || null;
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