import type { TimedOhlcData } from "./types.js";

export async function getCurveOhlcData(options: {
        chain: string;
        poolAddress: string;
    mainToken: string;
    referenceToken: string;
    aggNumber?: string;      
    aggUnits?: string;       
    start: number;
    end: number;
}): Promise<TimedOhlcData[]> {
    const {
        chain,
        poolAddress,
        mainToken,
        referenceToken,
        aggNumber = "1",
        aggUnits = "hour",
        start,
        end
    } = options;

    const url = new URL(`https://prices.curve.finance/v1/ohlc/${chain}/${poolAddress}`);

    const params: Record<string, string> = {
        main_token: mainToken,
        reference_token: referenceToken,
        agg_number: aggNumber,
        agg_units: aggUnits,
        start: String(start),
        end: String(end),
    };

    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));

    const response = await fetch(url.toString());
    if (!response.ok) {
        console.log("params", params);
        console.log("url", url.toString());
        throw new Error(`Failed to fetch: ${response.statusText}`);
    }

    const json = await response.json() as {  data: TimedOhlcData[] };
    return json.data;
}
