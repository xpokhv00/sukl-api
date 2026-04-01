import fs from "fs";
import { parse } from "fast-csv";
import iconv from "iconv-lite";

export type CsvRow = Record<string, string | undefined>;

export function readCsv(filePath: string, delimiter = ";"): Promise<CsvRow[]> {
  return new Promise((resolve, reject) => {
    const rows: CsvRow[] = [];

    fs.createReadStream(filePath)
      .pipe(iconv.decodeStream("win1250"))
      .pipe(parse({ headers: true, delimiter }))
      .on("error", reject)
      .on("data", (row: CsvRow) => rows.push(row))
      .on("end", () => resolve(rows));
  });
}

// for parsing large amount of data
export function streamCsv(filePath: string, delimiter = ";") {
  return fs.createReadStream(filePath)
    .pipe(iconv.decodeStream("win1250"))
    .pipe(parse({ headers: true, delimiter }));
}