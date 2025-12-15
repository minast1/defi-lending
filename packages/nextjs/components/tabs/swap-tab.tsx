import { useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import { Field, FieldError, FieldGroup } from "../ui/field";
import { Input } from "../ui/input";
import { Spinner } from "../ui/spinner";
import { TabsContent } from "../ui/tabs";
import { zodResolver } from "@hookform/resolvers/zod";
import { useWatchBalance } from "@scaffold-ui/hooks";
import { ArrowDownUp, ArrowRightLeft } from "lucide-react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { encodeFunctionData, formatEther, parseEther } from "viem";
import { useAccount } from "wagmi";
import { useDeployedContractInfo, useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { useBatchTx } from "~~/hooks/use-batchTx";
import { useGetWalletCapabilities } from "~~/hooks/use-getwallet-capabilities";
import { CreateSwapSchema, createSwapSchema } from "~~/lib/schema";

const SwapTab = ({ ETHprice }: { ETHprice: number }) => {
  const { address } = useAccount();
  const { supportsAtomicActions } = useGetWalletCapabilities();
  const { executeBatch } = useBatchTx();

  const { data: balance } = useWatchBalance({ address }); ///Eth balance
  const { data: daiBalance } = useScaffoldReadContract({
    contractName: "Dai",
    functionName: "balanceOf",
    args: [address],
  });

  const { writeContractAsync: writeDEXContract, isPending } = useScaffoldWriteContract({
    contractName: "DEX",
  });
  const { writeContractAsync: writeDaiContract } = useScaffoldWriteContract({
    contractName: "Dai",
  });
  const { data: daiContract } = useDeployedContractInfo({
    contractName: "Dai",
  });

  const { data: dexContract } = useDeployedContractInfo({
    contractName: "DEX",
  });

  const handleSwap = async (data: CreateSwapSchema) => {
    if (data.selected === "ETH") {
      await writeDEXContract({
        functionName: "swap",
        args: [parseEther(data.buy.amount.toString())],
        value: parseEther(data.buy.amount.toString()),
      });
    } else {
      console.log("Swapping DAI to ETH....");
      if (supportsAtomicActions) {
        console.log("Batch Tx Initiated ....");
        executeBatch({
          calls: [
            {
              to: daiContract?.address as `0x${string}`,
              data: encodeFunctionData({
                abi: daiContract?.abi as any,
                functionName: "approve",
                args: [dexContract?.address, parseEther(data.sell.availableBalance.toString())],
              }),
            },
            {
              to: dexContract?.address as `0x${string}`,
              data: encodeFunctionData({
                abi: dexContract?.abi as any,
                functionName: "swap",
                args: [parseEther(data.sell.amount.toString())],
              }),
            },
          ],
        });
      } else {
        //Not Supported
        console.log("Not Supported Write...");
        try {
          await writeDaiContract({
            functionName: "approve",
            args: [dexContract?.address, parseEther(data.sell.availableBalance.toString())],
          });
          await writeDEXContract({
            functionName: "swap",
            args: [parseEther(data.sell.amount.toString())],
          });
        } catch (error) {
          console.error("Error repaying dai:", error);
        }
      }
    } //End of main else
  };

  const ethToToken = (ethAmount: string): string => {
    const tokenAmount = Number(ethAmount) * Number(ETHprice);
    return tokenAmount.toFixed(8);
  };

  const tokenToETH = (tokenAmount: string): string => {
    const ethAmount = Number(tokenAmount) / Number(ETHprice);

    return ethAmount.toFixed(8);
  };

  const form = useForm<CreateSwapSchema>({
    resolver: zodResolver(createSwapSchema),
    defaultValues: {
      sell: {
        amount: 0.0,
        availableBalance: 0,
      },
      buy: {
        amount: 0.0,
        availableBalance: 0,
      },
    },
    mode: "onChange",
  });
  //const selectedAsset = useWatch({ control: form.control, name: "selected" });
  const sellAmount = useWatch({ control: form.control, name: "sell.amount" });
  const buyAmount = useWatch({ control: form.control, name: "buy.amount" });
  const selectedAsset = useWatch({ control: form.control, name: "selected" });

  useEffect(() => {
    if (!sellAmount) {
      form.setValue("buy.amount", 0);
      return;
    }

    const ethVal = tokenToETH(String(sellAmount));

    form.setValue("buy.amount", Number(ethVal));
    return;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sellAmount]);

  useEffect(() => {
    if (!buyAmount) {
      form.setValue("sell.amount", 0);
      return;
    }

    const daiVal = ethToToken(String(buyAmount));
    form.setValue("sell.amount", Number(daiVal));
    return;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [buyAmount]);
  //Watch and set default available balances
  useEffect(() => {
    if (!balance || !daiBalance) return;
    form.setValue("sell.availableBalance", Math.floor(Number(formatEther(daiBalance || 0n)) * 100) / 100);
    form.setValue("buy.availableBalance", Number(balance.formatted));
  }, [balance, daiBalance, form]);

  return (
    <TabsContent value="swap" className="space-y-1">
      {/* From Asset */}
      <form onSubmit={form.handleSubmit(handleSwap)}>
        <FieldGroup className="gap-3">
          <Controller
            control={form.control}
            name="sell.amount"
            render={({ field, fieldState }) => (
              <div className="p-3 rounded-lg bg-muted/30 border border-border space-y-2">
                <Field className="space-y-0" data-invalid={fieldState.invalid}>
                  <div className="flex justify-between text-sm">
                    {/* <FieldLabel className="text-sm text-inherit">Sell Dai</FieldLabel> */}
                    <span className="text-muted-foreground text-xs">
                      Available Balance: {Math.floor(Number(formatEther(daiBalance || 0n)) * 100) / 100} DAI
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Sell Dai"
                      value={field.value?.toString() ?? ""}
                      onChange={val => {
                        form.setValue("selected", "DAI");
                        field.onChange(val);
                      }}
                      className="text-lg"
                      aria-invalid={fieldState.invalid}
                    />

                    <div className="px-3 py-2 rounded-lg bg-background border border-border text-sm font-medium">
                      <Avatar className="w-5 h-5">
                        <AvatarImage src="https://assets.coingecko.com/coins/images/9956/small/4943.png" alt="Dai" />
                        <AvatarFallback>DAI</AvatarFallback>
                      </Avatar>
                    </div>
                  </div>

                  {fieldState.invalid && <FieldError>{fieldState.error?.message}</FieldError>}
                </Field>
              </div>
            )}
          />
          {/* Flip Button */}
          <div className="flex justify-center">
            <button
              //onClick={flipSwapAssets}
              className="p-2 rounded-full border border-border bg-card hover:bg-muted/50 transition-colors"
            >
              <ArrowDownUp className="h-4 w-4 text-primary" />
            </button>
          </div>
          <Controller
            control={form.control}
            name="buy.amount"
            render={({ field, fieldState }) => (
              <div className="p-3 rounded-lg bg-muted/30 border border-border space-y-2">
                <Field className="space-y-0" data-invalid={fieldState.invalid}>
                  <div className="flex justify-between text-sm">
                    {/* <FieldLabel className="text-sm text-inherit">Buy ETH</FieldLabel> */}
                    <span className="text-muted-foreground text-xs">
                      Available Balance: {Number(balance?.formatted).toFixed(4)} ETH
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Buy ETH"
                      value={field.value?.toString() ?? ""}
                      onChange={val => {
                        form.setValue("selected", "ETH");
                        field.onChange(val);
                      }}
                      className="text-lg"
                      aria-invalid={fieldState.invalid}
                    />

                    <div className="px-3 py-2 rounded-lg bg-background border border-border text-sm font-medium">
                      <Avatar className="w-5 h-5">
                        <AvatarImage src="https://assets.coingecko.com/coins/images/279/small/ethereum.png" alt="Eth" />
                        <AvatarFallback>ETH</AvatarFallback>
                      </Avatar>
                    </div>
                  </div>

                  {fieldState.invalid && <FieldError>{fieldState.error?.message}</FieldError>}
                </Field>
              </div>
            )}
          />
          <Button
            // onClick={handleSwap}
            className="w-full"
            variant="default"
          >
            <ArrowRightLeft className="h-4 w-4 mr-2" />
            {isPending ? (
              <>
                <Spinner className="mr-2" /> ...Swapping
              </>
            ) : selectedAsset == "ETH" ? (
              `Swap ETH`
            ) : (
              `Swap DAI`
            )}
          </Button>
        </FieldGroup>

        {/* Rate Info */}
        {/* {swapAmount && (
          <div className="text-xs text-muted-foreground text-center">
            1 {swapFromAsset} ≈ 1,850 {swapToAsset}
          </div>
        )} */}
      </form>
    </TabsContent>
  );
};

export default SwapTab;
