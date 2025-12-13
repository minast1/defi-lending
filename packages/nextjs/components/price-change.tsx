import React, { useEffect, useState } from "react";
import { TrendingDown, TrendingUp } from "lucide-react";

type TProps = {
  asset: "ETH" | "DAI";
  currentPrice: number;
};
const PriceChange = ({ asset, currentPrice }: TProps) => {
  const STORAGE_KEY = `price-history-${asset}`;

  const [previousPrice, setPreviousPrice] = useState<number | null>(null);
  const [percentChange, setPercentChange] = useState<number>(0);
  const [direction, setDirection] = useState<"up" | "down" | "neutral">("neutral");

  // Load previous price from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      setPreviousPrice(Number(saved));
    } else {
      //First time save
      localStorage.setItem(STORAGE_KEY, currentPrice.toString());

      setPreviousPrice(currentPrice);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  // When current price updates, store it and compute % change
  useEffect(() => {
    if (previousPrice === null) return;
    if (currentPrice === previousPrice) return;

    // Update only when changed
    const pct = ((currentPrice - previousPrice) / previousPrice) * 100;

    setPercentChange(pct);
    if (pct == Infinity || pct == -Infinity || pct == 0) setDirection("neutral");
    else if (pct > 0) setDirection("up");
    else if (pct < 0) setDirection("down");
    else setDirection("neutral");

    localStorage.setItem(STORAGE_KEY, currentPrice.toString());
    setPreviousPrice(() => currentPrice);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPrice]);

  return (
    <span
      className={`text-xs flex items-center gap-0.5 ${direction === "up" ? "text-success" : direction === "down" ? "text-destructive" : "text-muted-foreground"}`}
    >
      {direction === "up" ? (
        <TrendingUp className="h-3 w-3" />
      ) : direction === "down" ? (
        <TrendingDown className="h-3 w-3" />
      ) : direction === "neutral" ? null : null}
      {direction === "up" ? "↑" : direction === "down" ? "↓" : "→"}
      {percentChange == Infinity ? "0.00" : Math.abs(percentChange).toFixed(2)}%
    </span>
  );
};

export default PriceChange;
