import { readCsv, CsvRow } from "./csv";

export type Mapper<T> = (row: CsvRow) => T | T[];

//Loader factory to create loaders for different models
export function createLoader<T>(
  model: { createMany: Function },
  mapRow: Mapper<T>,
  label: string,
  delimiter = ";"
) {
  return async (filePath: string) => {
    const rows = await readCsv(filePath, delimiter);

    const data = rows.flatMap(row => {
      const result = mapRow(row);
      return Array.isArray(result) ? result : [result];
    });

    await model.createMany({ data, skipDuplicates: true });

    console.log(`Loaded ${data.length} ${label}`);
  };
}