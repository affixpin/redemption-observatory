import { getCurveOhlcData } from "./fetch_dex_ohlc_prices.js";
import type { TimedOhlcData } from "./types.js";


export async function getDexUSDeToUSDC(startTimestamp: number, endTimestamp: number) : Promise<TimedOhlcData[]> {
    const usdeUsdcOhlc = await getCurveOhlcData({
        chain: "ethereum",
        poolAddress: "0x02950460E2b9529D0E00284A5fA2d7bDF3fA4d72",
        mainToken: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
        referenceToken: "0x4c9EDD5852cd905f086C759E8383e09bff1E68B3",
        aggNumber: "1",
        start: startTimestamp,
        end: endTimestamp
    });

    return usdeUsdcOhlc;
}