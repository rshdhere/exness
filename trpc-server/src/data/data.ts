export const USERS: Record<string, {
    email: string;
    password: string;
    balance: {
        usd_balance: number
    };
    asset: Record<string, number>

}> = {};

export const ORDERS: Record<string, Record<string, {
    type: 'buy' | 'sell';
    margin: number;
    leverage: number;
    asset: string;
    openPrice: number;
    timeStamp: number;
    takeProfit?: number;
    stopLoss?: number;
    liquidationPrice?: number
}>> = {};

export const CLOSED_ORDERS: Record<string, Record<string, {
    type: 'buy' | 'sell';
    margin: number;
    leverage: number;
    asset: string;
    closePrice: number;
    openPrice: number;
    pnl: number;
    timeStamp: number;
    closeTimeStamp: number;
    closeReason: 'manual' | 'take_profit' | 'stop_loss' | 'liquidation';
}>> = {};

export const PRICE_STORE: Record<string, {
    ask: string;
    bid: string;
}> = {};