import https from 'https';
import http from 'http';
import { createWriteStream, promises as fsPromises } from 'fs';
import { createReadStream } from 'fs';
import path from 'path';
import unzipper from 'unzipper';

interface DatasetConfig {
  name: string;
  downloadUrl: () => Promise<string | null>;
  defaultDir: string;
  tempZipName: string;
  tempExtractName: string;
}

async function fetchHtml(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    protocol
      .get(url, (res) => {
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });
        res.on('end', () => resolve(data));
      })
      .on('error', reject);
  });
}

async function downloadFile(url: string, destination: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    const file = createWriteStream(destination);

    protocol
      .get(url, (res) => {
        res.pipe(file);
        file.on('finish', () => {
          file.close(() => resolve());
        });
        file.on('error', (err) => {
          fsPromises.unlink(destination).catch(() => {});
          reject(err);
        });
      })
      .on('error', (err) => {
        fsPromises.unlink(destination).catch(() => {});
        reject(err);
      });
  });
}

async function extractZip(zipPath: string, destination: string): Promise<void> {
  await fsPromises.mkdir(destination, { recursive: true });

  return new Promise((resolve, reject) => {
    const extractionPromises: Promise<void>[] = [];

    createReadStream(zipPath)
      .pipe(unzipper.Parse())
      .on('entry', (entry) => {
        if (!entry.isDirectory) {
          const filePath = path.join(destination, entry.path);
          const dirPath = path.dirname(filePath);

          const extractPromise = fsPromises
            .mkdir(dirPath, { recursive: true })
            .then(
              () =>
                new Promise<void>((entryResolve, entryReject) => {
                  const file = createWriteStream(filePath);
                  entry
                    .pipe(file)
                    .on('finish', entryResolve)
                    .on('error', entryReject);
                  file.on('error', entryReject);
                }),
            );

          extractionPromises.push(extractPromise);
        } else {
          entry.autodrain();
        }
      })
      .on('finish', async () => {
        try {
          await Promise.all(extractionPromises);
          resolve();
        } catch (error) {
          reject(error);
        }
      })
      .on('error', reject);
  });
}

async function removeFile(filePath: string): Promise<void> {
  try {
    await fsPromises.unlink(filePath);
  } catch (error) {
    console.error(`Failed to remove file ${filePath}:`, error);
  }
}

async function moveContents(
  extractDir: string,
  finalDir: string,
): Promise<void> {
  const files = await fsPromises.readdir(extractDir, { withFileTypes: true });

  if (files.length === 0) {
    console.log(`No files found in extracted contents at ${extractDir}`);
    return;
  }

  // Ensure final directory exists
  await fsPromises.mkdir(finalDir, { recursive: true });

  // Move files and directories recursively
  for (const file of files) {
    const source = path.join(extractDir, file.name);
    const dest = path.join(finalDir, file.name);

    if (file.isDirectory()) {
      // Recursively move directory contents
      await fsPromises.mkdir(dest, { recursive: true });
      await moveContents(source, dest);
    } else {
      // Move file
      await fsPromises.rename(source, dest);
    }
  }

  console.log(`Files moved to ${finalDir}`);
}

async function moveContentsWithCleanup(
  extractDir: string,
  finalDir: string,
): Promise<void> {
  const files = await fsPromises.readdir(extractDir);

  if (files.length === 0) {
    console.log(`No files found in extracted contents at ${extractDir}`);
    return;
  }

  try {
    await fsPromises.access(finalDir);
    console.log(`Removing existing folder at ${finalDir}...`);
    await fsPromises.rm(finalDir, { recursive: true });
  } catch {
    // Folder doesn't exist yet
  }

  await fsPromises.mkdir(finalDir, { recursive: true });
  for (const file of files) {
    const source = path.join(extractDir, file);
    const dest = path.join(finalDir, file);
    await fsPromises.rename(source, dest);
  }

  console.log(`Files moved to ${finalDir}`);
}

async function downloadDataset(
  config: DatasetConfig,
  targetDir?: string,
): Promise<void> {
  console.log(`Starting ${config.name} dataset download...`);

  try {
    const link = await config.downloadUrl();
    if (!link) {
      throw new Error(`Could not find ${config.name} download link`);
    }
    console.log(`Found ${config.name} download link: ${link}`);

    const dataDir = path.join(process.cwd(), 'data');
    await fsPromises.mkdir(dataDir, { recursive: true });

    const zipPath = path.join(dataDir, config.tempZipName);
    console.log(`Downloading ${config.name} ZIP file to ${zipPath}...`);
    await downloadFile(link, zipPath);
    console.log(`${config.name} ZIP file downloaded`);

    const extractDir = path.join(dataDir, config.tempExtractName);
    console.log(`Extracting ${config.name} ZIP file to ${extractDir}...`);
    await extractZip(zipPath, extractDir);
    console.log(`${config.name} ZIP file extracted`);

    const finalDir = targetDir || config.defaultDir;
    await moveContents(extractDir, finalDir);

    console.log('Cleaning up temporary files...');
    await removeFile(zipPath);
    await fsPromises.rm(extractDir, { recursive: true });

    console.log(`${config.name} dataset download completed successfully`);
  } catch (error) {
    console.error(`${config.name} dataset download failed:`, error);
    throw error;
  }
}

const dlpConfig: DatasetConfig = {
  name: 'DLP',
  downloadUrl: async () => {
    try {
      const html = await fetchHtml(
        'https://opendata.sukl.cz/?q=katalog/databaze-lecivych-pripravku-dlp',
      );
      const match = html.match(
        /href="(https:\/\/opendata\.sukl\.cz\/soubory\/SOD\d+\/DLP\d+\.zip)"/,
      );
      return match ? match[1] : null;
    } catch (error) {
      console.error('Failed to fetch DLP download link:', error);
      return null;
    }
  },
  defaultDir: path.join(process.cwd(), 'data', 'DLP20260227'),
  tempZipName: 'dlp_temp.zip',
  tempExtractName: 'DLP_TEMP',
};

const mrConfig: DatasetConfig = {
  name: 'MR',
  downloadUrl: async () => {
    return 'https://opendata.sukl.cz/soubory/MR/mr.zip';
  },
  defaultDir: path.join(process.cwd(), 'data', 'mr'),
  tempZipName: 'mr_temp.zip',
  tempExtractName: 'MR_TEMP',
};

const regConfig: DatasetConfig = {
  name: 'REG',
  downloadUrl: async () => {
    try {
      const html = await fetchHtml(
        'https://opendata.sukl.cz/?q=katalog/nove-zrusene-registrace-povoleni-zruseni-soubezneho-dovozu-informativni-seznamy',
      );
      const match = html.match(
        /href="(https:\/\/opendata\.sukl\.cz\/soubory\/SOD\d+\/REG\d+\.zip)"/,
      );
      return match ? match[1] : null;
    } catch (error) {
      console.error('Failed to fetch REG download link:', error);
      return null;
    }
  },
  defaultDir: path.join(process.cwd(), 'data', 'REG'),
  tempZipName: 'reg_temp.zip',
  tempExtractName: 'REG_TEMP',
};

const lekarnyConfig: DatasetConfig = {
  name: 'LEKARNY',
  downloadUrl: async () => {
    try {
      const html = await fetchHtml(
        'https://opendata.sukl.cz/?q=katalog/seznam-lekaren',
      );
      const match = html.match(
        /href="(https:\/\/opendata\.sukl\.cz\/soubory\/SOD\d+\/LEKARNY\d+\.zip)"/,
      );
      return match ? match[1] : null;
    } catch (error) {
      console.error('Failed to fetch LEKARNY download link:', error);
      return null;
    }
  },
  defaultDir: path.join(process.cwd(), 'data', 'LEKARNY'),
  tempZipName: 'lekarny_temp.zip',
  tempExtractName: 'LEKARNY_TEMP',
};

const epoukazConfig: DatasetConfig = {
  name: 'EPOUKAZ',
  downloadUrl: async () => {
    try {
      const html = await fetchHtml(
        'https://opendata.sukl.cz/?q=katalog/ciselnik-pro-epoukaz',
      );
      const match = html.match(
        /href="(https:\/\/opendata\.sukl\.cz\/soubory\/EPOUKAZ\/EPOUKAZ\d+\.zip)"/,
      );
      return match ? match[1] : null;
    } catch (error) {
      console.error('Failed to fetch EPOUKAZ download link:', error);
      return null;
    }
  },
  defaultDir: path.join(process.cwd(), 'data', 'EPOUKAZ'),
  tempZipName: 'epoukaz_temp.zip',
  tempExtractName: 'EPOUKAZ_TEMP',
};

const opVyjimkyConfig: DatasetConfig = {
  name: 'OP_VYJIMKY',
  downloadUrl: async () => {
    try {
      const html = await fetchHtml(
        'https://opendata.sukl.cz/?q=katalog/ochranne-prvky-seznamy-odchylek-dle-narizeni-komise-eu-c2016161',
      );
      const match = html.match(
        /href="(https:\/\/opendata\.sukl\.cz\/soubory\/SOD\d+\/OP_VYJIMKY\d+\.zip)"/,
      );
      return match ? match[1] : null;
    } catch (error) {
      console.error('Failed to fetch OP_VYJIMKY download link:', error);
      return null;
    }
  },
  defaultDir: path.join(process.cwd(), 'data', 'OP_VYJIMKY'),
  tempZipName: 'op_vyjimky_temp.zip',
  tempExtractName: 'OP_VYJIMKY_TEMP',
};

const cediConfig: DatasetConfig = {
  name: 'CEDI',
  downloadUrl: async () => {
    try {
      const html = await fetchHtml(
        'https://opendata.sukl.cz/?q=katalog/ciselnik-existence-doprovodnych-informaci-pro-system-erecept',
      );
      const match = html.match(
        /href="(https:\/\/opendata\.sukl\.cz\/soubory\/SOD\d+\/CEDI\d+\.zip)"/,
      );
      return match ? match[1] : null;
    } catch (error) {
      console.error('Failed to fetch CEDI download link:', error);
      return null;
    }
  },
  defaultDir: path.join(process.cwd(), 'data'),
  tempZipName: 'cedi_temp.zip',
  tempExtractName: 'CEDI_TEMP',
};

const zprostredConfig: DatasetConfig = {
  name: 'ZPROSTRED',
  downloadUrl: async () => {
    try {
      const html = await fetchHtml(
        'https://opendata.sukl.cz/?q=katalog/registr-zprostredkovatelu-humannich-lecivych-pripravku',
      );
      const match = html.match(
        /href="(https:\/\/opendata\.sukl\.cz\/soubory\/SOD\d+\/ZPROSTRED\d+\.zip)"/,
      );
      return match ? match[1] : null;
    } catch (error) {
      console.error('Failed to fetch ZPROSTRED download link:', error);
      return null;
    }
  },
  defaultDir: path.join(process.cwd(), 'data'),
  tempZipName: 'zprostred_temp.zip',
  tempExtractName: 'ZPROSTRED_TEMP',
};

const erecept: DatasetConfig = {
  name: 'ERECEPT',
  downloadUrl: async () => {
    return 'https://opendata.sukl.cz/?q=katalog/predepsane-vydane-lecive-pripravky-ze-systemu-erecept';
  },
  defaultDir: path.join(process.cwd(), 'data', 'ERECEPT'),
  tempZipName: 'erecept_temp.zip',
  tempExtractName: 'ERECEPT_TEMP',
};

// Download only from 202501 onwards
async function downloadPovinnostCsvFiles(
  catalogUrl: string,
  datasetName: string,
  defaultDir: string,
): Promise<void> {
  console.log(`Starting ${datasetName} CSV files download (from 202501 onwards)...`);

  try {
    const html = await fetchHtml(catalogUrl);
    const matches = Array.from(html.matchAll(
      /href="(https:\/\/opendata\.sukl\.cz\/soubory\/[^"]*\.csv)"/g,
    ));
    const csvLinks = matches
      .map((m) => m[1])
      .filter((url) => {
        // Match povinnost_dodavek_po_preruseni_YYYYMM.csv where YYYYMM >= 202501
        const match = url.match(/povinnost_dodavek_po_preruseni_(\d{6})\.csv/);
        if (!match) return false;
        const datePart = parseInt(match[1]);
        return datePart >= 202501;
      });

    if (csvLinks.length === 0) {
      throw new Error(`No CSV files found for ${datasetName} from 202501 onwards`);
    }

    console.log(`Found ${csvLinks.length} ${datasetName} CSV files`);

    const dataDir = defaultDir;
    await fsPromises.mkdir(dataDir, { recursive: true });

    // Download each CSV file
    for (const csvUrl of csvLinks) {
      const fileName = csvUrl.split('/').pop();
      if (!fileName) continue;

      const filePath = path.join(dataDir, fileName);
      console.log(`Downloading ${fileName}...`);
      await downloadFile(csvUrl, filePath);
    }

    console.log(`${datasetName} CSV files download completed successfully`);
  } catch (error) {
    console.error(`${datasetName} CSV files download failed:`, error);
    throw error;
  }
}

async function downloadAllCsvFiles(
  catalogUrl: string,
  datasetName: string,
  defaultDir: string,
  filePattern: RegExp,
): Promise<void> {
  console.log(`Starting ${datasetName} CSV files download...`);

  try {
    const html = await fetchHtml(catalogUrl);
    const matches = Array.from(html.matchAll(
      /href="(https:\/\/opendata\.sukl\.cz\/soubory\/[^"]*\.csv)"/g,
    ));
    const csvLinks = matches.map((m) => m[1]).filter((url) => filePattern.test(url));

    if (csvLinks.length === 0) {
      throw new Error(`No CSV files found for ${datasetName}`);
    }

    console.log(`Found ${csvLinks.length} ${datasetName} CSV files`);

    const dataDir = defaultDir;
    await fsPromises.mkdir(dataDir, { recursive: true });

    // Download each CSV file
    for (const csvUrl of csvLinks) {
      const fileName = csvUrl.split('/').pop();
      if (!fileName) continue;

      const filePath = path.join(dataDir, fileName);
      console.log(`Downloading ${fileName}...`);
      await downloadFile(csvUrl, filePath);
    }

    console.log(`${datasetName} CSV files download completed successfully`);
  } catch (error) {
    console.error(`${datasetName} CSV files download failed:`, error);
    throw error;
  }
}

async function downloadAllFilesIncludingZips(
  catalogUrl: string,
  datasetName: string,
  defaultDir: string,
  csvPattern: RegExp,
  zipPattern: RegExp,
): Promise<void> {
  console.log(`Starting ${datasetName} files download (CSV + ZIP)...`);

  try {
    const html = await fetchHtml(catalogUrl);

    // Find all CSV files
    const csvMatches = Array.from(html.matchAll(
      /href="(https:\/\/opendata\.sukl\.cz\/soubory\/[^"]*\.csv)"/g,
    ));
    const csvLinks = csvMatches.map((m) => m[1]).filter((url) => csvPattern.test(url));

    // Find all ZIP files
    const zipMatches = Array.from(html.matchAll(
      /href="(https:\/\/opendata\.sukl\.cz\/soubory\/[^"]*\.zip)"/g,
    ));
    const zipLinks = zipMatches.map((m) => m[1]).filter((url) => zipPattern.test(url));

    console.log(
      `Found ${csvLinks.length} CSV files and ${zipLinks.length} ZIP files for ${datasetName}`,
    );

    const dataDir = defaultDir;
    await fsPromises.mkdir(dataDir, { recursive: true });

    // Download each CSV file
    for (const csvUrl of csvLinks) {
      const fileName = csvUrl.split('/').pop();
      if (!fileName) continue;

      const filePath = path.join(dataDir, fileName);
      console.log(`Downloading CSV ${fileName}...`);
      await downloadFile(csvUrl, filePath);
    }

    // Download and extract each ZIP file
    for (const zipUrl of zipLinks) {
      const fileName = zipUrl.split('/').pop();
      if (!fileName) continue;

      const zipPath = path.join(dataDir, fileName);
      const extractDir = path.join(dataDir, `${fileName.replace('.zip', '')}_TEMP`);

      console.log(`Downloading ZIP ${fileName}...`);
      await downloadFile(zipUrl, zipPath);

      console.log(`Extracting ZIP ${fileName}...`);
      await extractZip(zipPath, extractDir);

      // Move extracted files to data directory
      await moveContents(extractDir, dataDir);

      // Clean up temporary files
      await removeFile(zipPath);
      await fsPromises.rm(extractDir, { recursive: true });
    }

    console.log(`${datasetName} files download completed successfully`);
  } catch (error) {
    console.error(`${datasetName} files download failed:`, error);
    throw error;
  }
}

async function downloadAllZips(
  catalogUrl: string,
  datasetName: string,
  defaultDir: string,
  zipPattern: RegExp,
): Promise<void> {
  console.log(`Starting ${datasetName} ZIP files download...`);

  try {
    const html = await fetchHtml(catalogUrl);

    const zipMatches = Array.from(html.matchAll(
      /href="(https:\/\/opendata\.sukl\.cz\/soubory\/[^"]*\.zip)"/g,
    ));
    const zipLinks = zipMatches.map((m) => m[1]).filter((url) => zipPattern.test(url));

    if (zipLinks.length === 0) {
      throw new Error(`No ZIP files found for ${datasetName}`);
    }

    console.log(`Found ${zipLinks.length} ZIP files for ${datasetName}`);

    const dataDir = defaultDir;
    await fsPromises.mkdir(dataDir, { recursive: true });

    for (const zipUrl of zipLinks) {
      const fileName = zipUrl.split('/').pop();
      if (!fileName) continue;

      const zipPath = path.join(dataDir, fileName);
      const extractDir = path.join(dataDir, `${fileName.replace('.zip', '')}_TEMP`);

      console.log(`Downloading ZIP ${fileName}...`);
      await downloadFile(zipUrl, zipPath);

      console.log(`Extracting ZIP ${fileName}...`);
      await extractZip(zipPath, extractDir);

      await moveContents(extractDir, dataDir);

      await removeFile(zipPath);
      await fsPromises.rm(extractDir, { recursive: true });
    }

    console.log(`${datasetName} ZIP files download completed successfully`);
  } catch (error) {
    console.error(`${datasetName} ZIP files download failed:`, error);
    throw error;
  }
}

export async function downloadDLP(targetDir?: string): Promise<void> {
  await downloadDataset(dlpConfig, targetDir);
}

export async function downloadMR(targetDir?: string): Promise<void> {
  await downloadDataset(mrConfig, targetDir);
}

export async function downloadREG(targetDir?: string): Promise<void> {
  await downloadDataset(regConfig, targetDir);
}

export async function downloadLEKARNY(targetDir?: string): Promise<void> {
  await downloadDataset(lekarnyConfig, targetDir);
}

export async function downloadEPOUKAZ(targetDir?: string): Promise<void> {
  await downloadDataset(epoukazConfig, targetDir);
}

export async function downloadOPVYJIMKY(targetDir?: string): Promise<void> {
  await downloadDataset(opVyjimkyConfig, targetDir);
}

export async function downloadCEDI(targetDir?: string): Promise<void> {
  await downloadDataset(cediConfig, targetDir);
}

export async function downloadZPROSTRED(targetDir?: string): Promise<void> {
  await downloadDataset(zprostredConfig, targetDir);
}

export async function downloadLEK13(targetDir?: string): Promise<void> {
  const dataDir = targetDir || path.join(process.cwd(), 'data', 'LEK13');
  await downloadAllFilesIncludingZips(
    'https://opendata.sukl.cz/?q=katalog/lek-13',
    'LEK13',
    dataDir,
    /LEK13_\d+v\d+\.csv/,
    /LEK13_\d+\.zip/,
  );
}

export async function downloadDIS13(targetDir?: string): Promise<void> {
  const dataDir = targetDir || path.join(process.cwd(), 'data', 'DIS13');
  await downloadAllFilesIncludingZips(
    'https://opendata.sukl.cz/?q=katalog/dis-13',
    'DIS13',
    dataDir,
    /DIS13_\d+v\d+\.csv/,
    /DIS13_\d+\.zip/,
  );
}

export async function downloadREG13(targetDir?: string): Promise<void> {
  const dataDir = targetDir || path.join(process.cwd(), 'data', 'REG13');
  await downloadAllFilesIncludingZips(
    'https://opendata.sukl.cz/?q=katalog/reg-13',
    'REG13',
    dataDir,
    /REG13_\d+v\d+\.csv/,
    /REG13_\d+\.zip/,
  );
}

export async function downloadERECEPT(targetDir?: string): Promise<void> {
  const dataDir = targetDir || path.join(process.cwd(), 'data', 'ERECEPT');
  await downloadAllZips(
    'https://opendata.sukl.cz/?q=katalog/historie-predepsanych-vydanych-lecivych-pripravku-ze-systemu-erecept',
    'ERECEPT',
    dataDir,
    /erecept_predpis_\d+\.zip/,
  );
}

export async function downloadPOVINNOST_DODAVEK(targetDir?: string): Promise<void> {
  const dataDir = targetDir || path.join(process.cwd(), 'data', 'POVINNOST_DODAVEK');
  await downloadPovinnostCsvFiles(
    'https://opendata.sukl.cz/?q=katalog/povinne-mnozstvi-lecivych-pripravku-zajistovane-drzitelem-rozhodnuti-o-registraci-dle-ss-33a',
    'POVINNOST_DODAVEK',
    dataDir,
  );
}
