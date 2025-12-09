import React from "react";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Spinner } from "./ui/spinner";
import { TableCell, TableRow } from "./ui/table";
import { Address } from "@scaffold-ui/components";
import clsx from "clsx";
import { formatEther } from "viem";
import { useDeployedContractInfo, useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { collateralRatio } from "~~/utils/constant";
import { calculatePositionRatio } from "~~/utils/helpers";
import { notification } from "~~/utils/scaffold-eth";

type TProps = {
  user: string;
  ethPrice: number;
  connectedAddress: string;
};
const UserPosition = ({ user, ethPrice, connectedAddress }: TProps) => {
  const { data: userCollateral } = useScaffoldReadContract({
    contractName: "Lending",
    functionName: "s_userCollateral",
    args: [user],
  });

  const { data: userBorrowed } = useScaffoldReadContract({
    contractName: "Lending",
    functionName: "s_userBorrowed",
    args: [user],
  });

  const { data: basicLendingContract } = useDeployedContractInfo({
    contractName: "Lending",
  });

  const { data: allowance } = useScaffoldReadContract({
    contractName: "Dai",
    functionName: "allowance",
    args: [user, basicLendingContract?.address],
  });

  const { writeContractAsync: writeLendingContract, isPending: isLiquidating } = useScaffoldWriteContract({
    contractName: "Lending",
  });
  const { writeContractAsync: writeCornContract } = useScaffoldWriteContract({
    contractName: "Dai",
  });

  const borrowedAmount = Number(formatEther(userBorrowed || 0n));
  const ratio =
    borrowedAmount === 0
      ? "N/A"
      : calculatePositionRatio(Number(formatEther(userCollateral || 0n)), borrowedAmount, ethPrice).toFixed(1);

  const isPositionSafe = ratio == "N/A" || Number(ratio) >= collateralRatio;
  const liquidatePosition = async () => {
    if (allowance === undefined || userBorrowed === undefined || basicLendingContract === undefined) return;
    try {
      if (allowance < userBorrowed) {
        await writeCornContract({
          functionName: "approve",
          args: [basicLendingContract?.address, userBorrowed],
        });
      }
      await writeLendingContract({
        functionName: "liquidate",
        args: [user],
      });
      const borrowedValue = Number(formatEther(userBorrowed || 0n)) / ethPrice;
      const totalCollateral = Number(formatEther(userCollateral || 0n));
      const rewardValue =
        borrowedValue * 1.1 > totalCollateral ? totalCollateral.toFixed(2) : (borrowedValue * 1.1).toFixed(2);
      const shortAddress = user.slice(0, 6) + "..." + user.slice(-4);
      notification.success(
        <>
          <p className="font-bold mt-0 mb-1">Liquidation successful</p>
          <p className="m-0">You liquidated {shortAddress}&apos;s position.</p>
          <p className="m-0">
            You repaid {Number(formatEther(userBorrowed)).toFixed(2)} Dai and received {rewardValue} in ETH collateral.
          </p>
        </>,
      );
    } catch (e) {
      console.error("Error liquidating position:", e);
    }
  };

  return (
    <TableRow key={user} className={clsx("hover:bg-muted/30", connectedAddress === user && "bg-muted/30")}>
      <TableCell className="font-mono text-sm">
        <Address address={user} disableAddressLink format="short" size="sm" />
      </TableCell>
      <TableCell className="text-primary font-medium">
        {Number(formatEther(userCollateral || 0n)).toFixed(2)} ETH
      </TableCell>
      <TableCell className="text-warning font-medium">
        {Number(formatEther(userBorrowed || 0n)).toFixed(2)} Dai
      </TableCell>
      <TableCell>
        <Badge
          className={clsx(
            Number(ratio) < collateralRatio
              ? "bg-destructive text-white border-destructive"
              : Number(ratio) < 200
                ? "bg-warning text-white border-warning"
                : "bg-green-400/60 text-white border-green-400",
            "font-mono",
          )}
          //className="font-mono"
        >
          {ratio === "N/A" ? "N/A" : `${ratio}%`}
        </Badge>
      </TableCell>
      <TableCell className="text-right text-muted-foreground">
        <Button
          size="sm"
          variant={"outline"}
          className={clsx(
            "text-destructive rounded-4xl h-6 text-xs border-red-600 hover:bg-red-600/30 hover:cursor-pointer",
            connectedAddress === user && "hidden",
          )}
          disabled={isPositionSafe}
          onClick={liquidatePosition}
        >
          {isLiquidating ? <Spinner /> : "Liquidate"}
        </Button>
      </TableCell>
    </TableRow>
  );
};

export default UserPosition;
