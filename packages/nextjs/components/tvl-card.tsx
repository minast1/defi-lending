import React from "react";
import EthUsDToggle from "./eth-usd-toggle";
import { Card, CardContent } from "./ui/card";
import { TrendingDown, TrendingUp } from "lucide-react";
import useTvlChange from "~~/hooks/use-tvlchange";

const TVLCard = ({ currentTvl }: { currentTvl: bigint | undefined }) => {
  const { percentChange, direction } = useTvlChange(currentTvl);

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
            } ${percentChange == 0 || (percentChange == Infinity && "hidden")}`}
          >
            {direction === "up" ? (
              <TrendingUp className="h-3 w-3" />
            ) : direction === "down" ? (
              <TrendingDown className="h-3 w-3" />
            ) : direction === "same" ? (
              ""
            ) : (
              ""
            )}
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
