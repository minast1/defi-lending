import { useState } from "react";
import DepositTab from "./tabs/deposit-tab";
import WithdrawTab from "./tabs/withdraw-tab";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Skeleton } from "./ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "./ui/tabs";
import { useWatchBalance } from "@scaffold-ui/hooks";
import { formatEther } from "viem";
import { useAccount } from "wagmi";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";

export type TAsset = {
  symbol: string;
  name: string;
  apy: string;
  balance: string | number;
};
const DepositWithdraw = () => {
  const { address } = useAccount();
  const { data: balance } = useWatchBalance({ address });
  //Collateral balance
  const { data: collateral, isLoading: isLoadingCollateral } = useScaffoldReadContract({
    contractName: "Lending",
    functionName: "s_userCollateral",
    args: [address],
  });

  // const tokenBalance = `${Math.floor(Number(formatEther(daiBalance || 0n)) * 100) / 100}`;
  const [activeTab, setActiveTab] = useState("deposit");
  const formattedEThValue = balance ? Number(balance.formatted) : 0;
  const formattedCollateralValue = collateral ? Number(formatEther(collateral || 0n)) : 0;

  const asset = {
    symbol: "ETH",
    name: "Ethereum",
    apy: "3.25%",
    balance: activeTab === "deposit" ? formattedEThValue.toFixed(4) : formattedCollateralValue.toFixed(4),
  };

  return (
    <Card className="border-border bg-card animate-fade-in">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span className="text-primary">●</span>
          Deposit & Withdraw
          <Avatar>
            <AvatarImage src="https://assets.coingecko.com/coins/images/279/small/ethereum.png" alt="@shadcn" />
            <AvatarFallback>ETH</AvatarFallback>
          </Avatar>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="p-4 rounded-lg border border-border bg-muted/30 mb-6">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-muted-foreground">Asset</span>
            <span className="font-medium">
              {asset.name} ({asset.symbol})
            </span>
          </div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-muted-foreground">APY</span>
            <span className="text-success font-medium">{asset.apy}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Balance</span>
            {isLoadingCollateral ? (
              <Skeleton className="h-4 w-16" />
            ) : (
              <span className="font-medium">
                {asset.balance} {asset.symbol}
              </span>
            )}
          </div>
        </div>

        <Tabs defaultValue="deposit" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-2">
            <TabsTrigger value="deposit" onClick={() => setActiveTab("deposit")}>
              Deposit
            </TabsTrigger>
            <TabsTrigger value="withdraw" onClick={() => setActiveTab("withdraw")}>
              Withdraw
            </TabsTrigger>
          </TabsList>

          <DepositTab asset={asset} balance={formattedEThValue} />

          <WithdrawTab asset={asset} balance={formattedCollateralValue} />
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default DepositWithdraw;
