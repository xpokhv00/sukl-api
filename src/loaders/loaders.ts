import { prisma } from "../db/prisma";
import { Parsers } from "./utils/parsers";
import { extractFirstCode, normalizeType } from "./utils/helpers";
import { createLoader } from "./utils/createLoader";

// ----------------- Basic Loaders -----------------
export const loadSubstances = createLoader(
  prisma.substance,
  row => ({
    id: Parsers.string(row.KOD_LATKY),
    name: Parsers.string(row.NAZEV),
    innName: Parsers.optionalString(row.NAZEV_INN),
  }),
  "substances"
);

export const loadMedications = createLoader(
  prisma.medication,
  row => ({
    suklCode: Parsers.string(row.KOD_SUKL),
    name: Parsers.string(row.NAZEV),
    strength: Parsers.optionalString(row.SILA),
    atcCode: Parsers.optionalString(row.ATC_WHO),
    isActive: true,
  }),
  "medications"
);

export const loadAtcNodes = createLoader(
  prisma.atcNode,
  row => ({
    code: Parsers.string(row.ATC),
    name: Parsers.string(row.NAZEV),
    parentCode: Parsers.optionalString(row.parent_code),
    level: Parsers.number(row.NT) ?? null,
  }),
  "ATC nodes"
);

export const loadOrganizations = createLoader(
  prisma.organization,
  row => ({
    code: Parsers.string(row.ZKR_ORG),
    name: Parsers.string(row.NAZEV),
    countryCode: Parsers.optionalString(row.ZEM),
    //TODO: maybe from another source 
    email: Parsers.optionalString(row.email),
    phone: Parsers.optionalString(row.phone),
    website: Parsers.optionalString(row.website),
    address: Parsers.optionalString(row.address),
  }),
  "organizations"
);

// ----------------- Pharmaceutical Forms -----------------
export const loadPharmaceuticalForms = createLoader(
  prisma.pharmaceuticalForm,
  row => ({
    code: Parsers.string(row.FORMA),
    name: Parsers.string(row.NAZEV),
    edqmCode: Parsers.optionalString(row.KOD_EDQM),
  }),
  "pharmaceutical forms"
);

export const loadAdministrationRoutes = createLoader(
  prisma.administrationRoute,
  row => ({
    code: Parsers.string(row.CESTA),
    name: Parsers.string(row.NAZEV),
    edqmCode: Parsers.optionalString(row.KOD_EDQM),
  }),
  "administration routes"
);

export const loadDispensingCategories = createLoader(
  prisma.dispensingCategory,
  row => ({
    code: Parsers.string(row.FORMA),
    name: Parsers.string(row.NAZEV),
  }),
  "dispensing categories"
);

export const loadRegistrationStatuses = createLoader(
  prisma.registrationStatus,
  row => ({
    code: Parsers.string(row.REG),
    name: Parsers.string(row.NAZEV),
  }),
  "registration statuses"
);

// ----------------- Compositions -----------------
export async function loadCompositions(filePath: string) {
  const validSubstances = await prisma.substance.findMany({ select: { id: true } });
  const validSubstanceIds = new Set(validSubstances.map(s => s.id));

  const validMedications = await prisma.medication.findMany({ select: { suklCode: true } });
  const validMedicationIds = new Set(validMedications.map(m => m.suklCode));

  // create filtered data loader
  const baseLoader = createLoader(
    prisma.composition,
    row => {
      const suklCode = Parsers.string(row.KOD_SUKL);
      const substanceId = Parsers.string(row.KOD_LATKY);

      // ignore dirty data (non-existing IDs)
      if (!validMedicationIds.has(suklCode) || !validSubstanceIds.has(substanceId)) {
        return [];
      }

      return {
        medicationSuklCode: suklCode,
        substanceId: substanceId,
        amount: Parsers.number(row.AMNT) ?? Parsers.number(row.AMNT_OD),
        unit: Parsers.optionalString(row.UN),
        type: "ACTIVE",
        note: null,
      };
    },
    "compositions"
  );

  await baseLoader(filePath);
}

// ----------------- Synonyms -----------------
export const loadSynonyms = createLoader(
  prisma.synonym,
  row => ({
    substanceId: Parsers.string(row.KOD_LATKY),
    name: Parsers.string(row.NAZEV),
  }),
  "synonyms"
);

// ----------------- Medication Documents -----------------
export const loadMedicationDocuments = createLoader(
  prisma.medicationDocument,
  row => {
    const sukl = Parsers.string(row.KOD_SUKL);
    const docs = [];

    if (row.PIL) docs.push({ medicationSuklCode: sukl, type: "PIL", title: "Patient Information Leaflet", url: row.PIL, updatedAt: Parsers.date(row.DAT_ROZ_PIL) ?? undefined });
    if (row.SPC) docs.push({ medicationSuklCode: sukl, type: "SPC", title: "Summary of Product Characteristics", url: row.SPC, updatedAt: Parsers.date(row.DAT_ROZ_SPC) ?? undefined });
    if (row.OBAL_TEXT) docs.push({ medicationSuklCode: sukl, type: "PACKAGE_LEAFLET", title: "Packaging Text", url: row.OBAL_TEXT, updatedAt: Parsers.date(row.DAT_ROZ_OBAL) ?? undefined });
    if (row.NR) docs.push({ medicationSuklCode: sukl, type: "OTHER", title: "NR Document", url: row.NR, updatedAt: Parsers.date(row.DAT_NPM_NR) ?? undefined });

    return docs;
  },
  "medication documents"
);

// ----------------- Disruptions -----------------
export async function loadDisruptions(filePath: string) {
  const validMedications = await prisma.medication.findMany({ select: { suklCode: true } });
  const validMedicationIds = new Set(validMedications.map(m => m.suklCode));

  // create filtered data loader
  const baseLoader = createLoader(
    prisma.disruption,
    row => {
      const suklCode = Parsers.string(row.KOD_SUKL);

      // ignore dirty data (non-existing IDs)
      if (!validMedicationIds.has(suklCode)) {
        return [];
      }

      return {
        medicationSuklCode: suklCode,
        type: normalizeType(row.TYP_OZNAMENI),
        reason: Parsers.optionalString(row.DUVOD_PRERUSENI_UKONCENI),
        isActive: Parsers.boolean(row.POSLEDNI_PLATNE_HLASENI),
        reportedAt: Parsers.date(row.DATUM_HLASENI) ?? undefined,
        startDate: Parsers.date(row.PLATNOST_OD) ?? undefined,
        endDate: Parsers.date(row.TERMIN_OBNOVENI) ?? undefined,
        replacementSuklCode: extractFirstCode(row.NAHRAZUJICI_LP),
      };
    },
    "disruptions"
  );

  await baseLoader(filePath);
}

//TODO: reimbursement, patientCopay and reportedAt
// ----------------- Price Reports -----------------
export async function loadPriceReports(filePath: string) {
  const validMedications = await prisma.medication.findMany({ select: { suklCode: true } });
  const validMedicationIds = new Set(validMedications.map(m => m.suklCode));

  // create filtered data loader
  const baseLoader = createLoader(
    prisma.priceReport,
    row => {
      const suklCode = Parsers.string(row['Kód SÚKL']);

      // ignore dirty data (non-existing IDs)
      if (!validMedicationIds.has(suklCode)) {
        return [];
      }
      return {
        medicationSuklCode: suklCode,
        period: Parsers.string(row['Období']),
        maxPrice: Parsers.number(row['Konečná prodejní cena s DPH']) ?? null,
        reimbursement: row.reimbursement ?? null,
        patientCopay: row.patient_copay ?? null,
        dispensingMode: Parsers.optionalString(row['Způsob výdeje']),
        reportedAt: Parsers.date(row.reported_at) ?? undefined,
      };
    },
    "price reports"
  );

  await baseLoader(filePath);
}

//TODO: add dispensing restrictions
// ----------------- Dispensing Restrictions -----------------
/*export const loadDispensingRestrictions = createLoader(
  prisma.dispensingRestriction,
  row => ({
    medicationSuklCode: Parsers.string(row.medication_sukl_code),
    restrictionType: row.restriction_type ?? "OTHER",
    subject: Parsers.optionalString(row.subject),
    description: Parsers.optionalString(row.description),
    validFrom: Parsers.date(row.valid_from) ?? undefined,
    validTo: Parsers.date(row.valid_to) ?? undefined,
  }),
  "dispensing restrictions"
);*/

// ----------------- Pharmacies -----------------
import { readCsv } from "./utils/csv";
import { exit } from "node:process";

export async function loadPharmacyTypes(filePath: string): Promise<Record<string, string>> {
  const rows = await readCsv(filePath, ";");
  const map = Object.fromEntries(rows.map(row => [row.TYP_LEKARNY ?? "", row.NAZEV ?? ""]));
  console.log(`Loaded ${Object.keys(map).length} pharmacy types`);
  return map;
}

export const loadPharmacies = (typeMap: Record<string, string>) =>
  createLoader(
    prisma.pharmacy,
    row => ({
      id: Parsers.string(row.KOD_PRACOVISTE),
      name: Parsers.string(row.NAZEV),
      street: Parsers.optionalString(row.ULICE),
      city: Parsers.optionalString(row.MESTO),
      postalCode: Parsers.optionalString(row.PSC),
      country: "CZ",
      type: typeMap[row.TYP_LEKARNY ?? ""] ?? row.TYP_LEKARNY ?? null,
      email: Parsers.optionalString(row.EMAIL),
      phone: Parsers.optionalString(row.TELEFON),
      website: Parsers.optionalString(row.WWW),
      isMailOrder: Parsers.boolean(row.ZASILKOVY_PRODEJ),
      isDuty: Parsers.boolean(row.POHOTOVOST),
    }),
    "pharmacies"
  );

// ----------------- Pharmacy Hours -----------------
export const loadPharmacyHours = createLoader(
  prisma.pharmacyHour,
  row => ({
    pharmacyId: Parsers.string(row.KOD_PRACOVISTE),
    dayOfWeek: Parsers.number(row.DEN) ?? 0,
    openTime: Parsers.optionalString(row.OD),
    closeTime: Parsers.optionalString(row.DO),
    note: null,
  }),
  "pharmacy hours"
);