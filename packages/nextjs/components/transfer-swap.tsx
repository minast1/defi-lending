import SwapTab from "./tabs/swap-tab";
import TransferTab from "./tabs/transfer-tab";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Tabs, TabsList, TabsTrigger } from "./ui/tabs";
import { useWatchBalance } from "@scaffold-ui/hooks";
import { ArrowRightLeft, Send } from "lucide-react";
import { formatEther } from "viem";
import { useAccount } from "wagmi";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";

const TransferSwap = () => {
  const { address } = useAccount();

  const { data: ETHprice } = useScaffoldReadContract({
    contractName: "DEX",
    functionName: "currentPrice",
  });

  const { data: balance } = useWatchBalance({ address }); ///Eth balance
  const { data: daiBalance } = useScaffoldReadContract({
    contractName: "Dai",
    functionName: "balanceOf",
    args: [address],
  });

  return (
    <Card className="border-border bg-card animate-fade-in">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span className="text-accent">●</span>
          Transfer & Swap
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="transfer" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-2">
            <TabsTrigger value="transfer" className="gap-2">
              <Send className="h-4 w-4" />
              Transfer
            </TabsTrigger>
            <TabsTrigger value="swap" className="gap-2">
              <ArrowRightLeft className="h-4 w-4" />
              Swap
            </TabsTrigger>
          </TabsList>

          <TransferTab />
          <SwapTab
            ETHprice={Number(formatEther(ETHprice || 0n))}
            daiBalance={Math.floor(Number(formatEther(daiBalance || 0n)) * 100) / 100}
            balance={Number(balance?.formatted)}
          />
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default TransferSwap;
