import { prisma } from "../db/prisma";

type ListParams = {
    name?: string;
    country?: string;
    page?: number;
    limit?: number;
};

type MedicationsParams = {
    code: string;
    page?: number;
    limit?: number;
};

type DisruptionsParams = {
    code: string;
    page?: number;
    limit?: number;
};

export async function getOrganizations(params: ListParams) {
    const page = params.page && params.page > 0 ? params.page : 1;
    const limit = Math.min(params.limit && params.limit > 0 ? params.limit : 20, 100);

    const where = {
        ...(params.name && { name: { contains: params.name, mode: "insensitive" as const } }),
        ...(params.country && { countryCode: { equals: params.country } }),
    };

    const [data, total] = await Promise.all([
        prisma.organization.findMany({
            where,
            skip: (page - 1) * limit,
            take: limit,
            orderBy: { name: "asc" },
        }),
        prisma.organization.count({ where }),
    ]);

    return {
        data,
        meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
}

export async function getOrganizationByCode(code: string) {
    return prisma.organization.findUnique({
        where: { code },
    });
}

export async function getOrganizationMedications(params: MedicationsParams) {
    const page = params.page && params.page > 0 ? params.page : 1;
    const limit = Math.min(params.limit && params.limit > 0 ? params.limit : 20, 100);

    const where = {
        organizationCode: params.code,
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
            },
        }),
        prisma.medication.count({ where }),
    ]);

    return {
        data,
        meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
}

export async function getOrganizationDisruptions(params: DisruptionsParams) {
    const page = params.page && params.page > 0 ? params.page : 1;
    const limit = Math.min(params.limit && params.limit > 0 ? params.limit : 20, 100);

    const where = {
        isActive: true,
        medication: {
            organizationCode: params.code,
        },
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
