import { useEffect, useRef } from "react";
import {
  CandlestickSeries,
  ColorType,
  createChart,
  type IChartApi,
  type ISeriesApi,
  type UTCTimestamp,
} from "lightweight-charts";

import type { Candle, AssetSymbol } from "../lib/types";

type ChartProps = {
  symbol: AssetSymbol;
  candles: Candle[];
  loading: boolean;
};

function toChartTime(timestamp: number): UTCTimestamp {
  return timestamp as UTCTimestamp;
}

export function Chart({ symbol, candles, loading }: ChartProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);

  useEffect(() => {
    if (!containerRef.current) {
      return;
    }

    const styles = getComputedStyle(document.documentElement);
    const surface = styles.getPropertyValue("--surface-card").trim();
    const text = styles.getPropertyValue("--text-primary").trim();
    const border = styles.getPropertyValue("--border-soft").trim();
    const positive = styles.getPropertyValue("--accent-positive").trim();
    const negative = styles.getPropertyValue("--accent-negative").trim();

    const chart = createChart(containerRef.current, {
      width: containerRef.current.clientWidth,
      height: 360,
      layout: {
        background: { type: ColorType.Solid, color: surface },
        textColor: text,
      },
      grid: {
        vertLines: { color: border },
        horzLines: { color: border },
      },
      rightPriceScale: {
        borderColor: border,
      },
      timeScale: {
        borderColor: border,
      },
      crosshair: {
        vertLine: { color: border },
        horzLine: { color: border },
      },
    });

    const series = chart.addSeries(CandlestickSeries, {
      upColor: positive,
      downColor: negative,
      wickUpColor: positive,
      wickDownColor: negative,
      borderVisible: false,
    });

    const resizeObserver = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) {
        return;
      }

      chart.applyOptions({
        width: Math.max(300, Math.floor(entry.contentRect.width)),
      });
    });

    resizeObserver.observe(containerRef.current);
    chartRef.current = chart;
    seriesRef.current = series;

    return () => {
      resizeObserver.disconnect();
      chart.remove();
      chartRef.current = null;
      seriesRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!seriesRef.current) {
      return;
    }

    const formattedData = candles.map((item) => ({
      time: toChartTime(item.timestamp),
      open: item.open,
      high: item.high,
      low: item.low,
      close: item.close,
    }));

    seriesRef.current.setData(formattedData);
    chartRef.current?.timeScale().fitContent();
  }, [candles]);

  return (
    <section className="card chart-card">
      <div className="card-head">
        <h2 className="card-title">{symbol}/USDT Chart</h2>
        <span className="status-pill">{loading ? "Loading..." : "Live"}</span>
      </div>
      <div ref={containerRef} className="chart-root" />
    </section>
  );
}
