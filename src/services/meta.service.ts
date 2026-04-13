import { prisma } from "../db/prisma";

export async function getPharmaceuticalForms() {
  return prisma.pharmaceuticalForm.findMany({
    select: {
      code: true,
      name: true,
      edqmCode: true,
    },
    orderBy: { name: "asc" },
  });
}

export async function getAdministrationRoutes() {
  return prisma.administrationRoute.findMany({
    select: {
      code: true,
      name: true,
      edqmCode: true,
    },
    orderBy: { name: "asc" },
  });
}

export async function getDispensingCategories() {
  return prisma.dispensingCategory.findMany({
    select: {
      code: true,
      name: true,
    },
    orderBy: { name: "asc" },
  });
}

export async function getRegistrationStatuses() {
  return prisma.registrationStatus.findMany({
    select: {
      code: true,
      name: true,
    },
    orderBy: { name: "asc" },
  });
}

export async function getDopingCategories() {
  return prisma.dopingCategory.findMany({
    select: {
      code: true,
      name: true,
    },
    orderBy: { name: "asc" },
  });
}

export async function getDependencyCategories() {
  return prisma.dependencyCategory.findMany({
    select: {
      code: true,
      name: true,
    },
    orderBy: { name: "asc" },
  });
}

export async function getMedicationTypes() {
  return prisma.medicationType.findMany({
    select: {
      code: true,
      name: true,
    },
    orderBy: { name: "asc" },
  });
}

export async function getIndicationGroups() {
  return prisma.indicationGroup.findMany({
    select: {
      code: true,
      name: true,
    },
    orderBy: { name: "asc" },
  });
}

export async function getNarcoticCategories() {
  return prisma.narcoticCategory.findMany({
    select: {
      code: true,
      name: true,
    },
    orderBy: { name: "asc" },
  });
}

export async function getPharmacyTypes() {
  const pharmacies = await prisma.pharmacy.findMany({
    select: {
      type: true,
    },
    distinct: ["type"],
    orderBy: { type: "asc" },
  });
  
  return pharmacies
    .filter(p => p.type !== null)
    .map(p => ({ name: p.type! }))
    .sort((a, b) => a.name.localeCompare(b.name));
}
