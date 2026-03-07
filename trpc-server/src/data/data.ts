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