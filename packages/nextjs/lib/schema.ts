import { isAddress } from "viem";
import * as z from "zod";
import { collateralRatio } from "~~/utils/constant";
import { calculatePositionRatio } from "~~/utils/helpers";

export const createDepositSchema = z
  .object({
    address: z.string().refine(val => isAddress(val), { error: "Not a valid ethereum address" }),
    amount: z.coerce.number<number>({ error: "Please enter a valid amount" }),
    availableBalance: z.number().nonnegative({ message: "Invalid available balance" }),
  })
  .check(ctx => {
    if (ctx.value.amount > ctx.value.availableBalance || ctx.value.amount == ctx.value.availableBalance) {
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

export const createBorrowSchema = createDepositSchema
  .extend({
    price: z.number(),
    collateral: z.number(),
  })
  .omit({ availableBalance: true, address: true })
  .check(ctx => {
    const positionRatio = calculatePositionRatio(ctx.value.collateral, ctx.value.amount, ctx.value.price);
    if (positionRatio < collateralRatio) {
      ctx.issues.push({
        code: "custom",
        message: `Unsafe position ratio for borrow amount ${ctx.value.amount}`,
        input: ctx.value.amount,
        path: ["amount"],
      });
    }
  });

export const createRepaySchema = createDepositSchema
  .extend({})
  .omit({ address: true })
  .check(ctx => {
    if (ctx.value.amount > ctx.value.availableBalance) {
      ctx.issues.push({
        code: "custom",
        message: "Amount exceeds available balance",
        input: ctx.value.amount,
        path: ["amount"],
      });

      // if (ctx.value.amount > ctx.value.availableBalance) {  //Fix this
      //   ///Fix this  <-
      //   ctx.issues.push({
      //     code: "custom",
      //     message: "Account has no borrowed assets",
      //     input: ctx.value.amount,
      //     path: ["amount"],
      //   });
      // }
    }
  });

export const createTransferSchema = createDepositSchema.extend({}).check(ctx => {
  if (ctx.value.amount > ctx.value.availableBalance) {
    ctx.issues.push({
      code: "custom",
      message: "Amount exceeds available balance",
      input: ctx.value.amount,
      path: ["amount"],
    });
  }
});

export const assets = ["ETH", "DAI"] as const;
export const createSwapSchema = z
  .object({
    activeField: z.enum(assets),
    dai: z.object({
      amount: z.string({ error: "Please enter a valid amount" }),
      availableBalance: z.number().nonnegative({ message: "Invalid available balance" }),
    }),

    eth: z.object({
      amount: z.string({ error: "Please enter a valid amount" }),
      availableBalance: z.number().nonnegative({ message: "Invalid available balance" }),
      // asset: z.string({ error: "This field is required" }),
    }),
  })
  .check(ctx => {
    const ethAmount = Number(ctx.value.eth.amount);
    const daiAmount = Number(ctx.value.dai.amount);
    if (ctx.value.activeField === "DAI") {
      //check for nonzero values

      if (!isNaN(daiAmount) && daiAmount > ctx.value.dai.availableBalance) {
        ctx.issues.push({
          code: "custom",
          message: "Amount exceeds available balance",
          input: ctx.value.dai.amount,
          path: ["dai", "amount"],
        });
      }
    }
    if (ctx.value.activeField === "ETH") {
      if (!isNaN(ethAmount) && ethAmount > ctx.value.eth.availableBalance) {
        ctx.issues.push({
          code: "custom",
          message: "Amount exceeds available balance",
          input: ctx.value.eth.amount,
          path: ["eth", "amount"],
        });
      }
    }
  });

export type CreateSwapSchema = z.infer<typeof createSwapSchema>;
export type CreateTransferSchema = z.infer<typeof createTransferSchema>;
export type CreateRepaySchema = z.infer<typeof createRepaySchema>;
export type CreateBorrowSchema = z.infer<typeof createBorrowSchema>;
export type CreateDepositSchema = z.infer<typeof createDepositSchema>;
export type CreateWithdrawalSchema = z.infer<typeof createWithdrawSchema>;
