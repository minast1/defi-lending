import React, { useEffect } from "react";
import RatioChange from "../ratio-change";
import { Button } from "../ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "../ui/field";
import { Input } from "../ui/input";
import { Spinner } from "../ui/spinner";
import { TabsContent } from "../ui/tabs";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { encodeFunctionData, formatEther, parseEther } from "viem";
import { useAccount, useWaitForTransactionReceipt } from "wagmi";
import { useDeployedContractInfo, useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { useBatchTx } from "~~/hooks/use-batchTx";
import { useGetWalletCapabilities } from "~~/hooks/use-getwallet-capabilities";
import { CreateRepaySchema, createRepaySchema } from "~~/lib/schema";

const RepayTab = () => {
  const { address } = useAccount();
  const { executeBatch } = useBatchTx();
  const { supportsAtomicActions } = useGetWalletCapabilities();

  const { data: ethPrice } = useScaffoldReadContract({
    contractName: "DEX",
    functionName: "currentPrice",
  });

  const form = useForm<CreateRepaySchema>({
    resolver: zodResolver(createRepaySchema),
  });

  const { data: basicLendingContract } = useDeployedContractInfo({
    contractName: "Lending",
  });

  const { data: daiContract } = useDeployedContractInfo({
    contractName: "Dai",
  });

  const { data: daiBalance } = useScaffoldReadContract({
    contractName: "Dai",
    functionName: "balanceOf",
    args: [address],
  });

  const { writeContractAsync: writeDaiContract } = useScaffoldWriteContract({
    contractName: "Dai",
  });

  const {
    writeContractAsync: writeLendingContract,
    isPending,
    data: lendingMutationHash,
  } = useScaffoldWriteContract({
    contractName: "Lending",
  });

  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash: lendingMutationHash,
  });

  useEffect(() => {
    if (isConfirmed) {
      form.reset({
        availableBalance: Math.floor(Number(formatEther(daiBalance || 0n)) * 100) / 100,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConfirmed, form]);

  //Reset form Default values when they are ready
  useEffect(() => {
    form.reset({
      availableBalance: Math.floor(Number(formatEther(daiBalance || 0n)) * 100) / 100,
    });
  }, [daiBalance, form]);

  const handleBorrow = async (data: CreateRepaySchema) => {
    // If wallet supports batching – use EIP-5792

    if (supportsAtomicActions) {
      console.log("Batch Tx Initiated ....");
      executeBatch({
        calls: [
          {
            to: daiContract?.address as `0x${string}`,
            data: encodeFunctionData({
              abi: daiContract?.abi as any,
              functionName: "approve",
              args: [basicLendingContract?.address, parseEther(data.availableBalance.toString())],
            }),
          },
          {
            to: basicLendingContract?.address as `0x${string}`,
            data: encodeFunctionData({
              abi: basicLendingContract?.abi as any,
              functionName: "repayDai",
              args: [parseEther(data.amount.toString())],
            }),
          },
        ],
      });
    } else {
      //Not Supported
      try {
        await writeDaiContract({
          functionName: "approve",
          args: [basicLendingContract?.address, parseEther(data.availableBalance.toString())],
        });
        await writeLendingContract({
          functionName: "repayDai",
          args: [parseEther(data.amount.toString())],
        });
      } catch (error) {
        console.error("Error repaying dai:", error);
      }
    }
  };

  return (
    <TabsContent value="repay" className="space-y-4">
      <form onSubmit={form.handleSubmit(handleBorrow)}>
        <FieldGroup>
          <Controller
            control={form.control}
            name="amount"
            render={({ field, fieldState }) => (
              <Field className="space-y-0" data-invalid={fieldState.invalid}>
                <FieldLabel className="text-sm text-inherit flex justify-between">
                  Amount
                  {address && (
                    <RatioChange
                      user={address}
                      ethPrice={Number(formatEther(ethPrice || 0n))}
                      inputAmount={-Number(field.value || 0)}
                    />
                  )}
                </FieldLabel>
                <Input
                  placeholder="0.00"
                  value={field.value?.toString() ?? ""}
                  onChange={field.onChange}
                  className="text-lg"
                  aria-invalid={fieldState.invalid}
                />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />
          <Button
            type="submit"
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground hover:cursor-pointer"
            //disabled={!amount}
          >
            {isPending || isConfirming ? (
              <>
                <Spinner className="mr-2" />
                Please Wait...
              </>
            ) : (
              `Repay Dai`
            )}
          </Button>
        </FieldGroup>
      </form>
    </TabsContent>
  );
};

export default RepayTab;
