import type { TimedRedemptionData } from "../ohlc/types.js";


const RPC_BLOCKS = "https://nd-422-757-666.p2pify.com/0a9d79d93fb2f4a4b1e04695da2b77a7";         
const RPC_MAINNET = "https://ethereum-mainnet.core.chainstack.com/7541f180988ffa697ec13762ba5d988f"; 
const SUSDE_REDEMPTION_CONTRACT = "0x9D39A5DE30e57443BfF2A8307A4256c8797A3497";
const CALL_DATA ="0x4cdad5060000000000000000000000000000000000000000000000000de0b6b3a7640000";
const DEFAULT_START_BLOCK = 23100000;
const BATCH_SIZE = 2;     
const BLOCK_INTERVAL = 100; 
const RPC_TIMEOUT_MS = 30_000;

async function getLatestBlock() : Promise<number> {
    const url = new URL("https://ethereum-mainnet.core.chainstack.com/7541f180988ffa697ec13762ba5d988f");
    const payload = {
        "jsonrpc": "2.0",
        "method": "eth_blockNumber",
        "id": 1,
        "params": []
    }
    const response = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
    });
    const data = await response.json() as { result: string };
    return Number(data.result);
}


function withTimeout<T>(p: Promise<T>, ms: number): Promise<T> {
    const ac = new AbortController();
    const t = setTimeout(() => ac.abort(), ms);
    return Promise.race([
      p,
      new Promise<T>((_, rej) => {
        ac.signal.addEventListener("abort", () => rej(new Error("Timeout")));
      }),
    ]).finally(() => clearTimeout(t));
  }

async function jsonRpc<T = any>(url: string, body: any): Promise<T> {
    const res = await withTimeout(
      fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }),
      RPC_TIMEOUT_MS
    );
  
    if (!res.ok) {
      throw new Error(`HTTP ${res.status} ${res.statusText}`);
    }
    const json = await res.json() as { result: T, error?: any };
    if (json?.error) {
      throw new Error(`RPC error: ${JSON.stringify(json.error)}`);
    }
    return json.result;
  }

function toHexBlock(n: number): string {
    return "0x" + n.toString(16);
  }
  
  function parseHexTimestamp(hexTs: string): number {
    // timestamps fit safely into Number
    return parseInt(hexTs, 16);
  }
  
  /**
   * Convert hex (0x...) 18-decimal fixed number to a decimal string without precision loss.
   * Example: 0x0de0b6b3a7640000 (1e18) -> "1"
   */
  function hex18ToDecimalString(hex: string): string {
    if (hex.startsWith("0x") || hex.startsWith("0X")) hex = hex.slice(2);
    const big = BigInt("0x" + hex);
  
    const denom = 10n ** 18n;
    const whole = big / denom;
    const frac = big % denom;
  
    if (frac === 0n) return whole.toString();
  
    // pad fractional part to 18 digits, then trim trailing zeros
    let fracStr = frac.toString().padStart(18, "0");
    fracStr = fracStr.replace(/0+$/, "");
    return `${whole.toString()}.${fracStr}`;
  }

  
async function getBlockTimestamp(blockNumber: number): Promise<number> {
    const body = {
      jsonrpc: "2.0",
      method: "eth_getBlockByNumber", 
      id: 1,
      params: [toHexBlock(blockNumber), false],
    };
    
    const json = await jsonRpc<{ timestamp: string }>(RPC_BLOCKS, body);
    
    if (!json?.timestamp) throw new Error("Missing timestamp in response");
    return parseHexTimestamp(json.timestamp);
  }
  
  async function getRedemptionPrice(blockNumber: number): Promise<string> {
    const body = {
      jsonrpc: "2.0",      
      method: "eth_call",
      id: 1,
      params: [
        { to: SUSDE_REDEMPTION_CONTRACT, data: CALL_DATA },
        toHexBlock(blockNumber),
      ],
    };
    
    try {
      const json = await jsonRpc<string>(RPC_MAINNET, body);
      
      if (!json) {
        throw new Error("No result returned from eth_call");
      }
      
      return hex18ToDecimalString(json);
    } catch (error: any) {
      console.error(`eth_call failed for block ${blockNumber}:`, error?.message || error);
      throw error;
    }
  }

async function processBlockBatch(blocks: number[]): Promise<TimedRedemptionData[]> {
    const tasks = blocks.map(async (block) => {
      const [priceStr, ts] = await Promise.all([
        getRedemptionPrice(block),
        getBlockTimestamp(block),
      ]);
      return { block, timestamp: ts, price_decimal: priceStr } as TimedRedemptionData;
    });
  
    return Promise.all(tasks);
  }

export async function getRedemptionsData() : Promise<TimedRedemptionData[]> {
  const latestBlock = await getLatestBlock();
  const startBlock = DEFAULT_START_BLOCK;

  console.log("Start fetching latest block");
  console.log(`Strating from block ${startBlock}`);
  console.log(`Ending at block ${latestBlock}`);
  console.log(`Block interval ${BLOCK_INTERVAL}`);
  console.log(`Batch size ${BATCH_SIZE}`);
  console.log(`Total blocks to fetch ${latestBlock - startBlock}`);
   
  let current = startBlock;
  let total = 0;
  const totalRedemptions = new Array<TimedRedemptionData>();

  while (current <= latestBlock) {
    const batch: number[] = [];
    for (let i = 0; i < BATCH_SIZE; i++) {
      const b = current + i * BLOCK_INTERVAL;
      if (b <= latestBlock) batch.push(b);
    }
    if (batch.length === 0) break;

    console.log(`Processing blocks ${batch[0]} to ${batch[batch.length - 1]} (every ${BLOCK_INTERVAL}) in parallel...`);

    try {
      const results = await processBlockBatch(batch);
      total += results.length;
      totalRedemptions.push(...results);
    } catch (e: any) {
      console.error(`Batch failed: ${e?.message || e}`);
    }

    current += BATCH_SIZE * BLOCK_INTERVAL;
    console.log(`Fetched ${total} sUSDe redemption prices`);
  }

  return totalRedemptions;
}
