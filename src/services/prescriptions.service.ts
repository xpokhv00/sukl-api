import { prisma } from "../db/prisma";

type ListParams = {
    suklCode?: string;
    districtCode?: string;
    atcCode?: string;
    year?: number;
    month?: number;
    page?: number;
    limit?: number;
};

export async function getPrescriptions(params: ListParams) {
    const page = params.page && params.page > 0 ? params.page : 1;
    const limit = Math.min(params.limit && params.limit > 0 ? params.limit : 20, 100);

    let medicationSuklCodes: Set<string> | undefined;
    if (params.atcCode) {
        const meds = await prisma.medication.findMany({
            where: { atcCode: { startsWith: params.atcCode } },
            select: { suklCode: true },
        });
        medicationSuklCodes = new Set(meds.map((m) => m.suklCode));
    }

    const where = {
        ...(params.suklCode && { suklCode: params.suklCode }),
        ...(params.districtCode && { districtCode: params.districtCode }),
        ...(params.year && { year: params.year }),
        ...(params.month && { month: params.month }),
        ...(medicationSuklCodes && { suklCode: { in: Array.from(medicationSuklCodes) } }),
    };

    const [prescriptions, total] = await Promise.all([
        prisma.prescription.findMany({
            where,
            skip: (page - 1) * limit,
            take: limit,
            orderBy: [{ year: "desc" }, { month: "desc" }, { quantity: "desc" }],
        }),
        prisma.prescription.count({ where }),
    ]);

    const suklCodes = [...new Set(prescriptions.map((p) => p.suklCode))];
    const medications = await prisma.medication.findMany({
        where: { suklCode: { in: suklCodes } },
        include: {
            form: { select: { code: true, name: true } },
            route: { select: { code: true, name: true } },
            atc: { select: { code: true, name: true } },
        },
    });

    const medicationMap = new Map(medications.map((m) => [m.suklCode, m]));
    const data = prescriptions.map(({ suklCode, ...rest }) => ({
        ...rest,
        medication: medicationMap.get(suklCode),
    }));

    return {
        data,
        meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
}

export async function getPrescriptionsTotal(params: ListParams) {
    let medicationSuklCodes: Set<string> | undefined;
    if (params.atcCode) {
        const meds = await prisma.medication.findMany({
            where: { atcCode: { startsWith: params.atcCode } },
            select: { suklCode: true },
        });
        medicationSuklCodes = new Set(meds.map((m) => m.suklCode));
    }

    const where = {
        ...(params.suklCode && { suklCode: params.suklCode }),
        ...(params.year && { year: params.year }),
        ...(params.month && { month: params.month }),
        ...(medicationSuklCodes && { suklCode: { in: Array.from(medicationSuklCodes) } }),
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

type TopPrescriptionsParams = {
    districtCode?: string;
    atcCode?: string;
    page?: number;
    limit?: number;
};

export async function getTopPrescriptions(params: TopPrescriptionsParams) {
    const page = params.page && params.page > 0 ? params.page : 1;
    const limit = Math.min(params.limit && params.limit > 0 ? params.limit : 20, 100);

    let suklCodeFilter: { in: string[] } | undefined;
    if (params.atcCode?.trim()) {
        const meds = await prisma.medication.findMany({
            where: { atcCode: { startsWith: params.atcCode } },
            select: { suklCode: true },
        });
        suklCodeFilter = { in: meds.map((m) => m.suklCode) };
    }

    const prescriptionsWhere = {
        ...(params.districtCode && { districtCode: params.districtCode }),
        ...(suklCodeFilter && { suklCode: suklCodeFilter }),
    };

    const groupedData = await prisma.prescription.groupBy({
        by: ["suklCode"],
        where: prescriptionsWhere,
        _sum: {
            quantity: true,
        },
        orderBy: {
            _sum: {
                quantity: "desc",
            },
        },
    });

    const totalGrouped = groupedData.length;

    const pagedGroupedData = groupedData.slice((page - 1) * limit, page * limit);
    const suklCodes = pagedGroupedData.map((g) => g.suklCode);

    const medications = await prisma.medication.findMany({
        where: {
            suklCode: {
                in: suklCodes,
            },
        },
        include: {
            form: { select: { code: true, name: true } },
            route: { select: { code: true, name: true } },
            atc: { select: { code: true, name: true } },
        },
    });

    const quantityMap = new Map<string, number>();
    groupedData.forEach((g) => {
        quantityMap.set(g.suklCode, g._sum.quantity || 0);
    });
    const data = medications
        .map((med) => ({
            ...med,
            totalQuantity: quantityMap.get(med.suklCode) || 0,
        }))
        .sort((a, b) => b.totalQuantity - a.totalQuantity);

    return {
        data,
        meta: { page, limit, total: totalGrouped, totalPages: Math.ceil(totalGrouped / limit) },
    };
}
