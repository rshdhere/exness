import { CLOSED_ORDERS, ORDERS, PRICE_STORE, USERS } from "../data/data";

type OpenOrder = (typeof ORDERS)[string][string];
export type CloseReason = (typeof CLOSED_ORDERS)[string][string]["closeReason"];

function calculatePnl(order: OpenOrder, closePrice: number): number {
  if (order.type === "buy") {
    return Math.round(
      ((closePrice - order.openPrice) / order.openPrice) *
        order.margin *
        order.leverage,
    );
  }

  return Math.round(
    ((order.openPrice - closePrice) / order.openPrice) *
      order.margin *
      order.leverage,
  );
}

export function closeOrder(
  userId: string,
  orderId: string,
  reason: CloseReason,
): number | null {
  const userOrders = ORDERS[userId];
  const order = userOrders?.[orderId];

  if (!order) {
    return null;
  }

  const user = USERS[userId];
  if (!user) {
    return null;
  }

  const priceData = PRICE_STORE[order.asset];
  if (!priceData) {
    return null;
  }

  const closePriceRaw = order.type === "buy" ? priceData.bid : priceData.ask;
  const closePrice = Number(closePriceRaw);

  if (!Number.isFinite(closePrice)) {
    return null;
  }

  const pnl = calculatePnl(order, closePrice);
  user.balance.usd_balance += pnl + order.margin;

  if (!CLOSED_ORDERS[userId]) {
    CLOSED_ORDERS[userId] = {};
  }

  CLOSED_ORDERS[userId][orderId] = {
    ...order,
    closePrice,
    pnl,
    closeTimeStamp: Date.now(),
    closeReason: reason,
  };

  delete userOrders[orderId];
  return pnl;
}
