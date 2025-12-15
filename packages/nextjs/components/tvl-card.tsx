import React, { useEffect, useState } from "react";
import EthUsDToggle from "./eth-usd-toggle";
import { Card, CardContent } from "./ui/card";
import { TrendingDown, TrendingUp } from "lucide-react";
import { formatEther } from "viem";

const TVLCard = ({ currentTvl }: { currentTvl: bigint | undefined }) => {
  const STORAGE_KEY = `tvl-history`;

  const [direction, setDirection] = useState<"up" | "down" | "same">("same");
  const [percentChange, setPercentChange] = useState<number>(0);
  const [previousTvl, setPreviousTvl] = useState<number | null>(null);

  const formattedTvl = Number(formatEther(currentTvl || 0n));
  // Load previous price from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      setPreviousTvl(Number(saved));
    } else {
      //First time save
      localStorage.setItem(STORAGE_KEY, formattedTvl.toString());

      setPreviousTvl(formattedTvl);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  // When current price updates, store it and compute % change
  useEffect(() => {
    if (previousTvl === null) return;
    if (formattedTvl === previousTvl) return;

    // Update only when changed
    const pct = ((formattedTvl - previousTvl) / previousTvl) * 100;

    setPercentChange(pct);
    if (pct == 0) setDirection("same");
    else if (pct > 0) setDirection("up");
    else if (pct < 0) setDirection("down");
    else setDirection("same");

    localStorage.setItem(STORAGE_KEY, formattedTvl.toString());
    setPreviousTvl(() => formattedTvl);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTvl]);

  // useEffect(() => {
  //   if (tvl === undefined || tvl === null) return;

  //   const prev = JSON.parse(localStorage.getItem("tvl") ?? "{}");
  //   if (prev !== null) {
  //     if (tvl > prev) setDirection("up");
  //     else if (tvl < prev) setDirection("down");
  //     else setDirection("same");

  //     if (prev > 0) {
  //       const change = ((Number(tvl) - Number(prev)) / Number(prev)) * 100;
  //       setPercentChange(change);
  //     } else {
  //       setPercentChange(0);
  //     }
  //   }

  //   localStorage.setItem("tvl", tvl.toString());
  // }, [tvl]);

  return (
    <Card
      className="relative overflow-hidden border-border bg-card hover:border-primary/50 transition-all duration-300 group"
      style={{ animationDelay: `${0 * 100}ms` }}
    >
      <CardContent className="px-4">
        <div className="flex items-start justify-between">
          <div className="p-3 rounded-xl bg-card border border-border group-hover:glow-cyan transition-all text-primary">
            <TrendingUp className="h-5 w-5" />
          </div>
          <span
            className={`text-xs flex items-center gap-1 font-medium px-2 py-1 rounded-full ${
              direction == "up"
                ? "bg-success/10 text-success"
                : direction == "down"
                  ? "bg-destructive/10 text-destructive"
                  : "bg-success/10 text-success"
            } ${percentChange == 0 || percentChange == Infinity ? "hidden" : ""}`}
          >
            {direction === "up" ? (
              <TrendingUp className="h-3 w-3" />
            ) : direction === "down" ? (
              <TrendingDown className="h-3 w-3" />
            ) : direction === "same" ? null : null}
            {Math.abs(percentChange).toFixed(2)}%
          </span>
        </div>
        <p className="text-sm text-muted-foreground mb-1">Total Value Locked</p>

        <EthUsDToggle className="text-2xl font-bold text-foreground" ethValue={currentTvl} />
      </CardContent>
    </Card>
  );
};

export default TVLCard;
