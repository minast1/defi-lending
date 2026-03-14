import React, { useEffect } from "react";
import { AddressInput } from "../address-input";
import { Button } from "../ui/button";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "../ui/field";
import { Input } from "../ui/input";
import { Spinner } from "../ui/spinner";
import { TabsContent } from "../ui/tabs";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { useAccount } from "wagmi";
import { useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { CreateTransferSchema, createTransferSchema } from "~~/lib/schema";

const TransferTab = () => {
  const { address } = useAccount();
  const [isLoading, setIsLoading] = React.useState(false);
  const form = useForm<CreateTransferSchema>({
    resolver: zodResolver(createTransferSchema),
    defaultValues: {
      availableBalance: 0,
      amount: 0,
    },
  });

  const { data: daiBalance } = useScaffoldReadContract({
    contractName: "Dai",
    functionName: "balanceOf",
    args: [address],
  });

  const { writeContractAsync: writeDaiContract, isMining } = useScaffoldWriteContract({
    contractName: "Dai",
  });

  useEffect(() => {
    if (daiBalance !== undefined) {
      form.setValue("availableBalance", Number(daiBalance || 0n));
    }
  }, [daiBalance, form]);

  const handleTransfer = async (data: CreateTransferSchema) => {
    await writeDaiContract(
      {
        functionName: "transfer",
        args: [data.address, BigInt(data.amount)],
      },
      {
        onBlockConfirmation: () => {
          setIsLoading(false);
          form.reset({
            availableBalance: 0,
            amount: 0,
          });
        },
      },
    );
  };
  return (
    <TabsContent value="transfer" className="space-y-4">
      <form onSubmit={form.handleSubmit(handleTransfer)}>
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
          <Controller
            control={form.control}
            name="address"
            render={({ field, fieldState }) => (
              <Field className="space-y-0" data-invalid={fieldState.invalid}>
                <FieldLabel className="text-sm text-inherit">Recipient Address</FieldLabel>

                <AddressInput
                  value={field.value?.toString() ?? ""}
                  onChange={field.onChange}
                  className="text-lg"
                  aria-invalid={fieldState.invalid}
                  placeholder="0x1234...abcd"
                  // className="font-mono h-12 text-base border-2 focus-visible:border-primary"
                />
                {fieldState.invalid ? (
                  <FieldError errors={[fieldState.error]} />
                ) : (
                  <FieldDescription>Enter Recipeient ens address or normal address</FieldDescription>
                )}
              </Field>
            )}
          />
          <Button
            type="submit"
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground hover:cursor-pointer"
            //disabled={!amount}
          >
            {isLoading || isMining ? (
              <>
                <Spinner className="mr-2" />
                Please Wait...
              </>
            ) : (
              `Send`
            )}
          </Button>
        </FieldGroup>
      </form>
    </TabsContent>
  );
};

export default TransferTab;
