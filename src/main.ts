import { getcrvUSDToUSDCOhlcData } from "./ohlc/fetch_dex_sUSDe_to_USDC.js";
import { getRedemptionsData } from "./redemption/fetch_redemption_prices.js";
import { getDexUSDeToUSDC } from "./ohlc/fetch_dex_USDe_to_USDC.js";
import { getRedemptionsUSDeToUSDC } from "./ohlc/fetch_redemption_USDe_to_USDC.js";
import { getDexSUSDeToUSDC } from "./ohlc/fetch_dex_sUSDe_to_USDC.js";
import { buildDiagramSteps } from "./utilities/diagrams_utility.js";
import { getLatestBlock } from "./redemption/fetch_redemption_prices.js";
import { appendDiagramStepsToCsv } from "./utilities/diagram_steps_csv_writer.js";

const DEFAULT_START_BLOCK = 23101513;
const THRESHOLD_BLOCKS_BETWEEN_ITERATIONS = 50;
const TICK_RATE_MS = 10000;

async function main() {

  let currentBlock = DEFAULT_START_BLOCK;

  while (true) {
    const latestBlock = await getLatestBlock();
    if (latestBlock - currentBlock < THRESHOLD_BLOCKS_BETWEEN_ITERATIONS) {
      console.log(`Skipping iteration because latest block is too close to current block`);
      console.log("latestBlock", latestBlock);
      console.log("currentBlock", currentBlock);
      await sleep(TICK_RATE_MS);
      continue;
    }

    const startBlock = currentBlock;
    const batchRedemptionPickingResult = await getRedemptionsData(startBlock);
    const redemptionsData = batchRedemptionPickingResult.redemptionsData;
    const startTimestamp = redemptionsData[0]?.timestamp ?? 0;
    const endTimestamp = redemptionsData[redemptionsData.length - 1]?.timestamp ?? 0;

    console.log("startTimestamp", startTimestamp);
    console.log("endTimestamp", endTimestamp);

    const sUSDeToUSDCRedemption = await getRedemptionsUSDeToUSDC(redemptionsData, startTimestamp, endTimestamp);
    const USDeToUSDCDex = await getDexUSDeToUSDC(startTimestamp, endTimestamp);
    const crvUSDToUSDCDex = await getcrvUSDToUSDCOhlcData(startTimestamp, endTimestamp);
    const sUSDeToUSDCDex = await getDexSUSDeToUSDC(startTimestamp, endTimestamp);
    const diagramSteps = buildDiagramSteps(
        sUSDeToUSDCRedemption,
        sUSDeToUSDCDex,
        crvUSDToUSDCDex,
        USDeToUSDCDex
      );

    console.log("diagramSteps", diagramSteps);
    appendDiagramStepsToCsv(diagramSteps);
    currentBlock = batchRedemptionPickingResult.endBlock + 1;
    await sleep(TICK_RATE_MS);
  }
}

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

main().catch(console.error);

