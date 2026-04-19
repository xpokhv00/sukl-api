import { prisma } from "../db/prisma";

type ListParams = {
  atc?: string;
  suklCode?: string;
  type?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
  isActive?: boolean;
};

async function getDisruptions(params: ListParams) {
  const page = params.page && params.page > 0 ? params.page : 1;
  const limit = Math.min(params.limit && params.limit > 0 ? params.limit : 20, 100);

  const where = {
    ...(params.suklCode && { medicationSuklCode: { equals: params.suklCode } }),
    ...(params.type && { type: { equals: params.type } }),
    ...(params.isActive !== undefined && { isActive: params.isActive }),
    ...(params.dateFrom || params.dateTo) && {
      reportedAt: {
        ...(params.dateFrom && { gte: new Date(params.dateFrom) }),
        ...(params.dateTo && { lte: new Date(params.dateTo) }),
      },
    },
    ...(params.atc && {
      medication: {
        atcCode: { startsWith: params.atc },
      },
    }),
  };

  const [data, total] = await Promise.all([
    prisma.disruption.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { reportedAt: "desc" },
      include: {
        medication: {
          select: {
            suklCode: true,
            name: true,
            atcCode: true,
            isActive: true,
          },
        },
      },
    }),
    prisma.disruption.count({ where }),
  ]);

  return {
    data,
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

export async function listDisruptions(params: ListParams) {
  return getDisruptions({ ...params, isActive: undefined });
}

export async function listActiveDisruptions(params: ListParams) {
  return getDisruptions({ ...params, isActive: true });
}

export async function listActiveDisruptionsWithReplacement(params: ListParams) {
  const page = params.page && params.page > 0 ? params.page : 1;
  const limit = Math.min(params.limit && params.limit > 0 ? params.limit : 20, 100);

  const where = {
    isActive: true,
    ...(params.suklCode && { medicationSuklCode: { equals: params.suklCode } }),
    ...(params.type && { type: { equals: params.type } }),
    ...(params.dateFrom || params.dateTo) && {
      reportedAt: {
        ...(params.dateFrom && { gte: new Date(params.dateFrom) }),
        ...(params.dateTo && { lte: new Date(params.dateTo) }),
      },
    },
    ...(params.atc && {
      medication: {
        atcCode: { startsWith: params.atc },
      },
    }),
  };

  const [disruptions, total] = await Promise.all([
    prisma.disruption.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { reportedAt: "desc" },
      include: {
        medication: {
          select: {
            suklCode: true,
            name: true,
            atcCode: true,
            isActive: true,
          },
        },
      },
    }),
    prisma.disruption.count({ where }),
  ]);

  // replacementSuklCode is a denormalized field on each disruption row, not a relation Prisma
  // can join. We fetch replacement details and their own active disruption status per-item.
  // Acceptable here because page sizes are small (≤100) and this data is not cached.
  const data = await Promise.all(
    disruptions.map(async (disruption) => {
      let replacement = null;
      let replacementIsAlsoDisrupted = false;

      if (disruption.replacementSuklCode) {
        replacement = await prisma.medication.findUnique({
          where: { suklCode: disruption.replacementSuklCode },
          select: {
            suklCode: true,
            name: true,
            atcCode: true,
            isActive: true,
          },
        });

        // Check if replacement is also in active disruptions
        if (replacement) {
          const replacementDisruption = await prisma.disruption.findFirst({
            where: {
              medicationSuklCode: replacement.suklCode,
              isActive: true,
            },
          });
          replacementIsAlsoDisrupted = !!replacementDisruption;
        }
      }

      return {
        ...disruption,
        replacement,
        replacementIsAlsoDisrupted,
      };
    })
  );

  return {
    data,
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

export async function getDisruptionsBySuklCode(suklCode: string, page: number = 1, limit: number = 20) {
  limit = Math.min(limit, 100);

  const [disruptions, total] = await Promise.all([
    prisma.disruption.findMany({
      where: { medicationSuklCode: suklCode },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { reportedAt: "desc" },
      include: {
        medication: {
          select: {
            suklCode: true,
            name: true,
            atcCode: true,
            isActive: true,
          },
        },
      },
    }),
    prisma.disruption.count({ where: { medicationSuklCode: suklCode } }),
  ]);

  return {
    data: disruptions,
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

export async function getReplacementOptions(suklCode: string) {
  // Get recommended replacement from latest active disruption
  const disruption = await prisma.disruption.findFirst({
    where: { medicationSuklCode: suklCode, isActive: true },
    orderBy: { reportedAt: "desc" },
  });

  let recommended: any = null;
  if (disruption?.replacementSuklCode) {
    recommended = await prisma.medication.findUnique({
      where: { suklCode: disruption.replacementSuklCode },
      select: {
        suklCode: true,
        name: true,
        atcCode: true,
        isActive: true,
      },
    });
  }

  // Get original medication's ATC code
  const medication = await prisma.medication.findUnique({
    where: { suklCode },
    select: { atcCode: true },
  });

  // Get other alternatives with same ATC code (exclude the original and recommended)
  let other: any[] = [];
  if (medication?.atcCode) {
    const excludeList = [suklCode];
    if (recommended?.suklCode) {
      excludeList.push(recommended.suklCode);
    }

    other = await prisma.medication.findMany({
      where: {
        atcCode: medication.atcCode,
        suklCode: {
          notIn: excludeList,
        },
      },
      select: {
        suklCode: true,
        name: true,
        isActive: true,
      },
      orderBy: { name: "asc" },
    });
  }

  return {
    recommended,
    other,
  };
}
