import { useMemo, useState } from "react";

import { getErrorMessage } from "../lib/error";
import type { OpenTradeInput, PriceQuote, AssetSymbol } from "../lib/types";

type BuySellProps = {
  symbol: AssetSymbol;
  quote?: PriceQuote;
  isSubmitting: boolean;
  availableBalance?: number;
  onSubmit: (payload: OpenTradeInput) => Promise<void>;
};

const LEVERAGES: OpenTradeInput["leverage"][] = [1, 5, 10, 20, 100];
const LEVERAGED_OPTIONS = LEVERAGES.filter(
  (value) => value !== 1,
) as Exclude<OpenTradeInput["leverage"], 1>[];

function formatQuote(value: number | undefined): string {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return "--";
  }

  return value.toFixed(3);
}

function toStepValue(value: string): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return 0;
  }

  return parsed;
}

export function BuySell({
  symbol,
  quote,
  isSubmitting,
  availableBalance,
  onSubmit,
}: BuySellProps) {
  const [margin, setMargin] = useState("0");
  const [useLeverage, setUseLeverage] = useState(true);
  const [leverage, setLeverage] = useState<OpenTradeInput["leverage"]>(10);
  const [activeSide, setActiveSide] = useState<OpenTradeInput["type"] | null>(null);
  const [error, setError] = useState("");

  const buyPrice = quote?.askPrice;
  const sellPrice = quote?.bidPrice;

  const markPrice = useMemo(() => {
    if (
      typeof buyPrice !== "number" ||
      typeof sellPrice !== "number" ||
      !Number.isFinite(buyPrice) ||
      !Number.isFinite(sellPrice)
    ) {
      return undefined;
    }

    return (buyPrice + sellPrice) / 2;
  }, [buyPrice, sellPrice]);

  const effectiveLeverage: OpenTradeInput["leverage"] = useLeverage ? leverage : 1;

  const adjustVolume = (delta: number) => {
    setMargin((current) => {
      const next = Math.max(toStepValue(current) + delta, 0);
      return next.toFixed(2).replace(/\.00$/, "");
    });
  };

  const hasLiveQuote =
    typeof buyPrice === "number" &&
    typeof sellPrice === "number" &&
    Number.isFinite(buyPrice) &&
    Number.isFinite(sellPrice);

  const handlePlaceOrder = async (type: OpenTradeInput["type"]) => {
    setError("");

    if (!hasLiveQuote) {
      setError("Waiting for live quote...");
      return;
    }

    const parsedMargin = Number(margin);
    if (!Number.isFinite(parsedMargin) || parsedMargin <= 0) {
      setError("Volume must be greater than 0.");
      return;
    }

    if (typeof availableBalance === "number" && parsedMargin > availableBalance) {
      setError("Volume exceeds available balance.");
      return;
    }

    setActiveSide(type);
    try {
      await onSubmit({
        type,
        margin: parsedMargin,
        leverage: effectiveLeverage,
        asset: symbol,
      });
    } catch (caughtError) {
      setError(getErrorMessage(caughtError));
    } finally {
      setActiveSide(null);
    }
  };

  return (
    <section className="card trade-execution-card">
      <div className="trade-execution-head">
        <p className="trade-execution-symbol">{symbol}USDT</p>
        <p className="trade-execution-mark">{formatQuote(markPrice)}</p>
      </div>

      <div className="trade-execution-body">
        <div className="trade-execution-tabs" role="tablist" aria-label="Order mode">
          <button
            type="button"
            role="tab"
            aria-selected="true"
            className="trade-execution-tab is-active"
          >
            Market
          </button>
          <button
            type="button"
            role="tab"
            aria-selected="false"
            className="trade-execution-tab"
            disabled
          >
            Pending
          </button>
        </div>

        <section className="trade-execution-panel">
          <div className="trade-execution-row">
            <span>Use Leverage</span>
            <button
              type="button"
              className="trade-switch"
              role="switch"
              aria-checked={useLeverage}
              onClick={() => setUseLeverage((current) => !current)}
            >
              <span className="trade-switch-thumb" />
            </button>
          </div>

          <div className="trade-execution-row compact">
            <span>Leverage</span>
            <strong>x{effectiveLeverage}</strong>
          </div>

          {useLeverage ? (
            <div className="trade-leverage-options">
              {LEVERAGED_OPTIONS.map((value) => (
                <button
                  key={value}
                  type="button"
                  className={`trade-leverage-pill ${leverage === value ? "is-active" : ""}`}
                  onClick={() => setLeverage(value)}
                >
                  x{value}
                </button>
              ))}
            </div>
          ) : null}

          <div className="trade-execution-row compact">
            <span>Volume</span>
            <span className="muted-text">
              Available:{" "}
              {typeof availableBalance === "number" ? availableBalance.toFixed(2) : "--"}
            </span>
          </div>

          <div className="trade-volume-field">
            <input
              type="number"
              min="0"
              step="1"
              value={margin}
              onChange={(event) => setMargin(event.target.value)}
              aria-label="Order volume"
            />
            <div className="trade-volume-stepper">
              <button type="button" onClick={() => adjustVolume(1)} aria-label="Increase volume">
                +
              </button>
              <button
                type="button"
                onClick={() => adjustVolume(-1)}
                aria-label="Decrease volume"
              >
                -
              </button>
            </div>
            <span className="trade-volume-unit">Lots</span>
          </div>
        </section>

        {error ? <p className="error-text">{error}</p> : null}

        <div className="trade-action-grid">
          <button
            type="button"
            className="trade-action trade-action-sell"
            disabled={isSubmitting || !hasLiveQuote}
            onClick={() => {
              void handlePlaceOrder("sell");
            }}
          >
            <span>{activeSide === "sell" && isSubmitting ? "SELLING..." : "SELL"}</span>
            <strong>{formatQuote(sellPrice)}</strong>
          </button>
          <button
            type="button"
            className="trade-action trade-action-buy"
            disabled={isSubmitting || !hasLiveQuote}
            onClick={() => {
              void handlePlaceOrder("buy");
            }}
          >
            <span>{activeSide === "buy" && isSubmitting ? "BUYING..." : "BUY"}</span>
            <strong>{formatQuote(buyPrice)}</strong>
          </button>
        </div>
      </div>
    </section>
  );
}
