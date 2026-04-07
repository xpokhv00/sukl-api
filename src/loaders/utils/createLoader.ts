import { streamCsv, CsvRow } from "./csv";

export type Mapper<T> = (row: CsvRow) => T | T[];

//Loader factory to create loaders for different models
// export function createLoader<T>(
//   model: { createMany: Function },
//   mapRow: Mapper<T>,
//   label: string,
//   delimiter = ";"
// ) {
//   return async (filePath: string) => {
//     const rows = await readCsv(filePath, delimiter);

//     const data = rows.flatMap(row => {
//       const result = mapRow(row);
//       return Array.isArray(result) ? result : [result];
//     });

//     await model.createMany({ data, skipDuplicates: true });

//     console.log(`Loaded ${data.length} ${label}`);
//   };
// }

export function createLoader<T>(
  model: { createMany: Function },
  mapRow: Mapper<T>,
  label: string,
  delimiter = ";",
  batchSize = 1000,
  encoding = "win1250"
) {
  return async (filePath: string) => {
    let batch: any[] = [];
    let totalLoaded = 0;

    const stream = streamCsv(filePath, delimiter, encoding);

    for await (const row of stream) {
      const result = mapRow(row as CsvRow);
      
      if (Array.isArray(result)) {
        batch.push(...result);
      } else {
        batch.push(result);
      }

      // store batch
      if (batch.length >= batchSize) {
        await model.createMany({ data: batch, skipDuplicates: true });
        totalLoaded += batch.length;
        batch = []; 
      }
    }

    // store rest of data after last batch
    if (batch.length > 0) {
      await model.createMany({ data: batch, skipDuplicates: true });
      totalLoaded += batch.length;
    }

    console.log(`Loaded ${totalLoaded} ${label}`);
  };
}