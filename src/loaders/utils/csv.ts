import fs from "fs";
import { parse } from "fast-csv";

export type CsvRow = Record<string, string | undefined>;

export function readCsv(filePath: string, delimiter = ";"): Promise<CsvRow[]> {
  return new Promise((resolve, reject) => {
    const rows: CsvRow[] = [];

    fs.createReadStream(filePath)
      .pipe(parse({ headers: true, delimiter }))
      .on("error", reject)
      .on("data", (row: CsvRow) => rows.push(row))
      .on("end", () => resolve(rows));
  });
}