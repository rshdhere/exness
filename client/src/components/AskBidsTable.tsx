import type { AssetSymbol } from "../lib/types";

export type MarketRow = {
  symbol: AssetSymbol;
  name: string;
  imageUrl: string;
  buyPrice: number;
  sellPrice: number;
};

type AskBidsTableProps = {
  rows: MarketRow[];
  selectedAsset: AssetSymbol;
  onSelectAsset: (symbol: AssetSymbol) => void;
};

function formatPrice(value: number) {
  return value.toFixed(2);
}

export function AskBidsTable({
  rows,
  selectedAsset,
  onSelectAsset,
}: AskBidsTableProps) {
  return (
    <section className="card">
      <div className="card-head">
        <h2 className="card-title">Market</h2>
      </div>

      <div className="table-wrap">
        <table className="market-table">
          <thead>
            <tr>
              <th>Pair</th>
              <th>Bid</th>
              <th>Ask</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.symbol}>
                <td>
                  <div className="pair-cell">
                    {row.imageUrl ? (
                      <img src={row.imageUrl} alt={row.name} className="coin-icon" />
                    ) : null}
                    <div>
                      <p className="pair-name">{row.name}</p>
                      <p className="pair-symbol">{row.symbol}/USDT</p>
                    </div>
                  </div>
                </td>
                <td className="positive-text">{formatPrice(row.sellPrice)}</td>
                <td className="negative-text">{formatPrice(row.buyPrice)}</td>
                <td>
                  <button
                    type="button"
                    className="btn btn-ghost"
                    disabled={selectedAsset === row.symbol}
                    onClick={() => onSelectAsset(row.symbol)}
                  >
                    {selectedAsset === row.symbol ? "Selected" : "Trade"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
