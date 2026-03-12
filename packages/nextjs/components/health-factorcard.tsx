//import { RadialGauge } from "./radial-gauge";
import { useMemo } from "react";
import { Card, CardContent } from "./ui/card";
//import { Progress } from "./ui/progress";
//import { collateralRatio } from "~~/utils/constant";
//import { useFetchNativeCurrencyPrice } from "@scaffold-ui/hooks";
import { Activity } from "lucide-react";
import { formatEther } from "viem";
import { useAccount } from "wagmi";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";

const HealthFactorCard = () => {
  const { address: user } = useAccount();

  const { data: healthFactor, isLoading } = useScaffoldReadContract({
    contractName: "Lending",
    functionName: "getHealthFactor",
    args: [user],
  });

  const hf = useMemo(() => {
    if (!healthFactor) return null;

    if (Number(formatEther(healthFactor)) > 1000000) return "∞";
    return parseFloat(formatEther(healthFactor)).toFixed(2);
  }, [healthFactor]);

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
          {/* <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                  stat.change.startsWith('+') 
                    ? 'bg-success/10 text-success' 
                    : stat.change.startsWith('-')
                    ? 'bg-destructive/10 text-destructive'
                    : 'bg-success/10 text-success'
                }`}>
                  {stat.change}
                </span> */}
        </div>
        <p className="text-sm text-muted-foreground mb-1">Health Factor</p>
        {isLoading ? (
          <div className="animate-pulse flex space-x-4">
            <div className="rounded-md bg-slate-300 h-6 w-6"></div>
            <div className="flex items-center space-y-6">
              <div className="h-2 w-28 bg-slate-300 rounded-sm"></div>
            </div>
          </div>
        ) : (
          <p className="text-2xl font-bold text-foreground">{hf}</p>
        )}
      </CardContent>
    </Card>
  );
};

export default HealthFactorCard;
