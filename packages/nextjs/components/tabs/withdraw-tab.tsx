"use client";

import React, { useEffect } from "react";
import { TAsset } from "../deposit-and-withdraw";
import { Button } from "../ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "../ui/field";
import { Input } from "../ui/input";
import { Spinner } from "../ui/spinner";
import { TabsContent } from "../ui/tabs";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { parseEther } from "viem";
import { useAccount } from "wagmi";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { CreateWithdrawalSchema, createWithdrawSchema } from "~~/lib/schema";

type TProps = {
  asset: TAsset;
  balance: number;
};
const WithdrawTab = ({ asset, balance }: TProps) => {
  const { address } = useAccount();
  const [isLoading, setIsLoading] = React.useState(false);
  const form = useForm<CreateWithdrawalSchema>({
    resolver: zodResolver(createWithdrawSchema),
    defaultValues: {
      availableBalance: balance,
      amount: 0,
      address,
    },
  });

  const { writeContractAsync: writeLendingContract, isMining } = useScaffoldWriteContract({
    contractName: "Lending",
  });

  // //Reset form Default values when they are ready
  useEffect(() => {
    if (address !== undefined) {
      form.setValue("address", address);
      form.setValue("availableBalance", balance);
    }
  }, [address, balance, form]);

  const handleWithdraw = async (data: CreateWithdrawalSchema) => {
    setIsLoading(true);
    try {
      console.log(data.amount);
      await writeLendingContract(
        {
          functionName: "withdrawCollateral",
          args: [parseEther(data.amount.toString())],
        },
        {
          onBlockConfirmation: () => {
            setIsLoading(false);
            form.reset({
              availableBalance: balance,
              amount: 0,
              address,
            });
          },
        },
      );
    } catch (error) {
      console.error("Error adding collateral:", error);
    }
  };

  return (
    <TabsContent value="withdraw" className="space-y-4">
      <form onSubmit={form.handleSubmit(handleWithdraw)}>
        <FieldGroup>
          <Controller
            control={form.control}
            name="amount"
            render={({ field, fieldState }) => (
              <Field className="space-y-0" data-invalid={fieldState.invalid}>
                <FieldLabel className="text-sm text-inherit">Amount</FieldLabel>
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
            {isMining || isLoading ? (
              <>
                <Spinner className="mr-2" />
                Withdrawing...
              </>
            ) : (
              `Withdraw ${asset.symbol}`
            )}
          </Button>
        </FieldGroup>
      </form>
    </TabsContent>
  );
};

export default WithdrawTab;
