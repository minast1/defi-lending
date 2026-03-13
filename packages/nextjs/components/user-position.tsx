import React from "react";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Spinner } from "./ui/spinner";
import { TableCell, TableRow } from "./ui/table";
import { Address } from "@scaffold-ui/components";
import clsx from "clsx";
import { formatEther } from "viem";
import { useDeployedContractInfo, useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { notification } from "~~/utils/scaffold-eth";

type TProps = {
  user: any;
  ethPrice: number;
  idx: number;
  connectedAddress: string;
};
const UserPosition = ({ user, ethPrice, connectedAddress, idx }: TProps) => {
  const [isLoading, setIsLoading] = React.useState(false);
  const { data: userBorrowed } = useScaffoldReadContract({
    contractName: "Lending",
    functionName: "s_userBorrowed",
    args: [user.user],
  });

  const { data: userCollateral } = useScaffoldReadContract({
    contractName: "Lending",
    functionName: "s_userCollateral",
    args: [user.user],
  });

  const { data: basicLendingContract } = useDeployedContractInfo({
    contractName: "Lending",
  });

  const { data: allowance } = useScaffoldReadContract({
    contractName: "Dai",
    functionName: "allowance",
    args: [user.user, basicLendingContract?.address],
  });

  const { data: liquidatorDaiBalance } = useScaffoldReadContract({
    contractName: "Dai",
    functionName: "balanceOf",
    args: [connectedAddress],
  });

  const { writeContractAsync: writeLendingContract, isMining: isLiquidating } = useScaffoldWriteContract({
    contractName: "Lending",
  });
  const { writeContractAsync: writeCornContract, isMining: isApproving } = useScaffoldWriteContract({
    contractName: "Dai",
  });

  const COLLATERAL_RATIO = 1.2;
  const collateralInDai = Number(formatEther(userCollateral || 0n)) * ethPrice;
  const borrowedAmount = Number(userBorrowed || 0n);

  const calculateHF = (debt: number) => {
    if (debt <= 0) return Infinity;
    const hf = collateralInDai / (debt * COLLATERAL_RATIO);
    return hf;
  };

  const hf = calculateHF(borrowedAmount);
  const isPositionSafe = hf >= 1.0;
  const liquidatePosition = async () => {
    if (allowance === undefined || userBorrowed === undefined || basicLendingContract === undefined) return;
    if (Number(liquidatorDaiBalance) < Number(userBorrowed)) {
      notification.error("You don't have enough Dai to liquidate");
      return;
    }
    setIsLoading(true);
    try {
      if ((allowance || 0n) < userBorrowed) {
        await writeCornContract(
          {
            functionName: "approve",
            args: [basicLendingContract?.address, userBorrowed],
          },
          {
            onBlockConfirmation: async () => {
              await writeLendingContract(
                {
                  functionName: "liquidate",
                  args: [user.user],
                },
                {
                  onBlockConfirmation: () => {
                    const borrowedValue = Number(userBorrowed || 0n) / ethPrice;
                    const totalCollateral = Number(formatEther(userCollateral || 0n));
                    const rewardValue =
                      borrowedValue * 1.1 > totalCollateral
                        ? totalCollateral.toFixed(2)
                        : (borrowedValue * 1.1).toFixed(2);
                    const shortAddress = user.user.slice(0, 6) + "..." + user.user.slice(-4);

                    notification.success(
                      <>
                        <p className="font-bold mt-0 mb-1">Liquidation successful</p>
                        <p className="m-0">You liquidated {shortAddress}&apos;s position.</p>
                        <p className="m-0">
                          You repaid {Number(userBorrowed).toFixed(2)} Dai and received {rewardValue} in ETH collateral.
                        </p>
                      </>,
                      {
                        duration: 7000,
                      },
                    );
                    setIsLoading(false);
                  },
                },
              );
            },
          },
        );
      }
    } catch (e) {
      console.error("Error liquidating position:", e);
    }
  };

  return (
    <TableRow key={idx} className={clsx("hover:bg-muted/30", connectedAddress === user && "bg-muted/30")}>
      <TableCell className="font-mono text-sm w-[220px]">
        <Address address={user.user} disableAddressLink format="short" size="sm" />
      </TableCell>
      <TableCell className="text-primary font-medium w-[170px]">
        {Number(formatEther(userCollateral || 0n)).toFixed(2)} ETH
      </TableCell>
      <TableCell className="text-warning font-medium">{Number(userBorrowed || 0n).toFixed(1)} Dai</TableCell>
      <TableCell className="w-[170px]">
        <Badge
          className={clsx(
            hf < 1
              ? "bg-destructive text-white border-destructive"
              : hf <= 2
                ? "bg-warning text-white border-warning"
                : "bg-green-400/60 text-white border-green-400",
            "font-mono",
          )}
          //className="font-mono"
        >
          {hf === Infinity ? "N/A" : hf.toFixed(2)}
        </Badge>
      </TableCell>
      <TableCell className="text-right text-muted-foreground w-[100px]">
        <Button
          size="sm"
          variant={"outline"}
          className={clsx(
            "text-destructive rounded-4xl h-6 text-xs border-red-600 hover:bg-red-600/30 hover:cursor-pointer",
            (connectedAddress === user.user || isPositionSafe) && "hidden",
          )}
          disabled={isPositionSafe}
          onClick={liquidatePosition}
        >
          {isLiquidating || isApproving || isLoading ? <Spinner /> : "Liquidate"}
        </Button>
      </TableCell>
    </TableRow>
  );
};

export default UserPosition;
