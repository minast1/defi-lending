import React from "react";
import { Progress } from "./ui/progress";
import { getRatioColorClass } from "~~/utils/helpers";

interface CollateralSafetyBarProps {
  ratio: number | string;
  threshold: number;
}

const CollateralSafetyBar = ({ ratio, threshold }: CollateralSafetyBarProps) => {
  if (ratio === "N/A" || Number(ratio) === 0) {
    return <Progress value={100} className="h-3 [&>div]:bg-success" />;
  }

  const safePercent = Math.min(100, (Number(ratio) / threshold) * 100);
  console.log({ safePercent });
  // Determine color based on risk level
  const color = getRatioColorClass(ratio);

  return <Progress value={safePercent} className={`h-3 [&>div]:transition-all [&>div]:duration-300 ${color}`} />;
};

export default CollateralSafetyBar;
