import PriceChange from "./price-change";
import { RadialGauge } from "./radial-gauge";
//import { RadialGauge } from "./radial-gauge";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
//import { Progress } from "./ui/progress";
//import { collateralRatio } from "~~/utils/constant";
import { Skeleton } from "./ui/skeleton";
//import { useFetchNativeCurrencyPrice } from "@scaffold-ui/hooks";
import { AlertCircle, AlertTriangle, CheckCircle, ChevronDown, ChevronUp } from "lucide-react";
import { formatEther, parseEther } from "viem";
import { useAccount } from "wagmi";
import { useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { collateralRatio } from "~~/utils/constant";
import { calculatePositionRatio } from "~~/utils/helpers";

const CollateralVizCard = () => {
  const { address: user } = useAccount();
  // const { price: nativeCurrencyPrice } = useFetchNativeCurrencyPrice();
  // console.log(nativeCurrencyPrice);

  const { data: userCollateral } = useScaffoldReadContract({
    contractName: "Lending",
    functionName: "s_userCollateral",
    args: [user],
  });

  const { writeContractAsync } = useScaffoldWriteContract({ contractName: "MovePrice" });

  const { data: userBorrowed } = useScaffoldReadContract({
    contractName: "Lending",
    functionName: "s_userBorrowed",
    args: [user],
  });

  const { data: price } = useScaffoldReadContract({
    contractName: "DEX",
    functionName: "currentPrice",
  });
  const borrowedAmount = Number(formatEther(userBorrowed || 0n));
  const ratio =
    borrowedAmount === 0
      ? "N/A"
      : calculatePositionRatio(
          Number(formatEther(userCollateral || 0n)),
          borrowedAmount,
          Number(formatEther(price || 0n)),
        ).toFixed(1);

  //const isPositionSafe = ratio == "N/A" || Number(ratio) >= collateralRatio;

  const priceOfOneDai = price ? parseEther((1 / Number(formatEther(price))).toString()) : undefined;
  const adjustPrice = async (isIncrease: boolean) => {
    if (price === undefined) {
      console.error("Price is undefined");
      return;
    }
    const amount = parseEther("50");
    const amountToSell = isIncrease ? amount : -(amount * 1000n);

    try {
      await writeContractAsync({
        functionName: "movePrice",
        args: [amountToSell],
      });
    } catch (e) {
      console.error("Error setting the price:", e);
    }
  };

  const getHealthStatus = (hf: number | string) => {
    if (hf == "N/A") return { color: "success", text: "∞", icon: AlertTriangle };
    if (Number(hf) < 120) return { color: "destructive", text: "Liquidatable", icon: AlertTriangle };
    if (Number(hf) < 200) return { color: "warning", text: "At Risk", icon: AlertCircle };
    return { color: "success", text: "Safe", icon: CheckCircle };
  };

  const status = getHealthStatus(ratio);
  // const progressValue = Math.min(100, (Number(ratio) / collateralRatio) * 100);
  //const currentCollateral = Number(formatEther(userCollateral || 0n));

  return (
    <Card className="border-border bg-card animate-fade-in">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <span className={`text-${status.color}`}>●</span>
            Health Status
          </span>
          <div className={`flex gap-2 items-center ${ratio == "N/A" ? "hidden" : ""}`}>
            <span
              className={`text-[10px] font-medium py-1 px-2 h-5 flex items-center rounded-full border ${
                Number(ratio) >= 200
                  ? "bg-success/10 text-success border-success"
                  : Number(ratio) < 120
                    ? "bg-destructive/10 text-destructive border-destructive"
                    : Number(ratio) < 200
                      ? "bg-warning/10 text-warning border-warning"
                      : "bg-success/10 text-success border-success"
              }`}
            >
              {Number(ratio) >= 200
                ? "Safe"
                : Number(ratio) < 120
                  ? "Liquidatable"
                  : Number(ratio) < 200
                    ? "Unhealthy"
                    : ""}
            </span>
            <span className={`text-2xl font-bold text-${status.color}`}>{ratio == "N/A" ? "∞" : ratio}%</span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Circular Meter */}
        <RadialGauge ratio={ratio} threshold={collateralRatio} status={status} />
        {/* ETH Price with Toggle */}
        <div className="p-3 rounded-lg bg-primary/10 border border-primary/30">
          <div className="flex items-start justify-between">
            <div className="flex flex-col gap-1 items-center">
              <div className="flex items-center gap-1">
                <p className="text-xs text-muted-foreground mb-1">Dai Price :</p>
                {priceOfOneDai === undefined ? (
                  <Skeleton className="w-10 h-4" />
                ) : (
                  <p className="text-base font-bold text-primary">
                    {Number(formatEther(priceOfOneDai)).toFixed(6)} ETH
                  </p>
                )}
              </div>
              <PriceChange asset={"DAI"} currentPrice={Number(formatEther(priceOfOneDai || 0n))} />
            </div>
            <div className="flex flex-col gap-1 items-center">
              <div className="flex items-center gap-1">
                <p className="text-xs text-muted-foreground mb-1">ETH Price :</p>
                {price === undefined ? (
                  <Skeleton className="w-10 h-4" />
                ) : (
                  <p className="text-base font-bold text-primary">{Number(formatEther(price)).toFixed(2)} DAI/ETH</p>
                )}
              </div>
              <PriceChange asset="ETH" currentPrice={Number(formatEther(price || 0n))} />
            </div>
            <div className="flex flex-col gap-1">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 border-success/50 hover:bg-success/20 hover:border-success"
                onClick={() => adjustPrice(true)}
              >
                <ChevronUp className="h-4 w-4 text-success" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 border-destructive/50 hover:bg-destructive/20 hover:border-destructive"
                onClick={() => adjustPrice(false)}
              >
                <ChevronDown className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          </div>
        </div>

        {/* <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Status</span>
            <span className={`flex items-center gap-1 text-${status.color} font-medium`}>
              <status.icon className="h-4 w-4" />
              {status.text}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border">
          <div className="text-center">
            <p className="text-xs text-muted-foreground mb-1">Collateral</p>
            <p className="text-lg font-bold text-primary">
              ${currentCollateral.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground mb-1">Debt</p>
            <p className="text-lg font-bold text-warning">{borrowedAmount.toLocaleString()}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground mb-1">Borrow Limit</p>
            <p className="text-lg font-bold text-foreground">65%</p>
          </div>
        </div> */}

        <div className="p-3 rounded-lg bg-muted/30 border border-border">
          <p className="text-xs text-muted-foreground">
            Health status indicates the safety of your position. If it falls below 120%, your collateral may be
            liquidated. Use the price toggle to simulate market changes.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default CollateralVizCard;
