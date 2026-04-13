import path from 'path';
import { promises as fsPromises } from 'fs';
import {
  downloadDLP,
  downloadMR,
  downloadREG,
  downloadLEKARNY,
  downloadEPOUKAZ,
  downloadOPVYJIMKY,
  downloadCEDI,
  downloadZPROSTRED,
  downloadLEK13,
  downloadDIS13,
  downloadREG13,
  downloadERECEPT,
  downloadPOVINNOST_DODAVEK,
} from '../services/dataDownloader.service';
import {
  loadAtcNodes,
  loadOrganizations,
  loadPharmaceuticalForms,
  loadAdministrationRoutes,
  loadDispensingCategories,
  loadRegistrationStatuses,
  loadSubstances,
  loadMedications,
  updateMedicationFks,
  loadCompositions,
  loadSynonyms,
  loadMedicationDocuments,
  loadDisruptions,
  loadPharmacyTypes,
  loadPharmacies,
  loadPharmacyHours,
  loadDopingCategories,
  loadDependencyCategories,
  loadMedicationTypes,
  loadIndicationGroups,
  loadNarcoticCategories,
  loadMedicationDoping,
  loadRegistrationChanges,
  loadPrescriptions,
  loadPriceReports,
  loadDispensingRestrictions,
  loadIntermediaries,
} from './index';

const useReducedData = process.env.REDUCED_DATA === 'true';

async function deleteDir(dirPath: string): Promise<void> {
  try {
    await fsPromises.rm(dirPath, { recursive: true });
    console.log(`Deleted ${dirPath}`);
  } catch (error) {
    console.warn(`Failed to delete ${dirPath}:`, error);
  }
}

export async function downloadAndLoadDLP(): Promise<void> {
  console.log('=== Starting DLP Download & Load ===');
  const dataDir = path.join(process.cwd(), 'data', 'DLP20260227');

  try {
    await downloadDLP(dataDir);

    await loadAtcNodes(path.join(dataDir, 'dlp_atc.csv'));
    await loadOrganizations(path.join(dataDir, 'dlp_organizace.csv'));
    await loadPharmaceuticalForms(path.join(dataDir, 'dlp_formy.csv'));
    await loadAdministrationRoutes(path.join(dataDir, 'dlp_cesty.csv'));
    await loadDispensingCategories(path.join(dataDir, 'dlp_vydej.csv'));
    await loadRegistrationStatuses(path.join(dataDir, 'dlp_stavyreg.csv'));
    await loadDopingCategories(path.join(dataDir, 'dlp_doping.csv'));
    await loadDependencyCategories(path.join(dataDir, 'dlp_zavislost.csv'));
    await loadMedicationTypes(path.join(dataDir, 'dlp_typlp.csv'));
    await loadIndicationGroups(path.join(dataDir, 'dlp_indikacniskupiny.csv'));
    await loadNarcoticCategories(path.join(dataDir, 'dlp_narvla.csv'));

    await loadSubstances(path.join(dataDir, 'dlp_latky.csv'));
    await loadMedications(path.join(dataDir, 'dlp_lecivepripravky.csv'));
    await updateMedicationFks(path.join(dataDir, 'dlp_lecivepripravky.csv'));

    await loadCompositions(path.join(dataDir, 'dlp_slozeni.csv'));
    await loadSynonyms(path.join(dataDir, 'dlp_synonyma.csv'));
    await loadMedicationDocuments(path.join(dataDir, 'dlp_nazvydokumentu.csv'));
    await loadMedicationDoping(path.join(dataDir, 'dlp_dopinglp.csv'));

    console.log('DLP load completed, cleaning up...');
    await deleteDir(dataDir);
  } catch (error) {
    console.error('DLP download/load failed:', error);
    throw error;
  }
}

export async function downloadAndLoadMR(): Promise<void> {
  console.log('=== Starting MR Download & Load ===');
  const dataDir = path.join(process.cwd(), 'data', 'mr');

  try {
    await downloadMR(dataDir);
    await loadDisruptions(path.join(dataDir, 'mr_hlaseni.csv'));

    console.log('MR load completed, cleaning up...');
    await deleteDir(dataDir);
  } catch (error) {
    console.error('MR download/load failed:', error);
    throw error;
  }
}

export async function downloadAndLoadREG(): Promise<void> {
  console.log('=== Starting REG Download & Load ===');
  const dataDir = path.join(process.cwd(), 'data', 'REG');

  try {
    await downloadREG(dataDir);

    const files = await fsPromises.readdir(dataDir);
    const regNoveFiles = files.filter(f => f.includes('reg_nove'));
    const regZruseneFiles = files.filter(f => f.includes('reg_zrusene') && !f.includes('_eu'));
    const regZruseneEuFiles = files.filter(f => f.includes('reg_zrusene_eu'));

    for (const file of regNoveFiles) {
      await loadRegistrationChanges(path.join(dataDir, file), 'NEW');
    }
    for (const file of regZruseneFiles) {
      await loadRegistrationChanges(path.join(dataDir, file), 'CANCELLED');
    }
    for (const file of regZruseneEuFiles) {
      await loadRegistrationChanges(path.join(dataDir, file), 'CANCELLED_EU');
    }

    console.log('REG load completed, cleaning up...');
    await deleteDir(dataDir);
  } catch (error) {
    console.error('REG download/load failed:', error);
    throw error;
  }
}

export async function downloadAndLoadLEKARNY(): Promise<void> {
  console.log('=== Starting LEKARNY Download & Load ===');
  const dataDir = path.join(process.cwd(), 'data', 'LEKARNY');

  try {
    await downloadLEKARNY(dataDir);

    const typeMapPath = path.join(dataDir, 'lekarny_typ.csv');
    const pharmacyTypeMap = await loadPharmacyTypes(typeMapPath);
    await loadPharmacies(pharmacyTypeMap)(path.join(dataDir, 'lekarny_seznam.csv'));
    await loadPharmacyHours(path.join(dataDir, 'lekarny_prac_doba.csv'));

    console.log('LEKARNY load completed, cleaning up...');
    await deleteDir(dataDir);
  } catch (error) {
    console.error('LEKARNY download/load failed:', error);
    throw error;
  }
}

export async function downloadAndLoadEPOUKAZ(): Promise<void> {
  console.log('=== Starting EPOUKAZ Download & Load ===');
  const dataDir = path.join(process.cwd(), 'data', 'EPOUKAZ');

  try {
    await downloadEPOUKAZ(dataDir);
    console.log('EPOUKAZ downloaded (TODO: implement loader if needed, extension)');
    // TODO: Implement loader if needed, currently just downloading and deleting
    console.log('EPOUKAZ cleanup...');
    await deleteDir(dataDir);
  } catch (error) {
    console.error('EPOUKAZ download failed:', error);
    throw error;
  }
}

export async function downloadAndLoadOPVYJIMKY(): Promise<void> {
  console.log('=== Starting OP_VYJIMKY Download & Load ===');
  const dataDir = path.join(process.cwd(), 'data', 'OP_VYJIMKY');

  try {
    await downloadOPVYJIMKY(dataDir);
    console.log('OP_VYJIMKY downloaded (TODO: implement loader if needed, extension)');
    // TODO: Implement loader if needed, currently just downloading and deleting
    console.log('OP_VYJIMKY cleanup...');
    await deleteDir(dataDir);
  } catch (error) {
    console.error('OP_VYJIMKY download failed:', error);
    throw error;
  }
}

export async function downloadAndLoadCEDI(): Promise<void> {
  console.log('=== Starting CEDI Download & Load ===');
  const dataDir = path.join(process.cwd(), 'data');
  const cediFile = path.join(dataDir, 'cedi.csv');

  try {
    await downloadCEDI(dataDir);
    await loadDispensingRestrictions(cediFile);

    console.log('CEDI load completed, cleaning up file...');
    await fsPromises.unlink(cediFile).catch(() => {});
  } catch (error) {
    console.error('CEDI download/load failed:', error);
    throw error;
  }
}

export async function downloadAndLoadZPROSTRED(): Promise<void> {
  console.log('=== Starting ZPROSTRED Download & Load ===');
  const dataDir = path.join(process.cwd(), 'data');
  const zprostredFile = path.join(dataDir, 'zprostredkovatele.csv');

  try {
    await downloadZPROSTRED(dataDir);
    await loadIntermediaries(zprostredFile);

    console.log('ZPROSTRED load completed, cleaning up file...');
    await fsPromises.unlink(zprostredFile).catch(() => {});
  } catch (error) {
    console.error('ZPROSTRED download/load failed:', error);
    throw error;
  }
}

export async function downloadAndLoadLEK13(): Promise<void> {
  console.log('=== Starting LEK13 Download & Load ===');
  const dataDir = path.join(process.cwd(), 'data', 'LEK13');

  try {
    await downloadLEK13(dataDir);

    let files = await fsPromises.readdir(dataDir);
    files = files.filter(f => f.endsWith('.csv'));

    if (useReducedData) {
      const latestFiles = files.sort().reverse().slice(0, 3);
      console.log(`REDUCED_DATA enabled: loading only latest 3 months: ${latestFiles.join(', ')}`);
      for (const file of latestFiles) {
        await loadPriceReports(path.join(dataDir, file));
      }
    } else {
      for (const file of files) {
        await loadPriceReports(path.join(dataDir, file));
      }
    }

    console.log('LEK13 load completed, cleaning up...');
    await deleteDir(dataDir);
  } catch (error) {
    console.error('LEK13 download/load failed:', error);
    throw error;
  }
}

export async function downloadAndLoadDIS13(): Promise<void> {
  console.log('=== Starting DIS13 Download & Load ===');
  const dataDir = path.join(process.cwd(), 'data', 'DIS13');

  try {
    await downloadDIS13(dataDir);

    let files = await fsPromises.readdir(dataDir);
    files = files.filter(f => f.endsWith('.csv'));

    if (useReducedData) {
      const latestFiles = files.sort().reverse().slice(0, 3);
      console.log(`REDUCED_DATA enabled: loading only latest 3 months: ${latestFiles.join(', ')}`);
      for (const file of latestFiles) {
        console.log(`Would load DIS13 file: ${file}`);
      }
    } else {
      for (const file of files) {
        console.log(`Would load DIS13 file: ${file}`);
      }
    }

    console.log('DIS13 download completed, cleaning up...');
    await deleteDir(dataDir);
  } catch (error) {
    console.error('DIS13 download failed:', error);
    throw error;
  }
}

export async function downloadAndLoadREG13(): Promise<void> {
  console.log('=== Starting REG13 Download & Load ===');
  const dataDir = path.join(process.cwd(), 'data', 'REG13');

  try {
    await downloadREG13(dataDir);

    let files = await fsPromises.readdir(dataDir);
    files = files.filter(f => f.endsWith('.csv'));

    if (useReducedData) {
      const latestFiles = files.sort().reverse().slice(0, 3);
      console.log(`REDUCED_DATA enabled: loading only latest 3 months: ${latestFiles.join(', ')}`);
      for (const file of latestFiles) {
        console.log(`Would load REG13 file: ${file}`);
      }
    } else {
      for (const file of files) {
        console.log(`Would load REG13 file: ${file}`);
      }
    }

    console.log('REG13 download completed, cleaning up...');
    await deleteDir(dataDir);
  } catch (error) {
    console.error('REG13 download failed:', error);
    throw error;
  }
}

export async function downloadAndLoadERECEPT(): Promise<void> {
  console.log('=== Starting ERECEPT Download & Load ===');
  const dataDir = path.join(process.cwd(), 'data', 'ERECEPT');

  try {
    await downloadERECEPT(dataDir);

    let files = await fsPromises.readdir(dataDir);
    files = files.filter(f => f.endsWith('.csv'));

    if (useReducedData) {
      const latestFiles = files.sort().reverse().slice(0, 1);
      console.log(`REDUCED_DATA enabled: loading only latest files`);
      for (const file of latestFiles) {
        await loadPrescriptions(path.join(dataDir, file));
      }
    } else {
      for (const file of files) {
        await loadPrescriptions(path.join(dataDir, file));
      }
    }

    console.log('ERECEPT load completed, cleaning up...');
    await deleteDir(dataDir);
  } catch (error) {
    console.error('ERECEPT download/load failed:', error);
    throw error;
  }
}

export async function downloadAndLoadPOVINNOST_DODAVEK(): Promise<void> {
  console.log('=== Starting POVINNOST_DODAVEK Download & Load ===');
  const dataDir = path.join(process.cwd(), 'data', 'POVINNOST_DODAVEK');

  try {
    await downloadPOVINNOST_DODAVEK(dataDir);

    let files = await fsPromises.readdir(dataDir);
    files = files.filter(f => f.endsWith('.csv'));

    if (useReducedData) {
      const latestFiles = files.sort().reverse().slice(0, 3);
      console.log(`REDUCED_DATA enabled: loading only latest 3 months: ${latestFiles.join(', ')}`);
      for (const file of latestFiles) {
        console.log(`Would load POVINNOST_DODAVEK file: ${file}`);
      }
    } else {
      for (const file of files) {
        console.log(`Would load POVINNOST_DODAVEK file: ${file}`);
      }
    }

    console.log('POVINNOST_DODAVEK download completed, cleaning up...');
    await deleteDir(dataDir);
  } catch (error) {
    console.error('POVINNOST_DODAVEK download failed:', error);
    throw error;
  }
}
