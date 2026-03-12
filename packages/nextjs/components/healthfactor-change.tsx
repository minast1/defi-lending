import React from "react";
import { formatEther } from "viem";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";
import { getRatioColorClass } from "~~/utils/helpers";

type UserPositionProps = {
  user: string;
  ethPrice: number;
  inputAmount: number;
};

const HealthFactorChange = ({ user, ethPrice, inputAmount }: UserPositionProps) => {
  const { data: userCollateral } = useScaffoldReadContract({
    contractName: "Lending",
    functionName: "getUserCollateral",
    args: [user],
  });

  const { data: userBorrowed } = useScaffoldReadContract({
    contractName: "Lending",
    functionName: "getUserBorrowed",
    args: [user],
  });
  const COLLATERAL_RATIO = 1.2;
  const collateralInDai = Number(formatEther(userCollateral || 0n)) * ethPrice;
  const borrowedAmount = Number(userBorrowed || 0n);

  const calculateHF = (debt: number) => {
    if (debt <= 0) return Infinity;
    const hf = collateralInDai / (debt * COLLATERAL_RATIO);
    return hf;
  };

  const currentHF = calculateHF(borrowedAmount);

  const nextHF = calculateHF(borrowedAmount + inputAmount);
  const formatHF = (val: number) => (val === Infinity ? "∞" : Math.floor(val * 100) / 100);
  if (inputAmount === 0 || isNaN(inputAmount)) return null;

  return (
    <div className="text-xs font-medium flex items-center gap-1">
      <span className="text-muted-foreground uppercase tracking-wider">HF:</span>
      <span className={getRatioColorClass(currentHF)}>{formatHF(currentHF)}</span>
      <span className="text-muted-foreground">→</span>
      <span className={`${getRatioColorClass(nextHF)} font-bold`}>{formatHF(nextHF)}</span>
    </div>
  );
};

export default HealthFactorChange;
