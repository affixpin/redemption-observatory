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

async function getcrvUSDToUSDCOhlcData(startTimestamp: number, endTimestamp: number) {
    return await getCurveOhlcData({
        chain: "ethereum",
        poolAddress: "0x4DEcE678ceceb27446b35C672dC7d61F30bAD69E",
        mainToken: "0xf939E0A03FB07F59A73314E73794Be0E57ac1b4E",
        referenceToken: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
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
      console.log("sUSDe/USDC timestamp:", sus.time);
      console.log("Merged OHLC:", usdcOhlc);
      merged.push(usdcOhlc);
    }
  
    return merged;
  }

async function main() { 
    try {
        console.log("Start Fetching DEX OHLC Prices");
        const startTimestamp = 1718188800;
        const endTimestamp = 1718275200;
        
        console.log("Fetching sUSDe to crvUSD data...");
        const susDeToCrvUsdData = await getSUSDeToCRVUSDOhlcData(startTimestamp, endTimestamp);
        console.log("sUSDe to crvUSD data received:", Array.isArray(susDeToCrvUsdData), typeof susDeToCrvUsdData);      
        console.log("sUSDe to crvUSD data structure:", susDeToCrvUsdData);
        console.log("Fetching crvUSD to USDC data...");
        const crvUsdToUsdcData = await getcrvUSDToUSDCOhlcData(startTimestamp, endTimestamp);
        console.log("crvUSD to USDC data received:", Array.isArray(crvUsdToUsdcData), typeof crvUsdToUsdcData);
        console.log("crvUSD to USDC data structure:", crvUsdToUsdcData);
        console.log("Merging data...");
        const usdcOhlcData = mergeOhlcToUSDC(susDeToCrvUsdData, crvUsdToUsdcData);
        console.log("Final merged data:", usdcOhlcData);
    } catch (error) {
        console.error("Error in main:", error);
        if (error instanceof Error) {
            console.error("Error message:", error.message);
            console.error("Error stack:", error.stack);
        }
    }
}

main().catch(console.error);






