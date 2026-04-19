import { prisma } from "./db/prisma";
import {
  downloadAndLoadDLP,
  downloadAndLoadMR,
  downloadAndLoadREG,
  downloadAndLoadLEKARNY,
  downloadAndLoadEPOUKAZ,
  downloadAndLoadOPVYJIMKY,
  downloadAndLoadCEDI,
  downloadAndLoadLEK13,
  downloadAndLoadDIS13,
  downloadAndLoadREG13,
  downloadAndLoadERECEPT,
  downloadAndLoadPOVINNOST_DODAVEK,
} from "./loaders/downloadAndLoad";

async function main() {
  try {
    console.log("Starting comprehensive data load...");
    console.log(`REDUCED_DATA: ${process.env.REDUCED_DATA === 'true'}`);

    await downloadAndLoadDLP();
    await downloadAndLoadMR();
    await downloadAndLoadREG();
    await downloadAndLoadLEKARNY();
    await downloadAndLoadEPOUKAZ();
    await downloadAndLoadOPVYJIMKY();
    await downloadAndLoadCEDI();
    await downloadAndLoadLEK13();
    await downloadAndLoadDIS13();
    await downloadAndLoadREG13();
    await downloadAndLoadERECEPT();
    await downloadAndLoadPOVINNOST_DODAVEK();

    console.log("All data loaded successfully!");
  } catch (err) {
    console.error(err);
  } finally {
    await prisma.$disconnect();
  }
}

main();