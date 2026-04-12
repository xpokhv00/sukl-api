import { prisma } from "../db/prisma";

type ListParams = {
    suklCode?: string;
    districtCode?: string;
    year?: number;
    month?: number;
    page?: number;
    limit?: number;
};

export async function getPrescriptions(params: ListParams) {
    const page = params.page && params.page > 0 ? params.page : 1;
    const limit = Math.min(params.limit && params.limit > 0 ? params.limit : 20, 100);

    const where = {
        ...(params.suklCode && { suklCode: params.suklCode }),
        ...(params.districtCode && { districtCode: params.districtCode }),
        ...(params.year && { year: params.year }),
        ...(params.month && { month: params.month }),
    };

    const [data, total] = await Promise.all([
        prisma.prescription.findMany({
            where,
            skip: (page - 1) * limit,
            take: limit,
            orderBy: [{ year: "desc" }, { month: "desc" }, { quantity: "desc" }],
        }),
        prisma.prescription.count({ where }),
    ]);

    return {
        data,
        meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
}

export async function getPrescriptionsTotal(params: ListParams) {
    const where = {
        ...(params.suklCode && { suklCode: params.suklCode }),
        ...(params.year && { year: params.year }),
        ...(params.month && { month: params.month }),
    };

    const result = await prisma.prescription.aggregate({
        where,
        _sum: { quantity: true },
    });

    return {
        total: result._sum.quantity || 0,
        filters: params,
    };
}
