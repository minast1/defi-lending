import { useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import { Field, FieldError, FieldGroup } from "../ui/field";
import { Input } from "../ui/input";
import { Spinner } from "../ui/spinner";
import { TabsContent } from "../ui/tabs";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowDownUp, ArrowRightLeft } from "lucide-react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { encodeFunctionData, parseEther } from "viem";
import { useDeployedContractInfo, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { useBatchTx } from "~~/hooks/use-batchTx";
import { useGetWalletCapabilities } from "~~/hooks/use-getwallet-capabilities";
import { CreateSwapSchema, createSwapSchema } from "~~/lib/schema";

const SwapTab = ({ ETHprice, balance, daiBalance }: { ETHprice: number; balance: number; daiBalance: number }) => {
  const { supportsAtomicActions } = useGetWalletCapabilities();
  const { executeBatch } = useBatchTx();

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
    if (data.activeField === "ETH") {
      await writeDEXContract({
        functionName: "swap",
        args: [parseEther(data.eth.amount.toString())],
        value: parseEther(data.eth.amount.toString()),
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
                args: [dexContract?.address, parseEther(data.dai.availableBalance.toString())],
              }),
            },
            {
              to: dexContract?.address as `0x${string}`,
              data: encodeFunctionData({
                abi: dexContract?.abi as any,
                functionName: "swap",
                args: [parseEther(data.dai.amount.toString())],
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
            args: [dexContract?.address, parseEther(data.dai.availableBalance.toString())],
          });
          await writeDEXContract({
            functionName: "swap",
            args: [parseEther(data.dai.amount.toString())],
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
      activeField: "DAI",
      dai: {
        amount: "0",
        availableBalance: daiBalance,
      },
      eth: {
        amount: "0",
        availableBalance: balance,
      },
    },
    mode: "onChange",
  });
  //const selectedAsset = useWatch({ control: form.control, name: "selected" });
  const daiAmount = useWatch({ control: form.control, name: "dai.amount" });
  const ethAmount = useWatch({ control: form.control, name: "eth.amount" });
  const activeField = useWatch({ control: form.control, name: "activeField" });

  /** Sync ETH when DAI changes */
  useEffect(() => {
    if (activeField !== "DAI") return;
    // const ethVal =  || "0";
    if (!daiAmount || isNaN(Number(daiAmount))) {
      form.setValue("eth.amount", "0");
    }

    form.setValue("eth.amount", tokenToETH(String(daiAmount)), { shouldValidate: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [daiAmount, activeField]);

  /** Sync DAI when ETH changes */
  useEffect(() => {
    if (activeField !== "ETH") {
      ////form.setValue("eth.amount", "0");
      return;
    }
    if (!ethAmount || isNaN(Number(ethAmount))) {
      form.setValue("dai.amount", "0");
    }

    form.setValue("dai.amount", ethToToken(String(ethAmount)), { shouldValidate: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ethAmount, activeField]);

  //Update balances if props change
  useEffect(() => {
    form.setValue("dai.availableBalance", daiBalance);
    form.setValue("eth.availableBalance", balance);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [balance, daiBalance]);

  return (
    <TabsContent value="swap" className="space-y-1">
      {/* DAI input */}
      <form onSubmit={form.handleSubmit(handleSwap)}>
        <FieldGroup className="gap-3">
          <Controller
            control={form.control}
            name="dai.amount"
            render={({ field, fieldState }) => (
              <div className="p-3 rounded-lg bg-muted/30 border border-border space-y-2">
                <Field className="space-y-0" data-invalid={fieldState.invalid}>
                  <div className="flex justify-between text-sm">
                    {/* <FieldLabel className="text-sm text-inherit">Sell Dai</FieldLabel> */}
                    <span className="text-muted-foreground text-xs">
                      Available Balance: {daiBalance?.toString()} DAI
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Sell Dai"
                      id="dai"
                      //value={field.value?.toString() ?? ""}
                      onFocus={() => form.setValue("activeField", "DAI")}
                      //onChange={field.onChange}
                      className="text-lg"
                      {...field}
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
            name="eth.amount"
            render={({ field, fieldState }) => (
              <div className="p-3 rounded-lg bg-muted/30 border border-border space-y-2">
                <Field className="space-y-0" data-invalid={fieldState.invalid}>
                  <div className="flex justify-between text-sm">
                    {/* <FieldLabel className="text-sm text-inherit">Buy ETH</FieldLabel> */}
                    <span className="text-muted-foreground text-xs">Available Balance: {balance?.toFixed(4)} ETH</span>
                  </div>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Buy ETH"
                      id="eth"
                      // value={field.value?.toString() ?? ""}
                      onFocus={() => form.setValue("activeField", "ETH")}
                      //onChange={field.onChange}
                      {...field}
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
            ) : activeField == "ETH" ? (
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
