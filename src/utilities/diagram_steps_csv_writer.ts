import fs from "fs";
import path from "path";
import { DiagramStep } from "../ohlc/types";

const CSV_FILE_PATH = path.resolve("examples/diagram_steps.csv");
const DEBUG_CSV_FILE_PATH = path.resolve("examples/debug.csv");

export function appendDiagramStepsToCsv(steps: DiagramStep[]) {
  if (steps.length === 0) return;

  const headers = [
    "timestamp",
    "sUSDeToUSDCRedemption_open",
    "sUSDeToUSDCRedemption_high",
    "sUSDeToUSDCRedemption_low",
    "sUSDeToUSDCRedemption_close",
    "sUSDeToUSDCDex_open",
    "sUSDeToUSDCDex_high",
    "sUSDeToUSDCDex_low",
    "sUSDeToUSDCDex_close",
    "crvUSDToUSDCDex_open",
    "crvUSDToUSDCDex_high",
    "crvUSDToUSDCDex_low",
    "crvUSDToUSDCDex_close",
    "usdeToUSDCDex_open",
    "usdeToUSDCDex_high",
    "usdeToUSDCDex_low",
    "usdeToUSDCDex_close"
  ];

  const rows = steps.map((step) =>
    [
      step.timestamp,
      step.sUSDeToUSDCRedemption.open,
      step.sUSDeToUSDCRedemption.high,
      step.sUSDeToUSDCRedemption.low,
      step.sUSDeToUSDCRedemption.close,
      step.sUSDeToUSDCDex.open,
      step.sUSDeToUSDCDex.high,
      step.sUSDeToUSDCDex.low,
      step.sUSDeToUSDCDex.close,
      step.crvUSDToUSDCDex.open,
      step.crvUSDToUSDCDex.high,
      step.crvUSDToUSDCDex.low,
      step.crvUSDToUSDCDex.close,
      step.usdeToUSDCDex.open,
      step.usdeToUSDCDex.high,
      step.usdeToUSDCDex.low,
      step.usdeToUSDCDex.close
    ].join(",")
  );

  const writeHeader = !fs.existsSync(CSV_FILE_PATH);
  const content = (writeHeader ? headers.join(",") + "\n" : "") + rows.join("\n") + "\n";

  fs.appendFileSync(CSV_FILE_PATH, content, "utf8");
}

export function appendDiagramStepsToDebugCsv(steps: DiagramStep[]) {
  if (steps.length === 0) return;

  const headers = [
    "timestamp",
    "sUSDeToCrvUSDDex_open",
    "sUSDeToCrvUSDDex_high",
    "sUSDeToCrvUSDDex_low",
    "sUSDeToCrvUSDDex_close"
  ];

  const rows = steps.map((step) =>
    [
      step.timestamp,
      step.sUSDeToCrvUSDDex.open,
      step.sUSDeToCrvUSDDex.high,
      step.sUSDeToCrvUSDDex.low,
      step.sUSDeToCrvUSDDex.close
    ].join(",")
  );

  const writeHeader = !fs.existsSync(DEBUG_CSV_FILE_PATH);
  const content = (writeHeader ? headers.join(",") + "\n" : "") + rows.join("\n") + "\n";

  fs.appendFileSync(DEBUG_CSV_FILE_PATH, content, "utf8");
}