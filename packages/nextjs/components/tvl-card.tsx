import React from "react";
import EthUsDToggle from "./eth-usd-toggle";
import { Card, CardContent } from "./ui/card";
import { TrendingUp } from "lucide-react";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";

const TVLCard = () => {
  const { data: tvl } = useScaffoldReadContract({
    contractName: "Lending",
    functionName: "getTVLInETH",
  });

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
          {/* <span
                          className={`text-xs font-medium px-2 py-1 rounded-full ${
                            stat.change.startsWith("+")
                              ? "bg-success/10 text-success"
                              : stat.change.startsWith("-")
                                ? "bg-destructive/10 text-destructive"
                                : "bg-success/10 text-success"
                          }`}
                        >
                          {stat.change}
                        </span> */}
        </div>
        <p className="text-sm text-muted-foreground mb-1">Total Value Locked</p>

        <EthUsDToggle className="text-2xl font-bold text-foreground" ethValue={tvl} />
      </CardContent>
    </Card>
  );
};

export default TVLCard;
