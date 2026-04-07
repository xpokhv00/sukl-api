// src/load_data.ts
import { prisma } from "./db/prisma";
import {
  loadAtcNodes,
  loadOrganizations,
  loadPharmaceuticalForms,
  loadAdministrationRoutes,
  loadDispensingCategories,
  loadRegistrationStatuses,
  loadSubstances,
  loadMedications,
  loadCompositions,
  loadSynonyms,
  loadMedicationDocuments,
  loadDisruptions,
  loadPriceReports,
  //loadDispensingRestrictions,
  loadPharmacyTypes,
  loadPharmacies,
  loadPharmacyHours,
} from "./loaders"; // adjust path if needed

async function main() {
  try {
    // Parents / references
    await loadAtcNodes("data/DLP20260227/dlp_atc.csv");
    await loadOrganizations("data/DLP20260227/dlp_organizace.csv");
    await loadPharmaceuticalForms("data/DLP20260227/dlp_formy.csv");
    await loadAdministrationRoutes("data/DLP20260227/dlp_cesty.csv");
    // await loadDispensingCategories("data/DLP20260227");
    await loadRegistrationStatuses("data/DLP20260227/dlp_stavyreg.csv");

    // Substances
    await loadSubstances("data/DLP20260227/dlp_latky.csv");

    // Medications
    await loadMedications("data/DLP20260227/dlp_lecivepripravky.csv");

    // Child tables
    await loadCompositions("data/DLP20260227/dlp_slozeni.csv");
    await loadSynonyms("data/DLP20260227/dlp_synonyma.csv");


    // await loadMedicationDocuments("data/DLP20260227/dlp_dokumenty.csv");
    await loadDisruptions("data/mr/mr_hlaseni.csv");
    await loadPriceReports("data/LEK13_202602v01.csv");
    //await loadDispensingRestrictions("data/dispensing_restrictions.csv");

    // Pharmacies require a type map first
    const pharmacyTypeMap = await loadPharmacyTypes("data/LEKARNY20260227/lekarny_typ.csv");
    await loadPharmacies(pharmacyTypeMap)("data/LEKARNY20260227/lekarny_seznam.csv");
    await loadPharmacyHours("data/LEKARNY20260227/lekarny_prac_doba.csv");

    console.log("All data loaded successfully!");
  } catch (err) {
    console.error(err);
  } finally {
    await prisma.$disconnect();
  }
}

main();