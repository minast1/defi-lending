import * as z from "zod";

export const createDepositSchema = z
  .object({
    address: z.string(),
    amount: z.coerce.number<number>(),
    availableBalance: z.number().nonnegative({ message: "Invalid available balance" }),
  })
  .check(ctx => {
    if (ctx.value.amount > ctx.value.availableBalance) {
      ctx.issues.push({
        code: "custom",
        message: "Insufficient Eth Balance",
        input: ctx.value.amount,
        path: ["amount"],
      });
    }
  });

export const createWithdrawSchema = createDepositSchema
  .extend({
    // amount: z.string().min(1, { message: "Please add an amount to withdraw" }),
  })
  .check(ctx => {
    if (ctx.value.amount > ctx.value.availableBalance) {
      ctx.issues.push({
        code: "custom",
        message: "Insufficient Collateral Balance",
        input: ctx.value.amount,
        path: ["amount"],
      });
    }
  });
export type CreateDepositSchema = z.infer<typeof createDepositSchema>;
export type CreateWithdrawalSchema = z.infer<typeof createWithdrawSchema>;
