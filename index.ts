import Bot from "node-telegram-bot-api";
import {
  createPublicClient,
  encodeFunctionData,
  formatEther,
  http,
  parseAbiItem,
} from "viem";
import { mainnet } from "viem/chains";

const botToken = process.env.TELEGRAM_BOT_TOKEN;
const chats = process.env.TELEGRAM_CHATS?.split(",") || [];

if (!botToken) {
  throw new Error("TELEGRAM_BOT_TOKEN is not set");
}

const bot = new Bot(botToken, {
  polling: true,
});

bot.on("message", (msg) => {
  bot.sendMessage(msg.chat.id, "howdy partner, " + msg.chat.id);
});

const RPC_URL =
  "https://ethereum-mainnet.core.chainstack.com/7541f180988ffa697ec13762ba5d988f";

const client = createPublicClient({
  chain: mainnet,
  transport: http(RPC_URL),
});

async function getCurrentEthenaRedemptionPrice() {
  const { data: price } = await client.call({
    to: "0x9D39A5DE30e57443BfF2A8307A4256c8797A3497",
    data: "0x4cdad5060000000000000000000000000000000000000000000000000de0b6b3a7640000",
  });

  if (!price) {
    throw new Error("No price found");
  }

  return price;
}

async function getCurrentOraclePrice() {
  const { data: price } = await client.call({
    to: "0x38E7627eb98a40e7528BcCe709A80083093Ba2F8",
    data: encodeFunctionData({
      abi: [parseAbiItem("function price() external view returns (uint256)")],
      functionName: "price",
      args: [],
    }),
  });

  if (!price) {
    throw new Error("No price found");
  }

  return price;
}

async function main() {
  let nextNotificationTimestamp = 0;

  while (true) {
    const redemptionPrice = await getCurrentEthenaRedemptionPrice();
    const oraclePrice = await getCurrentOraclePrice();

    console.log(formatEther(BigInt(redemptionPrice)), "redemptionPrice");
    console.log(formatEther(BigInt(oraclePrice)), "oraclePrice");
    console.log(nextNotificationTimestamp, "nextNotificationTimestamp");

    if (redemptionPrice > oraclePrice) {
      if (nextNotificationTimestamp < Date.now()) {
        nextNotificationTimestamp = Date.now() + 60_000 * 10;

        for (const chat of chats) {
          await bot.sendMessage(
            chat,
            `Redemption price is higher than oracle price:\n${formatEther(
              BigInt(redemptionPrice)
            )} > ${formatEther(BigInt(oraclePrice))}`
          );

          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
      }
    } else {
      console.log("redemptionPrice <= oraclePrice, no notification needed");
    }

    await new Promise((resolve) => setTimeout(resolve, 60_000));
  }
}

main().catch(console.error);
