import type { DiagramStep, TimedOhlcData } from "../ohlc/types.js";
import type { OhlcData } from "../ohlc/types.js";

export function buildDiagramSteps(
    susdeRedemption: TimedOhlcData[],
    susdeDex: TimedOhlcData[],
    crvusdDex: TimedOhlcData[],
    usdeDex: TimedOhlcData[],
    sUSDeToCrvUSDDex: TimedOhlcData[]
  ): DiagramStep[] {
    const result: DiagramStep[] = [];
  
    // Normalize data to Map by rounded timestamp (hourly)
    const normalize = (data: TimedOhlcData[]) => {
      const map = new Map<number, OhlcData>();
      for (const d of data) {
        const t = Math.floor(d.time / 3600) * 3600;
        map.set(t, {
          open: d.open,
          high: d.high,
          low: d.low,
          close: d.close,
        });
      }
      return map;
    };
  
    const redemptionMap = normalize(susdeRedemption);
    const dexMap = normalize(susdeDex);
    const crvMap = normalize(crvusdDex);
    const usdeMap = normalize(usdeDex);
    const sUSDeToCrvUSDDexMap = normalize(sUSDeToCrvUSDDex);
  
    // Get shared timestamps
    const sharedTimestamps = [...redemptionMap.keys()].filter(
      (ts) => dexMap.has(ts) && crvMap.has(ts) && usdeMap.has(ts) && sUSDeToCrvUSDDexMap.has(ts)
    ).sort();
  
    for (const ts of sharedTimestamps) {
      result.push({
        timestamp: ts,
        redemptionsUSDeToUSDC: redemptionMap.get(ts)!,
        dexsUSDeToUSDC: dexMap.get(ts)!,
        dexcrvUSDToUSDC: crvMap.get(ts)!,
        dexUSDeToUSDC: usdeMap.get(ts)!,
        dexsUSDeToCrvUSDC: sUSDeToCrvUSDDexMap.get(ts)!,
      });
    }
  
    return result;
  }