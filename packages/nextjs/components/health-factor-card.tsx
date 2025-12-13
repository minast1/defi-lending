import React from "react";
import { Card, CardContent } from "./ui/card";
import { Activity } from "lucide-react";
import { formatEther } from "viem";
import { useAccount } from "wagmi";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";
import { calculatePositionRatio } from "~~/utils/helpers";

const HealthFactorCard = () => {
  const { address } = useAccount();

  const { data: userCollateral, isLoading } = useScaffoldReadContract({
    contractName: "Lending",
    functionName: "s_userCollateral",
    args: [address],
  });
  const { data: debt, isLoading: isLoadingDebt } = useScaffoldReadContract({
    contractName: "Lending",
    functionName: "s_userBorrowed",
    args: [address],
  });

  const { data: ethPrice } = useScaffoldReadContract({
    contractName: "DEX",
    functionName: "currentPrice",
  });

  const borrowedAmount = Number(formatEther(debt || 0n));
  const ratio = calculatePositionRatio(
    Number(formatEther(userCollateral || 0n)),
    borrowedAmount,
    Number(formatEther(ethPrice || 0n)),
  );
  return (
    <Card
      className="relative overflow-hidden border-border bg-card hover:border-primary/50 transition-all duration-300 group"
      style={{ animationDelay: `${3 * 100}ms` }}
    >
      <CardContent className="px-4">
        <div className="flex items-start justify-between">
          <div className="p-3 rounded-xl bg-card border border-border group-hover:glow-cyan transition-all text-primary">
            <Activity className="h-5 w-5" />
          </div>
          <span
            className={`text-xs font-medium px-2 py-1 rounded-full ${
              ratio >= 200
                ? "bg-success/10 text-success"
                : ratio < 120
                  ? "bg-destructive/10 text-destructive"
                  : ratio < 200
                    ? "bg-warning/10 text-warning"
                    : "bg-success/10 text-success"
            }`}
          >
            {ratio >= 200 ? "Safe" : ratio < 120 ? "Liquidatable" : ratio < 200 ? "Unhealthy" : ""}
          </span>
        </div>
        <p className="text-sm text-muted-foreground mb-1">Collateralization Ratio (%)</p>
        {isLoading || isLoadingDebt ? (
          <div className="animate-pulse flex space-x-4">
            <div className="rounded-md bg-slate-300 h-6 w-6"></div>
            <div className="flex items-center space-y-6">
              <div className="h-2 w-28 bg-slate-300 rounded-sm"></div>
            </div>
          </div>
        ) : (
          <>
            <p className="text-xl font-bold text-foreground">{ratio == Infinity ? "∞" : ratio.toFixed(2)}%</p>
            <p className="text-xs text-muted-foreground">{`Threshold : 120%`}</p>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default HealthFactorCard;
