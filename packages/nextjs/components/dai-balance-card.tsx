import React from "react";
import { Card, CardContent } from "./ui/card";
import { Wallet } from "lucide-react";
import { useAccount } from "wagmi";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";
import { tokenName } from "~~/utils/constant";

const DaiBalanceCard = () => {
  const { address } = useAccount();

  const { data: daiBalance } = useScaffoldReadContract({
    contractName: "Dai",
    functionName: "balanceOf",
    args: [address],
  });

  //const tokenBalance = `${Math.floor(Number(formatEther(cornBalance || 0n)) * 100) / 100}`;
  return (
    <Card
      className="relative overflow-hidden border-border bg-card hover:border-primary/50 transition-all duration-300 group"
      style={{ animationDelay: `${1 * 100}ms` }}
    >
      <CardContent className="px-4">
        <div className="flex items-start justify-between">
          <div className="p-3 rounded-xl bg-card border border-border group-hover:glow-cyan transition-all text-primary">
            <Wallet className="h-5 w-5" />
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
        <p className="text-sm text-muted-foreground mb-1">{`Your ${tokenName} Balance`}</p>
        <p className="text-2xl font-bold text-foreground">{`${daiBalance} ${tokenName}`}</p>
      </CardContent>
    </Card>
  );
};

export default DaiBalanceCard;
