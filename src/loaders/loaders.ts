import { prisma } from "../db/prisma";
import { Parsers } from "./utils/parsers";
import { extractFirstCode, normalizeSuklCode, normalizeType } from "./utils/helpers";
import { createLoader } from "./utils/createLoader";
import { readCsv, streamCsv } from "./utils/csv";

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
    suklCode: normalizeSuklCode(row.KOD_SUKL) || "0",
    name: Parsers.string(row.NAZEV),
    strength: Parsers.optionalString(row.SILA),
    atcCode: Parsers.optionalString(row.ATC_WHO),
    isActive: true,

    // initialize FK fields for the record
    ean: null,
    registrationNumber: null,
    organizationCode: null,
    formCode: null,
    routeCode: null,
    dispensingCategoryCode: null,
    registrationStatusCode: null,
    dependencyCategoryCode: null,
    medicationTypeCode: null,
    indicationGroupCode: null,
    narcoticCategoryCode: null,
  }),
  "medications"
);

export async function updateMedicationFks(filePath: string) {
  // Load valid codes for each FK to avoid constraint violations on dirty data
  const [forms, routes, orgs, statuses, dispensing, deps, typs, inds, nars] = await Promise.all([
    prisma.pharmaceuticalForm.findMany({ select: { code: true } }).then(r => new Set(r.map(x => x.code))),
    prisma.administrationRoute.findMany({ select: { code: true } }).then(r => new Set(r.map(x => x.code))),
    prisma.organization.findMany({ select: { code: true } }).then(r => new Set(r.map(x => x.code))),
    prisma.registrationStatus.findMany({ select: { code: true } }).then(r => new Set(r.map(x => x.code))),
    prisma.dispensingCategory.findMany({ select: { code: true } }).then(r => new Set(r.map(x => x.code))),
    prisma.dependencyCategory.findMany({ select: { code: true } }).then(r => new Set(r.map(x => x.code))),
    prisma.medicationType.findMany({ select: { code: true } }).then(r => new Set(r.map(x => x.code))),
    prisma.indicationGroup.findMany({ select: { code: true } }).then(r => new Set(r.map(x => x.code))),
    prisma.narcoticCategory.findMany({ select: { code: true } }).then(r => new Set(r.map(x => x.code))),
  ]);

  const valid = (code: string | null, set: Set<string>): string | null =>
    code !== null && set.has(code) ? code : null;

  const stream = streamCsv(filePath);
  type Row = {
    suklCode: string;
    ean: string | null; reg: string | null;
    form: string | null; route: string | null; org: string | null;
    status: string | null; disp: string | null;
    dep: string | null; typ: string | null; ind: string | null; nar: string | null;
  };
  let batch: Row[] = [];
  let total = 0;

  const flush = async (rows: Row[]) => {
    const values = rows
      .map(r => `(${[r.suklCode, r.ean, r.reg, r.form, r.route, r.org, r.status, r.disp, r.dep, r.typ, r.ind, r.nar]
        .map(v => v === null ? 'NULL' : `'${v.replace(/'/g, "''")}'`).join(',')})`)
      .join(',');

    await prisma.$executeRawUnsafe(`
      UPDATE medications AS m
      SET
        ean                      = v.ean::text,
        registration_number      = v.reg::text,
        form_code                = v.form::text,
        route_code               = v.route::text,
        organization_code        = v.org::text,
        registration_status_code = v.status::text,
        dispensing_category_code = v.disp::text,
        dependency_category_code = v.dep::text,
        medication_type_code     = v.typ::text,
        indication_group_code    = v.ind::text,
        narcotic_category_code   = v.nar::text
      FROM (VALUES ${values}) AS v(sukl_code, ean, reg, form, route, org, status, disp, dep, typ, ind, nar)
      WHERE m.sukl_code = v.sukl_code
    `);
    total += rows.length;
  };

  for await (const row of stream) {
    const r = row as any;
    batch.push({
      suklCode: normalizeSuklCode(r.KOD_SUKL) || "0",
      ean:      Parsers.optionalString(r.EAN)    ?? null,
      reg:      Parsers.optionalString(r.RC)     ?? null,
      form:     valid(Parsers.optionalString(r.FORMA)  ?? null, forms),
      route:    valid(Parsers.optionalString(r.CESTA)  ?? null, routes),
      org:      valid(Parsers.optionalString(r.DRZ)    ?? null, orgs),
      status:   valid(Parsers.optionalString(r.REG)    ?? null, statuses),
      disp:     valid(Parsers.optionalString(r.VYDEJ)  ?? null, dispensing),
      dep:      valid(Parsers.optionalString(r.ZAV)    ?? null, deps),
      typ:      valid(Parsers.optionalString(r.TYP_LP) ?? null, typs),
      ind:      valid(Parsers.optionalString(r.LL)     ?? null, inds),
      nar:      valid(Parsers.optionalString(r.NARVLA) ?? null, nars),
    });
    if (batch.length >= 2000) {
      await flush(batch);
      batch = [];
    }
  }
  if (batch.length > 0) await flush(batch);
  console.log(`Updated FK columns on ${total} medications`);
}

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
    code: Parsers.string(row.VYDEJ),
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
      const suklCode = normalizeSuklCode(row.KOD_SUKL);
      const substanceId = Parsers.string(row.KOD_LATKY);

      // ignore dirty data (non-existing IDs)
      if (!suklCode || !validMedicationIds.has(suklCode) || !validSubstanceIds.has(substanceId)) {
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
    const sukl = normalizeSuklCode(row.KOD_SUKL);
    if (!sukl) return [];
    
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
      const suklCode = normalizeSuklCode(row.KOD_SUKL);

      // ignore dirty data (non-existing IDs)
      if (!suklCode || !validMedicationIds.has(suklCode)) {
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
        replacementSuklCode: normalizeSuklCode(extractFirstCode(row.NAHRAZUJICI_LP)),
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
      const suklCode = normalizeSuklCode(row['Kód SÚKL']);

      // ignore dirty data (non-existing IDs)
      if (!suklCode || !validMedicationIds.has(suklCode)) {
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

// ----------------- Dispensing Restrictions -----------------
export async function loadDispensingRestrictions(filePath: string) {
  const validMedications = await prisma.medication.findMany({ select: { suklCode: true } });
  const validIds = new Set(validMedications.map(m => m.suklCode));

  const baseLoader = createLoader(
    prisma.dispensingRestriction,
    row => {
      const suklCode = normalizeSuklCode(row.KOD_SUKL);
      if (!suklCode || !validIds.has(suklCode)) return [];

      const validFrom = Parsers.date(row.PLATNOST_OD) ?? undefined;
      const validTo = Parsers.date(row.PLATNOST_DO) ?? undefined;
      const description = Parsers.optionalString(row.TYP);
      const result: any[] = [];

      if (Parsers.boolean(row.LEKAR))
        result.push({ medicationSuklCode: suklCode, restrictionType: "DOCTOR", description, validFrom, validTo });
      if (Parsers.boolean(row.LEKARNIK))
        result.push({ medicationSuklCode: suklCode, restrictionType: "PHARMACIST", description, validFrom, validTo });
      if (Parsers.boolean(row.PACIENT))
        result.push({ medicationSuklCode: suklCode, restrictionType: "PATIENT", description, validFrom, validTo });

      return result;
    },
    "dispensing restrictions",
    ";",
    1000,
    "utf8"
  );
  await baseLoader(filePath);
}

// ----------------- Pharmacies -----------------

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

// ----------------- Doping Categories -----------------
export const loadDopingCategories = createLoader(
  prisma.dopingCategory,
  row => ({
    code: Parsers.string(row.DOPING),
    name: Parsers.string(row.NAZEV),
  }),
  "doping categories"
);

// ----------------- Dependency Categories -----------------
export const loadDependencyCategories = createLoader(
  prisma.dependencyCategory,
  row => ({
    code: Parsers.string(row.ZAV),
    name: Parsers.string(row.NAZEV_CS),
  }),
  "dependency categories"
);

// ----------------- Medication Types -----------------
export const loadMedicationTypes = createLoader(
  prisma.medicationType,
  row => ({
    code: Parsers.string(row.TYP_LP),
    name: Parsers.string(row.NAZEV),
    nameEn: Parsers.optionalString(row.NAZEV_EN),
  }),
  "medication types"
);

// ----------------- Indication Groups -----------------
export const loadIndicationGroups = createLoader(
  prisma.indicationGroup,
  row => ({
    code: Parsers.string(row.INDSK),
    name: Parsers.string(row.NAZEV),
  }),
  "indication groups"
);

// ----------------- Narcotic Categories -----------------
export const loadNarcoticCategories = createLoader(
  prisma.narcoticCategory,
  row => ({
    code: Parsers.string(row.NARVLA),
    name: Parsers.string(row.NAZEV),
  }),
  "narcotic categories"
);

// ----------------- Medication Doping (junction) -----------------
export async function loadMedicationDoping(filePath: string) {
  const validMedications = await prisma.medication.findMany({ select: { suklCode: true } });
  const validIds = new Set(validMedications.map(m => m.suklCode));

  const baseLoader = createLoader(
    prisma.medicationDoping,
    row => {
      const suklCode = normalizeSuklCode(row.KOD_SUKL);
      if (!suklCode || !validIds.has(suklCode)) return [];
      return {
        medicationSuklCode: suklCode,
        dopingCategoryCode: Parsers.string(row.KOD_DOPING),
      };
    },
    "medication doping entries"
  );
  await baseLoader(filePath);
}

// ----------------- Registration Changes -----------------
export async function loadRegistrationChanges(filePath: string, changeType: string) {
  const baseLoader = createLoader(
    prisma.registrationChange,
    row => ({
      changeType,
      name: Parsers.string(row.NAZEV),
      strength: Parsers.optionalString(row.SILA),
      formCode: Parsers.optionalString(row.KOD_LEKOVA_FORMA),
      routeCode: Parsers.optionalString(row.KOD_CESTA_PODANI),
      registrationNumber: Parsers.optionalString(row.REGISTRACNI_CISLO),
      mrpNumber: Parsers.optionalString(row.MRP_CISLO),
      holder: Parsers.optionalString(row.DRZITEL),
      effectiveDate: Parsers.date(row.PRAVOMOCNOST) ?? Parsers.date(row.PLATNOST_REGISTRACE_DO) ?? undefined,
      statusCode: Parsers.optionalString(row.KOD_STAV_REGISTRACE),
    }),
    `registration changes (${changeType})`
  );
  await baseLoader(filePath);
}

// ----------------- Prescriptions -----------------
export async function loadPrescriptions(filePath: string) {
  const validMedications = await prisma.medication.findMany({ select: { suklCode: true } });
  const validIds = new Set(validMedications.map(m => m.suklCode));

  const baseLoader = createLoader(
    prisma.prescription,
    row => {
      const suklCode = normalizeSuklCode(row.KOD_SUKL);
      if (!suklCode || !validIds.has(suklCode)) return [];
      return {
        districtCode: Parsers.string(row.OKRES_KOD),
        districtName: Parsers.optionalString(row.OKRES_NAZEV),
        year: Parsers.number(row.ROK) ?? 0,
        month: Parsers.number(row.MESIC) ?? 0,
        suklCode,
        quantity: Parsers.number(row.MNOZSTVI) ?? 0,
      };
    },
    "prescriptions",
    ",",
    1000,
    "utf8"
  );
  await baseLoader(filePath);
}