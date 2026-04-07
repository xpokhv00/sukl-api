import { prisma } from "../db/prisma";

type ListParams = {
    name?: string;
    city?: string;
    postalCode?: string;
    isMailOrder?: boolean;
    isDuty?: boolean;
    page?: number;
    limit?: number;
};

export async function getPharmacies(params: ListParams) {
    const page = params.page && params.page > 0 ? params.page : 1;
    const limit = Math.min(params.limit && params.limit > 0 ? params.limit : 20, 100);

    const where = {
        ...(params.name && { name: { contains: params.name, mode: "insensitive" as const } }),
        ...(params.city && { city: { contains: params.city, mode: "insensitive" as const } }),
        ...(params.postalCode && { postalCode: { startsWith: params.postalCode } }),
        ...(params.isMailOrder !== undefined && { isMailOrder: params.isMailOrder }),
        ...(params.isDuty !== undefined && { isDuty: params.isDuty }),
    };

    const [data, total] = await Promise.all([
        prisma.pharmacy.findMany({
            where,
            skip: (page - 1) * limit,
            take: limit,
            orderBy: { name: "asc" },
            include: { hours: { orderBy: { dayOfWeek: "asc" } } },
        }),
        prisma.pharmacy.count({ where }),
    ]);

    return {
        data,
        meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
}

export async function getPharmacyById(id: string) {
    return prisma.pharmacy.findUnique({
        where: { id },
        include: { hours: { orderBy: { dayOfWeek: "asc" } } },
    });
}
