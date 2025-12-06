export function calculatePositionRatio(userCollateral: number, borrowedAmount: number, ethPrice: number): number {
  const collateralValue = userCollateral * ethPrice;
  if (borrowedAmount === 0) return 120; // Return max if no tokens are borrowed
  return (collateralValue / borrowedAmount) * 100; // Calculate position ratio
}
