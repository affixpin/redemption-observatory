import { getDexUSDeToUSDC } from "./fetch_dex_USDe_to_USDC.js";
import type { TimedOhlcData, TimedRedemptionData } from "./types.js";
import { mergeRedemptionWithOhlc } from "../redemption/merge_redemption_with_ohlc.js";

export async function getRedemptionsUSDeToUSDC(redemptions: TimedRedemptionData[], startTimestamp: number, endTimestamp: number) : Promise<TimedOhlcData[]>  
{
    const usdcOhlcData = await getDexUSDeToUSDC(startTimestamp, endTimestamp);
    const redemptionToUsdcOhlc = mergeRedemptionWithOhlc(usdcOhlcData, redemptions);
    return redemptionToUsdcOhlc;
}