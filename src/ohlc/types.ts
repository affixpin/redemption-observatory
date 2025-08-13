export type OhlcData = {
    open: number;
    high: number;
    low: number;
    close: number;
};
  
export type RedemptionData = {
    price_decimal: string;
};

export type TimedOhlcData = OhlcData & {
    time: number;
};
  
export type TimedRedemptionData = RedemptionData & {
    block: number;
    timestamp: number;
};

export type DiagramStep = {
    timestamp: number;
    sUSDeToUSDCRedemption: OhlcData;
    sUSDeToUSDCDex: OhlcData;
    crvUSDToUSDCDex: OhlcData;
    usdeToUSDCDex: OhlcData;
}

export type BatchRedemptionPickingResult = {
    startBlock: number;
    endBlock: number;
    redemptionsData: TimedRedemptionData[];
}
