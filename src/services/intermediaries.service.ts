import { prisma } from "../db/prisma";

type ListParams = {
    name?: string;
    city?: string;
    page?: number;
    limit?: number;
};

export async function getIntermediaries(params: ListParams) {
    const page = params.page && params.page > 0 ? params.page : 1;
    const limit = Math.min(params.limit && params.limit > 0 ? params.limit : 20, 100);

    const where = {
        ...(params.name && { name: { contains: params.name, mode: "insensitive" as const } }),
        ...(params.city && { city: { contains: params.city, mode: "insensitive" as const } }),
    };

    const [data, total] = await Promise.all([
        prisma.intermediary.findMany({
            where,
            skip: (page - 1) * limit,
            take: limit,
            orderBy: { name: "asc" },
        }),
        prisma.intermediary.count({ where }),
    ]);

    return {
        data,
        meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
}

export async function getIntermediaryByIc(ic: string) {
    return prisma.intermediary.findUnique({
        where: { ic },
    });
}
