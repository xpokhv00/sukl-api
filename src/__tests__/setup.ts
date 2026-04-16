import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { beforeAll, afterAll } from '@jest/globals';
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
} from '../loaders';

declare global {
  var prisma: PrismaClient;
}

let prisma: PrismaClient;

async function loadAllTestData() {
  console.log('Loading test data from CSV files...');

  try {
    await loadAtcNodes('data-test-snapshot/DLP20260227/dlp_atc.csv');
    await loadOrganizations('data-test-snapshot/DLP20260227/dlp_organizace.csv');
    await loadPharmaceuticalForms('data-test-snapshot/DLP20260227/dlp_formy.csv');
    await loadAdministrationRoutes('data-test-snapshot/DLP20260227/dlp_cesty.csv');
    await loadDispensingCategories('data-test-snapshot/DLP20260227/dlp_vydej.csv');
    await loadRegistrationStatuses('data-test-snapshot/DLP20260227/dlp_stavyreg.csv');

    await loadDopingCategories('data-test-snapshot/DLP20260227/dlp_doping.csv');
    await loadDependencyCategories('data-test-snapshot/DLP20260227/dlp_zavislost.csv');
    await loadMedicationTypes('data-test-snapshot/DLP20260227/dlp_typlp.csv');
    await loadIndicationGroups('data-test-snapshot/DLP20260227/dlp_indikacniskupiny.csv');
    await loadNarcoticCategories('data-test-snapshot/DLP20260227/dlp_narvla.csv');

    await loadSubstances('data-test-snapshot/DLP20260227/dlp_latky.csv');

    await loadMedications('data-test-snapshot/DLP20260227/dlp_lecivepripravky.csv');
    await updateMedicationFks('data-test-snapshot/DLP20260227/dlp_lecivepripravky.csv');

    await loadCompositions('data-test-snapshot/DLP20260227/dlp_slozeni.csv');
    await loadSynonyms('data-test-snapshot/DLP20260227/dlp_synonyma.csv');
    await loadMedicationDocuments('data-test-snapshot/DLP20260227/dlp_nazvydokumentu.csv');
    await loadDisruptions('data-test-snapshot/mr/mr_hlaseni.csv');
    await loadPriceReports('data-test-snapshot/LEK13_202602v01.csv');
    await loadDispensingRestrictions('data-test-snapshot/cedi.csv');
    await loadMedicationDoping('data-test-snapshot/DLP20260227/dlp_dopinglp.csv');

    const pharmacyTypeMap = await loadPharmacyTypes('data-test-snapshot/LEKARNY20260227/lekarny_typ.csv');
    await loadPharmacies(pharmacyTypeMap)('data-test-snapshot/LEKARNY20260227/lekarny_seznam.csv');
    await loadPharmacyHours('data-test-snapshot/LEKARNY20260227/lekarny_prac_doba.csv');

    await loadRegistrationChanges('data-test-snapshot/REG2026022/reg_nove.csv', 'NEW');
    await loadRegistrationChanges('data-test-snapshot/REG2026022/reg_zrusene.csv', 'CANCELLED');
    await loadRegistrationChanges('data-test-snapshot/REG2026022/reg_zrusene_eu.csv', 'CANCELLED_EU');

    await loadPrescriptions('data-test-snapshot/erecept_predpis_202602.csv');

    console.log('Test data loaded successfully!');
  } catch (error) {
    console.error('Failed to load test data:', error);
    throw error;
  }
}

beforeAll(async () => {
  try {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error('DATABASE_URL environment variable is not set');
    }
    
    const adapter = new PrismaPg({
      connectionString: connectionString,
    });
    
    prisma = new PrismaClient({ adapter });
    global.prisma = prisma;
    await prisma.$connect();
    console.log('Test database connected');
    // Comment this out when developing as it takes minutes to upsert all test data.
    //await loadAllTestData();
  } catch (error) {
    console.error('Test setup failed:', error);
    throw error;
  }
});

afterAll(async () => {
  try {
    if (prisma) {
      await prisma.$disconnect();
      console.log('Test database disconnected');
    }
  } catch (error) {
    console.error('Failed to disconnect from test database:', error);
  }
});
