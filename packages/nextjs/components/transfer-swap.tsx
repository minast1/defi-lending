import SwapTab from "./tabs/swap-tab";
import TransferTab from "./tabs/transfer-tab";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Tabs, TabsList, TabsTrigger } from "./ui/tabs";
import { ArrowRightLeft, Send } from "lucide-react";
import { formatEther } from "viem";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";

// const assets = [
//   { symbol: "ETH", balance: 5.24, icon: "Ξ" },
//   { symbol: "DAI", balance: 2450.0, icon: "◈" },
//   { symbol: "USDC", balance: 1200.0, icon: "$" },
// ];

const TransferSwap = () => {
  const { data: ETHprice } = useScaffoldReadContract({
    contractName: "DEX",
    functionName: "currentPrice",
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
          <SwapTab ETHprice={Number(formatEther(ETHprice || 0n))} />
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default TransferSwap;
