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

    // If searching with a name, fetch all results with synonyms for better sorting
    // Prisma doesn't really support better way to do this...
    if (params.name && searchSynonyms) {
        const substancesWithSynonyms = await prisma.substance.findMany({
            where,
            select: { id: true, name: true, innName: true, synonyms: { select: { name: true } } },
        });

        const scored = substancesWithSynonyms.map(substance => {
            const searchTerm = params.name!.toLowerCase();
            const name = substance.name.toLowerCase();
            const innName = substance.innName!.toLowerCase();

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
