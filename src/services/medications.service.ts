import { prisma } from "../db/prisma";

type Params = {
    name?: string;
    atc?: string;
    page?: number;
    limit?: number;
};

export async function getMedications(params: Params) {
    const page = params.page && params.page > 0 ? params.page : 1;
    const limit = params.limit && params.limit > 0 ? params.limit : 20;

    const where = {
        ...(params.name && {
            name: {
                contains: params.name,
                mode: "insensitive" as const,
            },
        }),
        ...(params.atc && {
            atcCode: {
                startsWith: params.atc,
            },
        }),
    };

    const [data, total] = await Promise.all([
        prisma.medication.findMany({
            where,
            skip: (page - 1) * limit,
            take: limit,
            orderBy: { name: "asc" },
        }),
        prisma.medication.count({ where }),
    ]);

    return {
        data,
        meta: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
    };
}
