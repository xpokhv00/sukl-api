import { prisma } from "../db/prisma";

type ListParams = {
    name?: string;
    page?: number;
    limit?: number;
};

export async function getSubstances(params: ListParams) {
    const page = params.page && params.page > 0 ? params.page : 1;
    const limit = Math.min(params.limit && params.limit > 0 ? params.limit : 20, 100);

    const where = {
        ...(params.name && {
            OR: [
                { name: { contains: params.name, mode: "insensitive" as const } },
                { innName: { contains: params.name, mode: "insensitive" as const } },
            ],
        }),
    };

    const [data, total] = await Promise.all([
        prisma.substance.findMany({
            where,
            skip: (page - 1) * limit,
            take: limit,
            orderBy: { name: "asc" },
            select: { id: true, name: true, innName: true },
        }),
        prisma.substance.count({ where }),
    ]);

    return {
        data,
        meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
}

export async function getSubstanceById(id: string) {
    return prisma.substance.findUnique({
        where: { id },
        include: {
            synonyms: { select: { name: true } },
            compositions: {
                include: {
                    medication: {
                        select: {
                            suklCode: true,
                            name: true,
                            strength: true,
                            isActive: true,
                            form: { select: { code: true, name: true } },
                        },
                    },
                },
                orderBy: { medication: { name: "asc" } },
            },
        },
    });
}
