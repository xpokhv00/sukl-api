import { prisma } from "../db/prisma";

type ListParams = {
    name?: string;
    atc?: string;
    substance?: string;
    form?: string;
    dispensing?: string;
    page?: number;
    limit?: number;
};

export async function getMedications(params: ListParams) {
    const page = params.page && params.page > 0 ? params.page : 1;
    const limit = Math.min(params.limit && params.limit > 0 ? params.limit : 20, 100);

    const where = {
        ...(params.name && { name: { contains: params.name, mode: "insensitive" as const } }),
        ...(params.atc && { atcCode: { startsWith: params.atc } }),
        ...(params.form && { formCode: params.form }),
        ...(params.dispensing && { dispensingCategoryCode: params.dispensing }),
        ...(params.substance && {
            compositions: {
                some: {
                    substance: {
                        OR: [
                            { name: { contains: params.substance, mode: "insensitive" as const } },
                            { innName: { contains: params.substance, mode: "insensitive" as const } },
                        ],
                    },
                },
            },
        }),
    };

    const [data, total] = await Promise.all([
        prisma.medication.findMany({
            where,
            skip: (page - 1) * limit,
            take: limit,
            orderBy: { name: "asc" },
            include: {
                form: { select: { code: true, name: true } },
                route: { select: { code: true, name: true } },
                dispensingCategory: { select: { code: true, name: true } },
                registrationStatus: { select: { code: true, name: true } },
                atc: { select: { code: true, name: true } },
                organization: { select: { code: true, name: true } },
                dependencyCategory: { select: { code: true, name: true } },
                narcoticCategory: { select: { code: true, name: true } },
                indicationGroup: { select: { code: true, name: true } },
            },
        }),
        prisma.medication.count({ where }),
    ]);

    return {
        data,
        meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
}

export async function getMedicationByCode(suklCode: string) {
    return prisma.medication.findUnique({
        where: { suklCode },
        include: {
            form: true,
            route: true,
            dispensingCategory: true,
            registrationStatus: true,
            atc: true,
            organization: true,
            dependencyCategory: true,
            narcoticCategory: true,
            indicationGroup: true,
            medicationType: true,
            compositions: {
                include: { substance: { select: { id: true, name: true, innName: true } } },
            },
            documents: true,
            disruptions: { orderBy: { reportedAt: "desc" } },
            priceReports: { orderBy: { period: "desc" }, take: 12 },
            dispensingRestrictions: true,
            dopingEntries: { include: { dopingCategory: true } },
        },
    });
}
