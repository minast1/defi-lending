import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Card, CardContent } from "./ui/card";
import { formatEther } from "viem";
import { useAccount } from "wagmi";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";
import { tokenName } from "~~/utils/constant";

const DaiBalanceCard = () => {
  const { address } = useAccount();

  const { data: daiBalance, isLoading } = useScaffoldReadContract({
    contractName: "Dai",
    functionName: "balanceOf",
    args: [address],
  });

  const tokenBalance = `${Math.floor(Number(formatEther(daiBalance || 0n)) * 100) / 100}`;

  return (
    <Card
      className="relative overflow-hidden border-border bg-card hover:border-primary/50 transition-all duration-300 group"
      style={{ animationDelay: `${1 * 100}ms` }}
    >
      <CardContent className="px-4">
        <div className="flex items-start justify-between">
          <div className="p-3 rounded-xl bg-card border border-border group-hover:glow-cyan transition-all text-primary">
            <Avatar className="w-5 h-5">
              <AvatarImage src="https://assets.coingecko.com/coins/images/9956/small/4943.png" alt="Dai" />
              <AvatarFallback>Dai</AvatarFallback>
            </Avatar>
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
        <p className="text-sm text-muted-foreground mb-1">{`Your ${tokenName} Wallet`}</p>
        {isLoading ? (
          <div className="animate-pulse flex space-x-4">
            <div className="rounded-md bg-slate-300 h-6 w-6"></div>
            <div className="flex items-center space-y-6">
              <div className="h-2 w-28 bg-slate-300 rounded-sm"></div>
            </div>
          </div>
        ) : (
          <p className="text-2xl font-bold text-foreground">{`${tokenBalance} ${tokenName}`}</p>
        )}
      </CardContent>
    </Card>
  );
};

export default DaiBalanceCard;
