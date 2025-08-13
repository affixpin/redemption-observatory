
import type { TimedOhlcData, TimedRedemptionData } from "../ohlc/types.js";


export function mergeRedemptionWithOhlc(
    sourceOhlc: TimedOhlcData[],
    redemptionPrices: TimedRedemptionData[]
  ): TimedOhlcData[] {

    const redMap = new Map<number, number>();
  
    for (const r of redemptionPrices) {
      const roundedHour = Math.floor(r.timestamp / 3600) * 3600;
      const price = parseFloat(r.price_decimal);
      if (!isNaN(price)) {
        redMap.set(roundedHour, price);
      }
    }

    const result: TimedOhlcData[] = [];
  
    for (const candle of sourceOhlc) {
      const candleHour = Math.floor(candle.time / 3600) * 3600;
      const redemption = redMap.get(candleHour);
  
      if (!redemption || redemption === 0) continue;
  
      result.push({
        time: candle.time,
        open: candle.open * redemption,
        high: candle.high * redemption,
        low: candle.low * redemption,
        close: candle.close * redemption,
      });
    }
  
    return result;
}