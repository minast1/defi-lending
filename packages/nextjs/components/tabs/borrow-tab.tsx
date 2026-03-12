import React, { useEffect, useState } from "react";
import HealthFactorChange from "../healthfactor-change";
import { Button } from "../ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "../ui/field";
import { Input } from "../ui/input";
import { Spinner } from "../ui/spinner";
import { TabsContent } from "../ui/tabs";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { formatEther } from "viem";
import { useAccount } from "wagmi";
import { useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { CreateBorrowSchema, createBorrowSchema } from "~~/lib/schema";

const BorrowTab = () => {
  const { address } = useAccount();
  const [loading, setLoading] = useState(false);
  const { data: ethPrice } = useScaffoldReadContract({
    contractName: "DEX",
    functionName: "currentPrice",
  });

  const form = useForm<CreateBorrowSchema>({
    resolver: zodResolver(createBorrowSchema),
    defaultValues: {
      amount: 0,
      price: 0,
      collateral: 0,
      currentDebt: 0,
    },
  });

  const { data: userCollateral } = useScaffoldReadContract({
    contractName: "Lending",
    functionName: "getUserCollateral",
    args: [address],
  });

  const { data: userBorrowed } = useScaffoldReadContract({
    contractName: "Lending",
    functionName: "getUserBorrowed",
    args: [address],
  });
  const { writeContractAsync: writeLendingContract, isMining } = useScaffoldWriteContract({
    contractName: "Lending",
  });

  useEffect(() => {
    if (ethPrice !== undefined && userCollateral !== undefined) {
      form.setValue("price", Number(ethPrice)); // No formatEther here!
      form.setValue("collateral", Number(formatEther(userCollateral)));
      form.setValue("currentDebt", Number(userBorrowed || 0n));
    }
  }, [ethPrice, userCollateral, userBorrowed, form]);
  // console.log({
  //   ethPrice: Number(ethPrice),
  //   collateral: Number(formatEther(userCollateral || 0n)) * Number(ethPrice),
  //   currentDebt: Number(userBorrowed || 0n),
  // });
  const handleBorrow = async (data: CreateBorrowSchema) => {
    setLoading(true);
    try {
      await writeLendingContract(
        {
          functionName: "borrowDai",
          args: [BigInt(data.amount)],
        },
        {
          onError: error => {
            console.log(error);
            setLoading(false);
          },
          onBlockConfirmation: () => {
            setLoading(false);
            form.reset({
              amount: 0,
              price: 0,
              collateral: 0,
              currentDebt: 0,
            });
          },
        },
      );
    } catch (error) {
      console.error("Error borrowing corn:", error);
    }
  };

  return (
    <TabsContent value="borrow" className="space-y-2">
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
                    <HealthFactorChange
                      user={address}
                      ethPrice={Number(ethPrice || 0n)}
                      inputAmount={Number(field.value || 0)}
                      isBorrow={true}
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
            {loading || isMining ? (
              <>
                <Spinner className="mr-2" />
                Please Wait...
              </>
            ) : (
              `Borrow Dai`
            )}
          </Button>
        </FieldGroup>
      </form>
    </TabsContent>
  );
};

export default BorrowTab;
