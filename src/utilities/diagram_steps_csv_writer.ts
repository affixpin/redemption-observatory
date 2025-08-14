import fs from "fs";
import path from "path";
import { DiagramStep } from "../ohlc/types";

const CSV_FILE_PATH = path.resolve("examples/diagram_steps.csv");
const DEBUG_CSV_FILE_PATH = path.resolve("examples/debug.csv");

export function appendDiagramStepsToCsv(steps: DiagramStep[]) {
  if (steps.length === 0) return;

  const headers = [
    "timestamp",
    "redemptionsUSDeToUSDC_open",
    "redemptionsUSDeToUSDC_high",
    "redemptionsUSDeToUSDC_low",
    "redemptionsUSDeToUSDC_close",
    "dexsUSDeToUSDC_open",
    "dexsUSDeToUSDC_high",
    "dexsUSDeToUSDC_low",
    "dexsUSDeToUSDC_close",
    "dexcrvUSDToUSDC_open",
    "dexcrvUSDToUSDC_high",
    "dexcrvUSDToUSDC_low",
    "dexcrvUSDToUSDC_close",
    "dexUSDeToUSDC_open",
    "dexUSDeToUSDC_high",
    "dexUSDeToUSDC_low",
    "dexUSDeToUSDC_close"
  ];

  const rows = steps.map((step) =>
    [
      step.timestamp,
      step.redemptionsUSDeToUSDC.open,
      step.redemptionsUSDeToUSDC.high,
      step.redemptionsUSDeToUSDC.low,
      step.redemptionsUSDeToUSDC.close,
      step.dexsUSDeToUSDC.open,
      step.dexsUSDeToUSDC.high,
      step.dexsUSDeToUSDC.low,
      step.dexsUSDeToUSDC.close,
      step.dexcrvUSDToUSDC.open,
      step.dexcrvUSDToUSDC.high,
      step.dexcrvUSDToUSDC.low,
      step.dexcrvUSDToUSDC.close,
      step.dexUSDeToUSDC.open,
      step.dexUSDeToUSDC.high,
      step.dexUSDeToUSDC.low,
      step.dexUSDeToUSDC.close
    ].join(",")
  );

  const fileExists = fs.existsSync(CSV_FILE_PATH);
  const content = (fileExists ? "" : headers.join(",") + "\n") + rows.join("\n") + "\n";

  fs.appendFileSync(CSV_FILE_PATH, content, "utf8");
}

export function appendDiagramStepsToDebugCsv(steps: DiagramStep[]) {
  if (steps.length === 0) return;

  const headers = [
    "timestamp",
    "dexsUSDeToCrvUSD_open",
    "dexsUSDeToCrvUSD_high",
    "dexsUSDeToCrvUSD_low",
    "dexsUSDeToCrvUSD_close"
  ];

  const rows = steps.map((step) =>
    [
      step.timestamp,
      step.dexsUSDeToCrvUSD.open,
      step.dexsUSDeToCrvUSD.high,
      step.dexsUSDeToCrvUSD.low,
      step.dexsUSDeToCrvUSD.close
    ].join(",")
  );

  const fileExists = fs.existsSync(DEBUG_CSV_FILE_PATH);
  const content = (fileExists ? "" : headers.join(",") + "\n") + rows.join("\n") + "\n";

  fs.appendFileSync(DEBUG_CSV_FILE_PATH, content, "utf8");
}
