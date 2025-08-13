import type { TimedOhlcData } from "./types.js";
import { getCurveOhlcData } from "./fetch_dex_ohlc_prices.js";


async function getSUSDeToCRVUSDOhlcData(startTimestamp: number, endTimestamp: number) {
     return await getCurveOhlcData({
        chain: "ethereum",
        poolAddress: "0x57064F49Ad7123C92560882a45518374ad982e85",
        mainToken: "0xf939E0A03FB07F59A73314E73794Be0E57ac1b4E",
        referenceToken: "0x9D39A5DE30e57443BfF2A8307A4256c8797A3497",
        aggNumber: "1",
        start: startTimestamp,
        end: endTimestamp,
     })
}

export async function getcrvUSDToUSDCOhlcData(startTimestamp: number, endTimestamp: number) {
    return await getCurveOhlcData({
        chain: "ethereum",
        poolAddress: "0x4DEcE678ceceb27446b35C672dC7d61F30bAD69E",
        mainToken: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
        referenceToken: "0xf939E0A03FB07F59A73314E73794Be0E57ac1b4E",
        aggNumber: "1",
        start: startTimestamp,
        end: endTimestamp,
    })
}

function mergeOhlcToUSDC(
    susDeToCrvUsd: TimedOhlcData[],
    crvUsdToUsdc: TimedOhlcData[]
  ): TimedOhlcData[] {
    const merged: TimedOhlcData[] = [];
  
    if (!Array.isArray(susDeToCrvUsd) || !Array.isArray(crvUsdToUsdc)) {
        console.error("Input data is not arrays:", {
            susDeToCrvUsd: typeof susDeToCrvUsd,
            crvUsdToUsdc: typeof crvUsdToUsdc
        });
        return [];
    }

    if (susDeToCrvUsd.length === 0 || crvUsdToUsdc.length === 0) {
        console.warn("One or both datasets are empty:", {
            susDeToCrvUsd: susDeToCrvUsd.length,
            crvUsdToUsdc: crvUsdToUsdc.length
        });
        return [];
    }
  
    const crvUsdMap = new Map<number, TimedOhlcData>();
    for (const candle of crvUsdToUsdc) {
      crvUsdMap.set(candle.time, candle);
    }
  
    for (const sus of susDeToCrvUsd) {
      const crvTimestampedOhlc = crvUsdMap.get(sus.time);
      if (!crvTimestampedOhlc) { continue; }
    
      const usdcOhlc: TimedOhlcData = {
        time: sus.time,
        open: sus.open * crvTimestampedOhlc.open,
        high: sus.high * crvTimestampedOhlc.high,
        low:  sus.low  * crvTimestampedOhlc.low,
        close:sus.close * crvTimestampedOhlc.close,
      }
      merged.push(usdcOhlc);
    }
  
    return merged;
  }

export async function getDexSUSDeToUSDC(startTimestamp: number, endTimestamp: number) : Promise<TimedOhlcData[]> { 
    const sUsdeToCrvUsdData = await getSUSDeToCRVUSDOhlcData(startTimestamp, endTimestamp);
    const crvUsdToUsdcData = await getcrvUSDToUSDCOhlcData(startTimestamp, endTimestamp);
    const usdcOhlcData = mergeOhlcToUSDC(sUsdeToCrvUsdData, crvUsdToUsdcData);
    return usdcOhlcData;
}




