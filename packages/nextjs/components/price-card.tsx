import React, { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Card, CardContent } from "./ui/card";
import clsx from "clsx";
import { formatEther } from "viem";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";

const PriceCard = () => {
  const [direction, setDirection] = useState<"up" | "down" | "same">("same");
  const [percentChange, setPercentChange] = useState<number>(0);
  const { data: daiPriceRaw, isLoading } = useScaffoldReadContract({
    contractName: "DEX",
    functionName: "currentPrice",
  });

  const priceOfOneDai = daiPriceRaw
    ? (1_000_000_000_000_000_000n * 1_000_000_000_000_000_000n) / BigInt(daiPriceRaw) // 1e18 * 1e18 / price
    : undefined;

  const renderETHPrice = daiPriceRaw ? Number(formatEther(daiPriceRaw)).toFixed(2) : null;

  useEffect(() => {
    if (priceOfOneDai === undefined || priceOfOneDai === null) return;

    const prev = JSON.parse(localStorage.getItem("priceOfDai") ?? "{}");
    if (prev !== null) {
      if (priceOfOneDai > prev) setDirection("up");
      else if (priceOfOneDai < prev) setDirection("down");
      else setDirection("same");

      if (prev > 0) {
        const change = ((Number(priceOfOneDai) - Number(prev)) / Number(prev)) * 100;
        setPercentChange(change);
      } else {
        setPercentChange(0);
      }
    }

    localStorage.setItem("priceOfDai", priceOfOneDai.toString());
  }, [priceOfOneDai]);
  return (
    <Card
      className="relative overflow-hidden border-border bg-card hover:border-primary/50 transition-all duration-300 group"
      style={{ animationDelay: `${0 * 100}ms` }}
    >
      <CardContent className="px-4">
        <div className="flex items-start justify-between">
          <div className="p-3 rounded-xl bg-card border border-border group-hover:glow-cyan transition-all text-primary">
            <Avatar className="w-5 h-5">
              <AvatarImage src="https://assets.coingecko.com/coins/images/9956/small/4943.png" alt="Dai" />
              <AvatarFallback>Dai</AvatarFallback>
            </Avatar>
          </div>
          <span
            className={clsx(
              "text-xs font-medium px-2 py-1 rounded-full",
              direction === "up"
                ? "bg-success/10 text-success"
                : direction === "down"
                  ? "bg-destructive/10 text-destructive"
                  : "bg-success/10 text-success",
              percentChange == 0 ? "hidden" : "",
            )}
          >
            {percentChange.toFixed(2)}%
          </span>
        </div>
        <p className="text-sm text-muted-foreground mb-1">Current Price of Dai</p>
        {isLoading || !priceOfOneDai ? (
          <div className="animate-pulse flex space-x-4">
            <div className="rounded-md bg-slate-300 h-6 w-6"></div>
            <div className="flex items-center space-y-6">
              <div className="h-2 w-28 bg-slate-300 rounded-sm"></div>
            </div>
          </div>
        ) : (
          <p className="text-2xl font-bold text-foreground">
            {`${Number(formatEther(priceOfOneDai)).toFixed(6)} ETH`}
            <span className="text-primary/40 text-xs ml-2">{renderETHPrice} Dai/ETH</span>
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default PriceCard;
