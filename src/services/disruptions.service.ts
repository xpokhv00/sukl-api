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
