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
  updateMedicationFks,
  loadCompositions,
  loadSynonyms,
  loadMedicationDocuments,
  loadDisruptions,
  loadPriceReports,
  loadDispensingRestrictions,
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
} from "./loaders"; // adjust path if needed

async function main() {
  try {
    // Parents / references
    await loadAtcNodes("data/DLP20260227/dlp_atc.csv");
    await loadOrganizations("data/DLP20260227/dlp_organizace.csv");
    await loadPharmaceuticalForms("data/DLP20260227/dlp_formy.csv");
    await loadAdministrationRoutes("data/DLP20260227/dlp_cesty.csv");
    await loadDispensingCategories("data/DLP20260227/dlp_vydej.csv");
    await loadRegistrationStatuses("data/DLP20260227/dlp_stavyreg.csv");

    // New reference tables (FKs on Medication)
    await loadDopingCategories("data/DLP20260227/dlp_doping.csv");
    await loadDependencyCategories("data/DLP20260227/dlp_zavislost.csv");
    await loadMedicationTypes("data/DLP20260227/dlp_typlp.csv");
    await loadIndicationGroups("data/DLP20260227/dlp_indikacniskupiny.csv");
    await loadNarcoticCategories("data/DLP20260227/dlp_narvla.csv");

    // Substances
    await loadSubstances("data/DLP20260227/dlp_latky.csv");

    // Medications (skipDuplicates — won't re-insert existing rows)
    await loadMedications("data/DLP20260227/dlp_lecivepripravky.csv");
    // Backfill FK columns on already-existing medication rows
    await updateMedicationFks("data/DLP20260227/dlp_lecivepripravky.csv");

    // Child tables
    await loadCompositions("data/DLP20260227/dlp_slozeni.csv");
    await loadSynonyms("data/DLP20260227/dlp_synonyma.csv");
    await loadMedicationDocuments("data/DLP20260227/dlp_nazvydokumentu.csv");
    await loadDisruptions("data/mr/mr_hlaseni.csv");
    await loadPriceReports("data/LEK13_202602v01.csv");
    await loadDispensingRestrictions("data/cedi.csv");
    await loadMedicationDoping("data/DLP20260227/dlp_dopinglp.csv");

    // Pharmacies require a type map first
    const pharmacyTypeMap = await loadPharmacyTypes("data/LEKARNY20260227/lekarny_typ.csv");
    await loadPharmacies(pharmacyTypeMap)("data/LEKARNY20260227/lekarny_seznam.csv");
    await loadPharmacyHours("data/LEKARNY20260227/lekarny_prac_doba.csv");

    // Standalone tables
    await loadRegistrationChanges("data/REG2026022/reg_nove.csv", "NEW");
    await loadRegistrationChanges("data/REG2026022/reg_zrusene.csv", "CANCELLED");
    await loadRegistrationChanges("data/REG2026022/reg_zrusene_eu.csv", "CANCELLED_EU");
    await loadPrescriptions("data/erecept_predpis_202602.csv");

    console.log("All data loaded successfully!");
  } catch (err) {
    console.error(err);
  } finally {
    await prisma.$disconnect();
  }
}

main();