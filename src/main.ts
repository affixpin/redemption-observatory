import { getcrvUSDToUSDCOhlcData, getSUSDeToCRVUSDOhlcData } from "./ohlc/fetch_dex_sUSDe_to_USDC.js";
import { getRedemptionsData } from "./redemption/fetch_redemption_prices.js";
import { getDexUSDeToUSDC } from "./ohlc/fetch_dex_USDe_to_USDC.js";
import { getRedemptionsUSDeToUSDC } from "./ohlc/fetch_redemption_USDe_to_USDC.js";
import { getDexSUSDeToUSDC } from "./ohlc/fetch_dex_sUSDe_to_USDC.js";
import { buildDiagramSteps } from "./utilities/diagrams_utility.js";
import { getLatestBlock } from "./redemption/fetch_redemption_prices.js";
import { appendDiagramStepsToCsv, appendDiagramStepsToDebugCsv } from "./utilities/diagram_steps_csv_writer.js";

const DEFAULT_START_BLOCK = 20801513;
const THRESHOLD_BLOCKS_BETWEEN_ITERATIONS = 10;
const TICK_RATE_MS = 10000;
const ONE_DAY_TIMESTAMP = 86400;
const MAX_DAYS_PER_CHUNK = 7;

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

    for (let chunkStart = startTimestamp; chunkStart < endTimestamp; chunkStart += ONE_DAY_TIMESTAMP * MAX_DAYS_PER_CHUNK) {
      const chunkEnd = Math.min(chunkStart + ONE_DAY_TIMESTAMP * MAX_DAYS_PER_CHUNK - 1, endTimestamp);

      try {
        const sUSDeToUSDCRedemption = await getRedemptionsUSDeToUSDC(redemptionsData, chunkStart, chunkEnd);
        const USDeToUSDCDex = await getDexUSDeToUSDC(chunkStart, chunkEnd);
        const crvUSDToUSDCDex = await getcrvUSDToUSDCOhlcData(chunkStart, chunkEnd);
        const sUSDeToUSDCDex = await getDexSUSDeToUSDC(chunkStart, chunkEnd);
        const sUSDeToCrvUSDDex = await getSUSDeToCRVUSDOhlcData(chunkStart, chunkEnd);

        const diagramSteps = buildDiagramSteps(
          sUSDeToUSDCRedemption,
          sUSDeToUSDCDex,
          crvUSDToUSDCDex,
          USDeToUSDCDex,
          sUSDeToCrvUSDDex
        );

        console.log("diagramSteps", diagramSteps);
        appendDiagramStepsToCsv(diagramSteps);
        appendDiagramStepsToDebugCsv(diagramSteps);
      } catch (error) {
        console.error("Error during chunk processing:", error);
      }
    }

    currentBlock = batchRedemptionPickingResult.endBlock + 1;
    await sleep(TICK_RATE_MS);
  }
}

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

main().catch(console.error);

