import { prisma } from "../db/prisma";

type ListParams = {
    changeType?: "NEW" | "CANCELLED" | "CANCELLED_EU";
    name?: string;
    holder?: string;
    page?: number;
    limit?: number;
};

export async function getRegistrationChanges(params: ListParams) {
    const page = params.page && params.page > 0 ? params.page : 1;
    const limit = Math.min(params.limit && params.limit > 0 ? params.limit : 20, 100);

    const where = {
        ...(params.changeType && { changeType: params.changeType }),
        ...(params.name && { name: { contains: params.name, mode: "insensitive" as const } }),
        ...(params.holder && { holder: { contains: params.holder, mode: "insensitive" as const } }),
    };

    const [data, total] = await Promise.all([
        prisma.registrationChange.findMany({
            where,
            skip: (page - 1) * limit,
            take: limit,
            orderBy: { effectiveDate: "desc" },
        }),
        prisma.registrationChange.count({ where }),
    ]);

    return {
        data,
        meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
}
