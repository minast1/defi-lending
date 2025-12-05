import React from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import clsx from "clsx";
import { formatEther } from "viem";
import { useTargetNetwork } from "~~/hooks/scaffold-eth";
import { useEthUsdPrice } from "~~/hooks/useEthUsdPrice";

type TProps = {
  ethValue: bigint | undefined;
  className?: string;
};

/**
 * Display (ETH & USD) balance of an ETH address.
 */
const EthUsDToggle = ({ ethValue, className = "" }: TProps) => {
  const { targetNetwork } = useTargetNetwork();
  const [showUsd, setShowUsd] = React.useState(true);
  const { data: ethUsdPrice, isLoading, isError } = useEthUsdPrice();
  const toggle = () => setShowUsd(s => !s);

  if (isLoading || !ethValue || ethUsdPrice === 0) {
    return (
      <div className="animate-pulse flex space-x-4">
        <div className="rounded-md bg-slate-300 h-6 w-6"></div>
        <div className="flex items-center space-y-6">
          <div className="h-2 w-28 bg-slate-300 rounded-sm"></div>
        </div>
      </div>
    );
  }

  if (isError || !ethUsdPrice) {
    return (
      <div className="border-2 border-base-content/30 rounded-md px-2 flex flex-col items-center max-w-fit cursor-pointer">
        <div className="text-warning">Error</div>
      </div>
    );
  }

  const formattedEThValue = ethValue ? Number(formatEther(ethValue)) : 0;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          className={clsx(
            "btn btn-sm btn-ghost hover:cursor-pointer flex flex-col font-normal items-center hover:bg-transparent",
          )}
          onClick={toggle}
          type="button"
        >
          <div className={clsx("w-full flex items-center justify-center", className)}>
            {showUsd ? (
              <>
                <span className="text-[0.8em] font-bold mr-1">$</span>
                <span>{(formattedEThValue * ethUsdPrice).toFixed(2)}</span>
              </>
            ) : (
              <>
                <span>{formattedEThValue.toFixed(4)}</span>
                <span className="text-[0.8em] font-bold ml-1">{targetNetwork.nativeCurrency.symbol}</span>
              </>
            )}
          </div>
        </button>
      </TooltipTrigger>
      <TooltipContent>
        <p>Click to view in ETH or USD</p>
      </TooltipContent>
    </Tooltip>
  );
};

export default EthUsDToggle;
