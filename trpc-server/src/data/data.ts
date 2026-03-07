export const USERS: Record<string, {
    email: string;
    password: string;
    balance: {
        usd_balance: number
    };
    asset: Record<string, number>

}> = {};