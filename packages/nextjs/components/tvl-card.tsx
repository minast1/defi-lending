import React, { useEffect, useRef, useState } from "react";
import EthUsDToggle from "./eth-usd-toggle";
import { Card, CardContent } from "./ui/card";
import { TrendingUp } from "lucide-react";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";

const TVLCard = () => {
  const prevTvlRef = useRef<bigint | null>(null);
  const [direction, setDirection] = useState<"up" | "down" | "same">("same");
  const [percentChange, setPercentChange] = useState<number>(0);

  const { data: tvl } = useScaffoldReadContract({
    contractName: "Lending",
    functionName: "getTVLInETH",
  });

  useEffect(() => {
    if (tvl === undefined || tvl === null) return;

    const prev = prevTvlRef.current;
    if (prev !== null) {
      if (tvl > prev) setDirection("up");
      else if (tvl < prev) setDirection("down");
      else setDirection("same");

      if (prev > 0) {
        const change = ((Number(tvl) - Number(prev)) / Number(prev)) * 100;
        setPercentChange(change);
      } else {
        setPercentChange(0);
      }
    }

    prevTvlRef.current = tvl;
  }, [tvl]);

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
            className={`text-xs font-medium px-2 py-1 rounded-full ${
              direction == "up"
                ? "bg-success/10 text-success"
                : direction == "down"
                  ? "bg-destructive/10 text-destructive"
                  : "bg-success/10 text-success"
            }`}
          >
            {percentChange}%
          </span>
        </div>
        <p className="text-sm text-muted-foreground mb-1">Total Value Locked</p>

        <EthUsDToggle className="text-2xl font-bold text-foreground" ethValue={tvl} />
      </CardContent>
    </Card>
  );
};

export default TVLCard;
