import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { AskBidsTable, type MarketRow } from "../components/AskBidsTable";
import { BuySell } from "../components/BuySell";
import { Chart } from "../components/chart";
import { Navbar } from "../components/Navbar";
import { OrdersPanel } from "../components/OrdersPanel";
import { clearAuthToken } from "../lib/auth";
import { getErrorMessage } from "../lib/error";
import { trpcClient } from "../lib/trpc";
import {
  CANDLE_INTERVALS,
  TRADE_ASSETS,
  isAssetSymbol,
  type AccountSnapshot,
  type AssetItem,
  type AssetSymbol,
  type Candle,
  type CandleInterval,
  type OpenTrade,
  type OpenTradeInput,
  type PriceQuote,
} from "../lib/types";

const WS_URL = import.meta.env.VITE_WS_URL ?? "ws://localhost:8086";

type WsPricePayload = {
  symbol: string;
  askPrice: number;
  bidPrice: number;
  decimals?: number;
  time: number;
};

function buildCandleRange(interval: CandleInterval) {
  const endTime = Math.floor(Date.now() / 1000);
  const windowSeconds =
    interval === "1m"
      ? 60 * 60 * 6
      : interval === "1d"
        ? 60 * 60 * 24 * 90
        : 60 * 60 * 24 * 7 * 52;

  return {
    startTime: endTime - windowSeconds,
    endTime,
  };
}

function toRowLookup(assets: AssetItem[]) {
  return assets.reduce<Map<AssetSymbol, AssetItem>>((acc, asset) => {
    if (isAssetSymbol(asset.symbol)) {
      acc.set(asset.symbol, asset);
    }
    return acc;
  }, new Map<AssetSymbol, AssetItem>());
}

export function TradingPage() {
  const navigate = useNavigate();
  const [selectedAsset, setSelectedAsset] = useState<AssetSymbol>("BTC");
  const [selectedInterval, setSelectedInterval] = useState<CandleInterval>("1m");
  const [assets, setAssets] = useState<AssetItem[]>([]);
  const [candles, setCandles] = useState<Candle[]>([]);
  const [openTrades, setOpenTrades] = useState<OpenTrade[]>([]);
  const [quotes, setQuotes] = useState<Partial<Record<AssetSymbol, PriceQuote>>>({});
  const [account, setAccount] = useState<AccountSnapshot | null>(null);
  const [loadingCandles, setLoadingCandles] = useState(true);
  const [submittingOrder, setSubmittingOrder] = useState(false);
  const [closingOrderId, setClosingOrderId] = useState<string | null>(null);
  const [info, setInfo] = useState("Connecting to live feed...");
  const [error, setError] = useState("");

  const logout = useCallback(() => {
    clearAuthToken();
    navigate("/signin", { replace: true });
  }, [navigate]);

  const handleError = useCallback(
    (caughtError: unknown) => {
      const message = getErrorMessage(caughtError);
      if (message.toUpperCase().includes("UNAUTHORIZED")) {
        logout();
        return;
      }

      setError(message);
    },
    [logout],
  );

  const refreshAssets = useCallback(async () => {
    try {
      const response = await trpcClient.v1.asset.getAll.query();
      setAssets(response.assets);
    } catch (caughtError) {
      handleError(caughtError);
    }
  }, [handleError]);

  const refreshAccount = useCallback(async () => {
    try {
      const snapshot = await trpcClient.v1.user.me.query();
      setAccount(snapshot);
    } catch (caughtError) {
      handleError(caughtError);
    }
  }, [handleError]);

  const refreshOpenTrades = useCallback(async () => {
    try {
      const response = await trpcClient.v1.trades.open.mutate();
      setOpenTrades(response.trades);
    } catch (caughtError) {
      handleError(caughtError);
    }
  }, [handleError]);

  const refreshCandles = useCallback(
    async (asset: AssetSymbol, interval: CandleInterval) => {
      setLoadingCandles(true);

      try {
        const range = buildCandleRange(interval);
        const response = await trpcClient.v1.candles.getAll.query({
          asset,
          ts: interval,
          startTime: range.startTime,
          endTime: range.endTime,
        });
        setCandles(response.candles);
      } catch (caughtError) {
        handleError(caughtError);
      } finally {
        setLoadingCandles(false);
      }
    },
    [handleError],
  );

  useEffect(() => {
    void refreshAssets();
    void refreshOpenTrades();
    void refreshAccount();
  }, [refreshAssets, refreshOpenTrades, refreshAccount]);

  useEffect(() => {
    void refreshCandles(selectedAsset, selectedInterval);
  }, [refreshCandles, selectedAsset, selectedInterval]);

  useEffect(() => {
    const socket = new WebSocket(WS_URL);

    const onOpen = () => {
      setInfo("Live feed connected.");
      TRADE_ASSETS.forEach((symbol) => {
        socket.send(JSON.stringify({ type: "SUBSCRIBE", symbol }));
      });
    };

    const onClose = () => {
      setInfo("Live feed disconnected.");
    };

    const onError = () => {
      setInfo("Unable to connect to live feed.");
    };

    const onMessage = (event: MessageEvent) => {
      if (typeof event.data !== "string") {
        return;
      }

      try {
        const payload = JSON.parse(event.data) as WsPricePayload;
        if (!isAssetSymbol(payload.symbol)) {
          return;
        }

        const decimals =
          typeof payload.decimals === "number" && payload.decimals > 0
            ? payload.decimals
            : 4;
        const scale = 10 ** decimals;
        const askPrice = Number(payload.askPrice) / scale;
        const bidPrice = Number(payload.bidPrice) / scale;

        if (!Number.isFinite(askPrice) || !Number.isFinite(bidPrice)) {
          return;
        }

        setQuotes((current) => ({
          ...current,
          [payload.symbol]: {
            symbol: payload.symbol,
            askPrice,
            bidPrice,
            decimals,
            time: payload.time,
          },
        }));
      } catch {
        // Ignore malformed messages from non-price channels.
      }
    };

    socket.addEventListener("open", onOpen);
    socket.addEventListener("close", onClose);
    socket.addEventListener("error", onError);
    socket.addEventListener("message", onMessage);

    return () => {
      socket.removeEventListener("open", onOpen);
      socket.removeEventListener("close", onClose);
      socket.removeEventListener("error", onError);
      socket.removeEventListener("message", onMessage);
      if (socket.readyState === WebSocket.OPEN) {
        TRADE_ASSETS.forEach((symbol) => {
          socket.send(JSON.stringify({ type: "UNSUBSCRIBE", symbol }));
        });
      }
      socket.close();
    };
  }, []);

  const marketRows = useMemo<MarketRow[]>(() => {
    const assetLookup = toRowLookup(assets);

    return TRADE_ASSETS.map((symbol) => {
      const quote = quotes[symbol];
      const item = assetLookup.get(symbol);

      return {
        symbol,
        name: item?.name ?? symbol,
        imageUrl: item?.imageUrl ?? "",
        buyPrice: quote?.askPrice ?? item?.buyPrice ?? 0,
        sellPrice: quote?.bidPrice ?? item?.sellPrice ?? 0,
      };
    });
  }, [assets, quotes]);

  const selectedQuote = useMemo<PriceQuote | undefined>(() => {
    const liveQuote = quotes[selectedAsset];
    if (liveQuote) {
      return liveQuote;
    }

    const selectedRow = marketRows.find((row) => row.symbol === selectedAsset);
    if (!selectedRow) {
      return undefined;
    }

    return {
      symbol: selectedAsset,
      askPrice: selectedRow.buyPrice,
      bidPrice: selectedRow.sellPrice,
      decimals: 4,
      time: Math.floor(Date.now() / 1000),
    };
  }, [marketRows, quotes, selectedAsset]);

  const handleOpenTrade = useCallback(
    async (payload: OpenTradeInput) => {
      setSubmittingOrder(true);
      setError("");

      try {
        await trpcClient.v1.trade.open.mutate(payload);
        setInfo("Position opened.");
        await refreshOpenTrades();
        await refreshAccount();
      } catch (caughtError) {
        handleError(caughtError);
      } finally {
        setSubmittingOrder(false);
      }
    },
    [handleError, refreshAccount, refreshOpenTrades],
  );

  const handleCloseTrade = useCallback(
    async (orderId: string) => {
      setClosingOrderId(orderId);
      setError("");

      try {
        await trpcClient.v1.trade.close.mutate({ orderId });
        setInfo("Position closed.");
        await refreshOpenTrades();
        await refreshAccount();
      } catch (caughtError) {
        handleError(caughtError);
      } finally {
        setClosingOrderId(null);
      }
    },
    [handleError, refreshAccount, refreshOpenTrades],
  );

  const handleRefreshAll = useCallback(() => {
    setError("");
    void refreshAssets();
    void refreshOpenTrades();
    void refreshCandles(selectedAsset, selectedInterval);
    void refreshAccount();
  }, [
    refreshAccount,
    refreshAssets,
    refreshOpenTrades,
    refreshCandles,
    selectedAsset,
    selectedInterval,
  ]);

  return (
    <div className="page-shell">
      <Navbar onLogout={logout} />

      <main className="trade-layout">
        <section className="trade-main-column">
          <section className="card toolbar-card">
            <div>
              <h1 className="card-title">Trading Dashboard</h1>
              <p className="muted-text">
                Candles from tRPC, price feed from websocket.
              </p>
            </div>

            <div className="toolbar-actions">
              <div className="toolbar-balance">
                <p className="toolbar-balance-label">Total Balance</p>
                <p className="toolbar-balance-amount">
                  {account ? `$${account.usdBalance.toFixed(2)} USD` : "--"}
                </p>
              </div>

              <div className="segmented-control">
                {CANDLE_INTERVALS.map((interval) => (
                  <button
                    key={interval}
                    type="button"
                    className={selectedInterval === interval ? "segmented-active" : ""}
                    onClick={() => setSelectedInterval(interval)}
                  >
                    {interval}
                  </button>
                ))}
              </div>

              <button type="button" className="btn btn-secondary" onClick={handleRefreshAll}>
                Refresh
              </button>
            </div>
          </section>

          <Chart symbol={selectedAsset} candles={candles} loading={loadingCandles} />

          <AskBidsTable
            rows={marketRows}
            selectedAsset={selectedAsset}
            onSelectAsset={setSelectedAsset}
          />
        </section>

        <aside className="trade-side-column">
          <BuySell
            symbol={selectedAsset}
            quote={selectedQuote}
            isSubmitting={submittingOrder}
            availableBalance={account?.usdBalance}
            onSubmit={handleOpenTrade}
          />

          <OrdersPanel
            trades={openTrades}
            closingOrderId={closingOrderId}
            onCloseTrade={handleCloseTrade}
          />
        </aside>
      </main>

      <footer className="status-row">
        <p className={error ? "error-text" : "muted-text"}>{error || info}</p>
      </footer>
    </div>
  );
}
