"use client";

import React, { useEffect } from "react";
import { TAsset } from "../deposit-and-withdraw";
import { EtherInput } from "../ether-input";
import { Button } from "../ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "../ui/field";
import { Spinner } from "../ui/spinner";
import { TabsContent } from "../ui/tabs";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { parseEther } from "viem";
import { useAccount, useWaitForTransactionReceipt } from "wagmi";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { CreateDepositSchema, createDepositSchema } from "~~/lib/schema";

type TProps = {
  asset: TAsset;
  balance: number;
};
const DepositTab = ({ asset, balance }: TProps) => {
  const { address } = useAccount();
  const form = useForm<CreateDepositSchema>({
    resolver: zodResolver(createDepositSchema),
  });

  const {
    writeContractAsync: writeLendingContract,
    data: hash,
    isPending,
  } = useScaffoldWriteContract({
    contractName: "Lending",
  });

  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });
  //Reset form Default values when they are ready
  useEffect(() => {
    form.reset({
      availableBalance: balance,
      address,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address, balance]);

  useEffect(() => {
    if (isConfirmed) {
      form.reset({
        availableBalance: balance,
        amount: 0,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConfirmed]);
  const handleDeposit = async (data: CreateDepositSchema) => {
    //console.log(data)
    try {
      await writeLendingContract({
        functionName: "addCollateral",
        value: parseEther(data.amount.toString()),
      });
    } catch (error) {
      console.error("Error adding collateral:", error);
    }
  };

  return (
    <TabsContent value="deposit" className="space-y-4">
      <form onSubmit={form.handleSubmit(handleDeposit)}>
        <FieldGroup>
          <Controller
            control={form.control}
            name="amount"
            render={({ field, fieldState }) => (
              <Field className="space-y-0" data-invalid={fieldState.invalid}>
                <FieldLabel className="text-sm text-inherit">Amount</FieldLabel>
                <EtherInput
                  placeholder="0.00"
                  value={field.value?.toString() ?? ""}
                  onChange={field.onChange}
                  className="text-lg"
                  ariaInvalid={fieldState.invalid}
                  defaultUsdMode={false}
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
                Depositing...
              </>
            ) : (
              `Deposit ${asset.symbol}`
            )}
          </Button>
        </FieldGroup>
      </form>
    </TabsContent>
  );
};

export default DepositTab;
