import { prisma } from "../db/prisma";

type ListParams = {
    name?: string;
    page?: number;
    limit?: number;
    searchSynonyms?: boolean;
};

export async function getSubstances(params: ListParams) {
    const page = params.page && params.page > 0 ? params.page : 1;
    const limit = Math.min(params.limit && params.limit > 0 ? params.limit : 20, 100);
    const searchSynonyms = params.searchSynonyms !== false; // Default to true

    const where = {
        ...(params.name && {
            OR: [
                { name: { contains: params.name, mode: "insensitive" as const } },
                { innName: { contains: params.name, mode: "insensitive" as const } },
                ...(searchSynonyms ? [
                    { synonyms: { some: { name: { contains: params.name, mode: "insensitive" as const } } } },
                ] : []),
            ],
        }),
    };

    // When synonyms are involved, Prisma can't sort by match quality in SQL, so we fetch
    // all candidates and rank in memory. For large datasets this is a trade-off — acceptable
    // because substance counts are small and the synonym join already limits the result set.
    if (params.name && searchSynonyms) {
        const substancesWithSynonyms = await prisma.substance.findMany({
            where,
            select: { id: true, name: true, innName: true, synonyms: { select: { name: true } } },
        });

        const scored = substancesWithSynonyms.map(substance => {
            const searchTerm = params.name!.toLowerCase();
            const name = substance.name.toLowerCase();
            const innName = substance.innName!.toLowerCase();

            // Tiers: exact name > exact INN > prefix name > prefix INN > exact synonym > prefix synonym.
        // Score gaps are wide enough that a lower tier never beats a higher one regardless of
        // secondary sort. Unmatched results (score 0) sink to the bottom.
        if (name === searchTerm) return { substance, score: 1000 };
            if (innName === searchTerm) return { substance, score: 900 };
            if (name.startsWith(searchTerm)) return { substance, score: 800 };
            if (innName.startsWith(searchTerm)) return { substance, score: 700 };
            if (substance.synonyms.some(s => s.name.toLowerCase() === searchTerm)) {
                return { substance, score: 600 };
            }
            if (substance.synonyms.some(s => s.name.toLowerCase().startsWith(searchTerm))) {
                return { substance, score: 500 };
            }
            return { substance, score: 0 };
        });

        scored.sort((a, b) => {
            if (b.score !== a.score) return b.score - a.score;
            return a.substance.name.localeCompare(b.substance.name);
        });

        const total = scored.length;
        const paginatedData = scored.slice((page - 1) * limit, page * limit).map(s => ({
            id: s.substance.id,
            name: s.substance.name,
            innName: s.substance.innName,
        }));

        return {
            data: paginatedData,
            meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
        };
    }

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

export async function getSubstanceMedications(id: string, page: number = 1, limit: number = 20) {
    limit = Math.min(limit, 100);
    const offset = (page - 1) * limit;

    const substance = await prisma.substance.findUnique({
        where: { id },
        select: { id: true, name: true, innName: true }
    });

    if (!substance) return null;

    const [medications, total] = await Promise.all([
        prisma.medication.findMany({
            where: {
                compositions: {
                    some: { substanceId: id }
                }
            },
            select: {
                suklCode: true,
                name: true,
                strength: true,
                isActive: true,
                atcCode: true,
                formCode: true,
                routeCode: true,
                priceReports: {
                    select: {
                        period: true,
                        maxPrice: true,
                        reimbursement: true,
                        patientCopay: true
                    },
                    orderBy: { period: "desc" as const },
                    take: 1 
                },
                compositions: {
                    where: { substanceId: id },
                    select: {
                        amount: true,
                        unit: true,
                        type: true
                    }
                }
            },
            skip: offset,
            take: limit,
            orderBy: { name: "asc" }
        }),
        prisma.medication.count({
            where: {
                compositions: { some: { substanceId: id } }
            }
        })
    ]);

    return {
        substance,
        data: medications.map(med => ({
            suklCode: med.suklCode,
            name: med.name,
            strength: med.strength,
            isActive: med.isActive,
            atcCode: med.atcCode,
            formCode: med.formCode,
            routeCode: med.routeCode,
            composition: med.compositions[0],
            latestPrice: med.priceReports[0] || null
        })),
        meta: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit)
        }
    };
}
