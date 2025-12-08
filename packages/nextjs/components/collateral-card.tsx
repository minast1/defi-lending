import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Card, CardContent } from "./ui/card";
import { formatEther } from "viem";
import { useAccount } from "wagmi";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";

const CollateralCard = () => {
  const { address } = useAccount();

  const { data: collateralBalance, isLoading } = useScaffoldReadContract({
    contractName: "Lending",
    functionName: "s_userCollateral",
    args: [address],
  });

  const formattedCollateralValue = collateralBalance ? Number(formatEther(collateralBalance || 0n)) : 0;

  return (
    <Card
      className="relative overflow-hidden border-border bg-card hover:border-primary/50 transition-all duration-300 group"
      style={{ animationDelay: `${2 * 100}ms` }}
    >
      <CardContent className="px-4">
        <div className="flex items-start justify-between">
          <div className="p-3 rounded-xl bg-card border border-border group-hover:glow-cyan transition-all text-primary">
            <Avatar className="w-5 h-5">
              <AvatarImage src="https://assets.coingecko.com/coins/images/279/small/ethereum.png" alt="Eth" />
              <AvatarFallback>Eth</AvatarFallback>
            </Avatar>
          </div>
          {/* <span
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
          </span> */}
        </div>
        <p className="text-sm text-muted-foreground mb-1">Your Deposits</p>
        {isLoading ? (
          <div className="animate-pulse flex space-x-4">
            <div className="rounded-md bg-slate-300 h-6 w-6"></div>
            <div className="flex items-center space-y-6">
              <div className="h-2 w-28 bg-slate-300 rounded-sm"></div>
            </div>
          </div>
        ) : (
          <p className="text-2xl font-bold text-foreground">{`${formattedCollateralValue.toFixed(4)} ETH`}</p>
        )}
      </CardContent>
    </Card>
  );
};

export default CollateralCard;
