import { getDexUSDeToUSDC } from "./fetch_dex_USDe_to_USDC.js";
import type { TimedOhlcData, TimedRedemptionData } from "./types.js";
import { mergeRedemptionWithOhlc } from "../redemption/merge_redemption_with_ohlc.js";

export async function getRedemptionsUSDeToUSDC(redemptions: TimedRedemptionData[]) : Promise<TimedOhlcData[]>  
{
    const startTimestamp = redemptions[0]?.timestamp ?? 0;
    const endTimestamp = redemptions[redemptions.length - 1]?.timestamp ?? 0;
    const usdcOhlcData = await getDexUSDeToUSDC(startTimestamp, endTimestamp);
    const redemptionToUsdcOhlc = mergeRedemptionWithOhlc(usdcOhlcData, redemptions);
    return redemptionToUsdcOhlc;
}