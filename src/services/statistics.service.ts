import { prisma } from "../db/prisma";

const DEFAULT_SUPPLY_RISK_CACHE_TTL_MS = 60_000;
const supplyRiskCacheTtlMs = Number.parseInt(process.env.SUPPLY_RISK_CACHE_TTL_MS || "", 10) || DEFAULT_SUPPLY_RISK_CACHE_TTL_MS;

let supplyRiskCache: { data: SupplyRiskItem[]; expiresAt: number } | null = null;

export interface SupplyRiskItem {
  atcCode: string;
  atcName: string;
  activeDisruptions: number;
  totalPrescriptions: number;
  missingVolume: number;
  marketShareRatio: number;
  riskScore: number;
}

export async function getSupplyRiskStatistics(limit: number = 20): Promise<SupplyRiskItem[]> {
  const now = Date.now();
  if (supplyRiskCache && supplyRiskCache.expiresAt > now) {
    return supplyRiskCache.data.slice(0, limit);
  }

  const activeDisruptions = await prisma.disruption.findMany({
    where: { isActive: true },
    include: {
      medication: {
        select: {
          suklCode: true,
          atcCode: true,
          atc: { select: { name: true } },
        },
      },
    },
  });

  const prescriptionVolumes = await prisma.prescription.groupBy({
    by: ["suklCode"],
    _sum: { quantity: true },
  });

  const medicationCodes = await prisma.medication.findMany({
    select: { suklCode: true, atcCode: true },
  });

  const medicationAtcMap = new Map<string, string>();
  medicationCodes.forEach((m) => {
    if (m.atcCode) medicationAtcMap.set(m.suklCode, m.atcCode);
  });

  const totalMedicationsByAtc = new Map<string, number>();
  medicationCodes.forEach((m) => {
    if (m.atcCode) {
      totalMedicationsByAtc.set(m.atcCode, (totalMedicationsByAtc.get(m.atcCode) || 0) + 1);
    }
  });

  const suklPrescriptionMap = new Map<string, number>();
  prescriptionVolumes.forEach((pv) => {
    suklPrescriptionMap.set(pv.suklCode, pv._sum.quantity || 0);
  });

  const prescriptionByAtc = new Map<string, number>();
  prescriptionVolumes.forEach((pv) => {
    const atcCode = medicationAtcMap.get(pv.suklCode);
    if (atcCode) {
      prescriptionByAtc.set(
        atcCode,
        (prescriptionByAtc.get(atcCode) || 0) + (pv._sum.quantity || 0)
      );
    }
  });

  const disruptionsByAtc = new Map<string, { missingSuklCodes: Set<string>; missingVolume: number; atcName?: string }>();
  activeDisruptions.forEach((d) => {
    if (d.medication.atcCode && d.medication.suklCode) {
      const current = disruptionsByAtc.get(d.medication.atcCode) || {
        missingSuklCodes: new Set<string>(),
        missingVolume: 0,
        atcName: d.medication.atc?.name,
      };

      if (!current.missingSuklCodes.has(d.medication.suklCode)) {
        current.missingSuklCodes.add(d.medication.suklCode);
        current.missingVolume += (suklPrescriptionMap.get(d.medication.suklCode) || 0);
      }
      
      disruptionsByAtc.set(d.medication.atcCode, current);
    }
  });

  const results: SupplyRiskItem[] = Array.from(disruptionsByAtc.entries()).map(
    ([atcCode, { missingSuklCodes, missingVolume, atcName }]) => {
      const count = missingSuklCodes.size;
      const totalVolume = prescriptionByAtc.get(atcCode) || 0;
      const totalMedications = totalMedicationsByAtc.get(atcCode) || 1;

      const countRatio = Math.min(count / totalMedications, 1);
      const rawMarketShareRatio = totalVolume > 0 ? missingVolume / totalVolume : countRatio;
      const marketShareRatio = Math.min(rawMarketShareRatio, 1);

      const k = 10;
      const x0 = 0.6; 
      const sigmoidPenalty = 1 / (1 + Math.exp(-k * (marketShareRatio - x0)));

      const maxSigmoid = 1 / (1 + Math.exp(-k * (1 - x0)));
      const normalizedPenalty = sigmoidPenalty / maxSigmoid;

      const riskScore = totalVolume > 0 
        ? normalizedPenalty * Math.log10(totalVolume + 1) * 100
        : countRatio * 2 * 100;

      const modifiedRiskScore = riskScore * (1 + (Math.log10(count + 1) * 0.05));
        
      return {
        atcCode,
        atcName: atcName || "Unknown",
        activeDisruptions: count,
        totalPrescriptions: totalVolume,
        missingVolume,
        marketShareRatio,
        riskScore: modifiedRiskScore,
      };
    }
  );

  const sortedResults = results.sort((a, b) => b.riskScore - a.riskScore);

  supplyRiskCache = {
    data: sortedResults,
    expiresAt: Date.now() + supplyRiskCacheTtlMs,
  };

  return sortedResults.slice(0, limit);
}