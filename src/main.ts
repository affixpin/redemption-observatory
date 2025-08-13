import { getcrvUSDToUSDCOhlcData } from "./ohlc/fetch_dex_sUSDe_to_USDC.js";
import { getRedemptionsData } from "./redemption/fetch_redemption_prices.js";
import { getDexUSDeToUSDC } from "./ohlc/fetch_dex_USDe_to_USDC.js";
import { getRedemptionsUSDeToUSDC } from "./ohlc/fetch_redemption_USDe_to_USDC.js";
import { getDexSUSDeToUSDC } from "./ohlc/fetch_dex_sUSDe_to_USDC.js";
import { buildDiagramSteps } from "./utilities/diagramsUtility.js";

async function main() {

    const redemptionsData = await getRedemptionsData();
    const startTimestamp = redemptionsData[0]?.timestamp ?? 0;
    const endTimestamp = redemptionsData[redemptionsData.length - 1]?.timestamp ?? 0;

    const sUSDeToUSDCRedemption = await getRedemptionsUSDeToUSDC(redemptionsData);
    const USDeToUSDCDex = await getDexUSDeToUSDC(startTimestamp, endTimestamp);
    const crvUSDToUSDCDex = await getcrvUSDToUSDCOhlcData(startTimestamp, endTimestamp);
    const sUSDeToUSDCDex = await getDexSUSDeToUSDC(startTimestamp, endTimestamp);

    const diagramSteps = buildDiagramSteps(
        sUSDeToUSDCRedemption,
        sUSDeToUSDCDex,
        crvUSDToUSDCDex,
        USDeToUSDCDex
      );

    console.log(diagramSteps);
}

main().catch(console.error);

