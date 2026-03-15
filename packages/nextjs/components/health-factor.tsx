import React, { useMemo } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Progress } from "./ui/progress";
import { useFetchNativeCurrencyPrice, useWatchBalance } from "@scaffold-ui/hooks";
import { AlertCircle, AlertTriangle, CheckCircle, ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import { formatEther, parseEther } from "viem";
import { useAccount } from "wagmi";
import { useScaffoldReadContract, useScaffoldWriteContract, useTargetNetwork } from "~~/hooks/scaffold-eth";
import { notification } from "~~/utils/scaffold-eth";

const HealthFactor = () => {
  const { price: ethPrice } = useFetchNativeCurrencyPrice();
  const { address: user } = useAccount();
  const { targetNetwork } = useTargetNetwork();
  const { data: balance } = useWatchBalance({ address: user, chainId: targetNetwork.id });

  const { data: healthFactor } = useScaffoldReadContract({
    contractName: "Lending",
    functionName: "getHealthFactor",
    args: [user],
  });

  const hf = useMemo(() => {
    if (!healthFactor) return null;

    if (Number(formatEther(healthFactor)) > 1000000) return "∞";
    return parseFloat(formatEther(healthFactor)).toFixed(2);
  }, [healthFactor]);

  const { data: userCollateral } = useScaffoldReadContract({
    contractName: "Lending",
    functionName: "getUserCollateral",
    args: [user],
  });

  const { data: userDebt } = useScaffoldReadContract({
    contractName: "Lending",
    functionName: "getUserBorrowed",
    args: [user],
  });
  const { data: currentEthPrice } = useScaffoldReadContract({
    contractName: "DEX",
    functionName: "currentPrice",
  });
  const { writeContractAsync } = useScaffoldWriteContract({ contractName: "MovePrice" });

  const movePrice = async (direction: "up" | "down") => {
    if (!balance) return;
    if (direction === "down" && balance.value <= parseEther("0.3")) {
      notification.warning("A minimum of 0.3 ETH is required to move the price down");
      return;
    }
    const amount = parseEther("0.3");
    const daiAmount = BigInt(100);
    const amountToSell = direction === "down" ? amount : -daiAmount;

    try {
      await writeContractAsync({
        functionName: "movePrice",
        args: [amountToSell],
        ...(direction === "down" ? { value: amount } : {}),
      });
    } catch (e) {
      console.error("Error setting the price:", e);
    }
  };

  const liquidationDetails = useMemo(() => {
    if (!userCollateral || !userDebt || !currentEthPrice || !ethPrice) return null;
    const collateralEth = Number(formatEther(userCollateral));
    const debtDai = Number(userDebt);
    const currentPrice = Number(currentEthPrice);

    if (debtDai === 0) return { price: "0.00", buffer: "100", limitPercent: "0" };

    const collateralValueDai = collateralEth * currentPrice;
    const liqPrice = (debtDai * 1.2) / collateralEth;
    const buffer = ((currentPrice - liqPrice) / currentPrice) * 100;

    // NEW: Calculate how much of their max capacity they've used
    const maxBorrowable = collateralValueDai / 1.2;
    const limitPercent = (debtDai / maxBorrowable) * 100;

    return {
      price: liqPrice.toFixed(1),
      buffer: Math.max(0, buffer).toFixed(1),
      limitPercent: Math.min(100, limitPercent).toFixed(1), // Cap at 100%
    };
  }, [userDebt, userCollateral, currentEthPrice, ethPrice]);

  const getHealthStatus = (hfValue: string | null) => {
    // 1. Handle loading or null states
    if (!hfValue) return { color: "muted", text: "Loading...", icon: Loader2 };

    if (hfValue === "∞") {
      return { color: "success", text: "No Debt", icon: CheckCircle };
    }
    const hf = parseFloat(hfValue);

    if (hf < 1) {
      return { color: "destructive", text: "Liquidatable", icon: AlertTriangle };
    }

    if (hf < 1.1) {
      return { color: "destructive", text: "At Risk", icon: AlertTriangle };
    }

    if (hf <= 2) {
      return { color: "warning", text: "Moderate", icon: AlertCircle };
    }

    return { color: "success", text: "Safe", icon: CheckCircle };
  };
  const status = getHealthStatus(hf);
  //const progressValue = Math.min((healthFactor / 3) * 100, 100);

  return (
    <Card className="border-border bg-card animate-fade-in">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <span className={`text-${status?.color}`}>●</span>
            Health Factor
          </span>
          <span className={`text-2xl font-bold text-${status?.color}`}>{hf}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* ETH Price with Toggle */}
        <div className="p-3 rounded-lg bg-primary/10 border border-primary/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground mb-1">
                Current ETH Price <span className="text-[10px] text-zinc-600">DAI/ETH</span>
              </p>
              <p className="text-xl font-bold text-primary">{currentEthPrice}</p>
            </div>
            <div className="flex flex-col gap-1">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 border-success/50 hover:bg-success/20 hover:border-success"
                onClick={() => movePrice("up")}
              >
                <ChevronUp className="h-4 w-4 text-success" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 border-destructive/50 hover:bg-destructive/20 hover:border-destructive"
                onClick={() => movePrice("down")}
              >
                <ChevronDown className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Status</span>
            <span className={`flex items-center gap-1 text-${status?.color} font-medium`}>
              {status && <status.icon className="h-4 w-4" />}
              {status?.text}
            </span>
          </div>
          <Progress value={Number(liquidationDetails?.limitPercent)} className="h-3" />
        </div>

        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border">
          <div className="text-center">
            <p className="text-xs text-muted-foreground mb-1">Borrow Limit Used</p>
            <p className="text-lg font-bold text-primary">{liquidationDetails?.limitPercent}%</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground mb-1">Safety Buffer</p>
            <p className="text-lg font-bold text-warning">{liquidationDetails?.buffer}%</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground mb-1">Liquidation @</p>
            <p className="text-lg font-bold text-foreground">{liquidationDetails?.price}</p>
          </div>
        </div>

        <div className="p-3 rounded-lg bg-muted/30 border border-border">
          <p className="text-xs text-muted-foreground">
            Your health factor indicates the safety of your position. If it falls below 1.0, your collateral may be
            liquidated. Use the price toggle to simulate market changes.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default HealthFactor;
