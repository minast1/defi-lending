import { formatEther } from "viem";

export function calculatePositionRatio(userCollateral: number, borrowedAmount: number, ethPrice: number): number {
  const collateralValue = userCollateral * ethPrice;
  if (borrowedAmount === 0) return Infinity; // Return max if no tokens are borrowed
  return (collateralValue / borrowedAmount) * 100; // Calculate position ratio
}

export function getRatioColorClass(val: number): string {
  if (val === Infinity) return "dark:text-[#00FF7F] text-[#008000]";
  if (val < 1) return "text-red-800";
  if (val <= 2) return "dark:text-[#FFB74D] text-[#FF8C00]";
  return "dark:text-[#00FF7F] text-[#008000]";
}

export function calculateLiquidationPrice(
  userCollateralWei: bigint | undefined,
  userDebtWei: bigint | undefined,
): number {
  if (!userCollateralWei || userCollateralWei === 0n || !userDebtWei || userDebtWei === 0n) return 0;
  const collateral = parseFloat(formatEther(userCollateralWei));
  const debt = parseFloat(formatEther(userDebtWei));
  const liquidationThreshold = 1.2;

  const liqPrice = (debt * liquidationThreshold) / collateral;
  return liqPrice;
}
