import type { OpenTrade } from "../lib/types";

type OrdersPanelProps = {
  trades: OpenTrade[];
  closingOrderId: string | null;
  onCloseTrade: (orderId: string) => Promise<void>;
};

function formatPrice(value: number | undefined): string {
  if (typeof value !== "number") {
    return "--";
  }

  return value.toFixed(2);
}

export function OrdersPanel({
  trades,
  closingOrderId,
  onCloseTrade,
}: OrdersPanelProps) {
  return (
    <section className="card">
      <div className="card-head">
        <h2 className="card-title">Open Orders</h2>
        <span className="status-pill">{trades.length}</span>
      </div>

      {trades.length === 0 ? (
        <p className="muted-text">No open positions yet.</p>
      ) : (
        <div className="orders-list">
          {trades.map((trade) => (
            <article key={trade.orderId} className="order-item">
              <div className="order-head">
                <p className="order-symbol">{trade.asset}/USDT</p>
                <span
                  className={trade.type === "buy" ? "status-positive" : "status-negative"}
                >
                  {trade.type.toUpperCase()}
                </span>
              </div>

              <div className="order-grid">
                <p>
                  Margin <strong>{trade.margin.toFixed(2)} USD</strong>
                </p>
                <p>
                  Leverage <strong>x{trade.leverage}</strong>
                </p>
                <p>
                  Open <strong>{trade.openPrice.toFixed(2)}</strong>
                </p>
                <p>
                  LQ <strong>{formatPrice(trade.liquidationPrice)}</strong>
                </p>
                <p>
                  TP <strong>{formatPrice(trade.takeProfit)}</strong>
                </p>
                <p>
                  SL <strong>{formatPrice(trade.stopLoss)}</strong>
                </p>
              </div>

              <button
                type="button"
                className="btn btn-danger"
                disabled={closingOrderId === trade.orderId}
                onClick={() => onCloseTrade(trade.orderId)}
              >
                {closingOrderId === trade.orderId ? "Closing..." : "Close"}
              </button>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
