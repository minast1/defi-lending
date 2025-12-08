import React, { useEffect } from "react";
import RatioChange from "../ratio-change";
import { Button } from "../ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "../ui/field";
import { Input } from "../ui/input";
import { Spinner } from "../ui/spinner";
import { TabsContent } from "../ui/tabs";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { formatEther, parseEther } from "viem";
import { useAccount, useWaitForTransactionReceipt } from "wagmi";
import { useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { CreateBorrowSchema, createBorrowSchema } from "~~/lib/schema";

const BorrowTab = () => {
  const { address } = useAccount();
  const { data: ethPrice } = useScaffoldReadContract({
    contractName: "DEX",
    functionName: "currentPrice",
  });

  const form = useForm<CreateBorrowSchema>({
    resolver: zodResolver(createBorrowSchema),
  });

  const { data: userCollateral } = useScaffoldReadContract({
    contractName: "Lending",
    functionName: "s_userCollateral",
    args: [address],
  });

  const {
    writeContractAsync: writeLendingContract,
    isPending,
    data: hash,
  } = useScaffoldWriteContract({
    contractName: "Lending",
  });

  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  useEffect(() => {
    if (isConfirmed) {
      form.reset({
        price: Number(formatEther(ethPrice || 0n)),
        collateral: Number(formatEther(userCollateral || 0n)),
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConfirmed]);

  //Reset form Default values when they are ready
  useEffect(() => {
    form.reset({
      price: Number(formatEther(ethPrice || 0n)),
      collateral: Number(formatEther(userCollateral || 0n)),
    });
  }, [ethPrice, userCollateral, form]);

  const handleBorrow = async (data: CreateBorrowSchema) => {
    console.log(data);
    try {
      await writeLendingContract({
        functionName: "borrowDai",
        args: [parseEther(data.amount.toString())],
      });
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
                    <RatioChange
                      user={address}
                      ethPrice={Number(formatEther(ethPrice || 0n))}
                      inputAmount={Number(field.value || 0)}
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
              `Borrow Dai`
            )}
          </Button>
        </FieldGroup>
      </form>
    </TabsContent>
  );
};

export default BorrowTab;
