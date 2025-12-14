import { useState } from "react";
import TransferTab from "./tabs/transfer-tab";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { ArrowDownUp, ArrowRightLeft, Send } from "lucide-react";

const assets = [
  { symbol: "ETH", balance: 5.24, icon: "Ξ" },
  { symbol: "DAI", balance: 2450.0, icon: "◈" },
  { symbol: "USDC", balance: 1200.0, icon: "$" },
];

const TransferSwap = () => {
  // const { toast } = useToast();
  //  const [transferAmount, setTransferAmount] = useState("");
  //  const [transferAddress, setTransferAddress] = useState("");
  // const [selectedTransferAsset, setSelectedTransferAsset] = useState("ETH");

  const [swapFromAsset, setSwapFromAsset] = useState("ETH");
  const [swapToAsset, setSwapToAsset] = useState("DAI");
  const [swapAmount, setSwapAmount] = useState("");

  //   const handleTransfer = () => {
  //     if (!transferAmount || !transferAddress) {
  //       //   toast({
  //       //     title: "Missing Information",
  //       //     description: "Please enter amount and recipient address.",
  //       //     variant: "destructive",
  //       //   });
  //       return;
  //     }
  // toast({
  //   title: "Transfer Initiated",
  //   description: `Sending ${transferAmount} ${selectedTransferAsset} to ${transferAddress.slice(0, 6)}...`,
  // });
  //     setTransferAmount("");
  //     setTransferAddress("");
  //   };

  //   const handleSwap = () => {
  //     if (!swapAmount) {
  //       //   toast({
  //       //     title: "Missing Amount",
  //       //     description: "Please enter an amount to swap.",
  //       //     variant: "destructive",
  //       //   });
  //       return;
  //     }
  //     // toast({
  //     //   title: "Swap Initiated",
  //     //   description: `Swapping ${swapAmount} ${swapFromAsset} for ${swapToAsset}`,
  //     // });
  //     setSwapAmount("");
  //   };

  //   const flipSwapAssets = () => {
  //     setSwapFromAsset(swapToAsset);
  //     setSwapToAsset(swapFromAsset);
  //   };

  const getAssetBalance = (symbol: string) => {
    return assets.find(a => a.symbol === symbol)?.balance || 0;
  };

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

          <TabsContent value="swap" className="space-y-4">
            {/* From Asset */}
            <div className="p-3 rounded-lg bg-muted/30 border border-border space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">From</span>
                <span className="text-muted-foreground">
                  Balance: {getAssetBalance(swapFromAsset).toLocaleString()}
                </span>
              </div>
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="0.00"
                  value={swapAmount}
                  onChange={e => setSwapAmount(e.target.value)}
                  className="bg-background border-border flex-1"
                />
                <select
                  value={swapFromAsset}
                  onChange={e => setSwapFromAsset(e.target.value)}
                  className="px-3 py-2 rounded-lg bg-background border border-border text-sm font-medium"
                >
                  {assets.map(asset => (
                    <option key={asset.symbol} value={asset.symbol}>
                      {asset.symbol}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Flip Button */}
            <div className="flex justify-center">
              <button
                //onClick={flipSwapAssets}
                className="p-2 rounded-full border border-border bg-card hover:bg-muted/50 transition-colors"
              >
                <ArrowDownUp className="h-4 w-4 text-primary" />
              </button>
            </div>

            {/* To Asset */}
            <div className="p-3 rounded-lg bg-muted/30 border border-border space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">To</span>
                <span className="text-muted-foreground">Balance: {getAssetBalance(swapToAsset).toLocaleString()}</span>
              </div>
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="0.00"
                  readOnly
                  value={swapAmount ? (parseFloat(swapAmount) * 1850).toFixed(2) : ""}
                  className="bg-background border-border flex-1 text-muted-foreground"
                />
                <select
                  value={swapToAsset}
                  onChange={e => setSwapToAsset(e.target.value)}
                  className="px-3 py-2 rounded-lg bg-background border border-border text-sm font-medium"
                >
                  {assets.map(asset => (
                    <option key={asset.symbol} value={asset.symbol}>
                      {asset.symbol}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Rate Info */}
            {swapAmount && (
              <div className="text-xs text-muted-foreground text-center">
                1 {swapFromAsset} ≈ 1,850 {swapToAsset}
              </div>
            )}

            <Button
              // onClick={handleSwap}
              className="w-full"
              variant="default"
            >
              <ArrowRightLeft className="h-4 w-4 mr-2" />
              Swap Assets
            </Button>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default TransferSwap;
