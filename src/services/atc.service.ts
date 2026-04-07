import { prisma } from "../db/prisma";

export async function getAtcNodes(parentCode?: string) {
    return prisma.atcNode.findMany({
        where: { parentCode: parentCode ?? null },
        orderBy: { code: "asc" },
        select: { code: true, name: true, level: true, parentCode: true },
    });
}

export async function getAtcNode(code: string) {
    const [node, children, medicationCount] = await Promise.all([
        prisma.atcNode.findUnique({ where: { code } }),
        prisma.atcNode.findMany({
            where: { parentCode: code },
            orderBy: { code: "asc" },
            select: { code: true, name: true, level: true },
        }),
        prisma.medication.count({ where: { atcCode: { startsWith: code } } }),
    ]);

    if (!node) return null;
    return { ...node, children, medicationCount };
}
