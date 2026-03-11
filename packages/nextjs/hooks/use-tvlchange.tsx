import { useEffect } from "react";
import { useScaffoldContract, useTargetNetwork } from "./scaffold-eth";
import { useBlockNumber, useReadContract } from "wagmi";

const useTvlChange = (currentTvl: bigint | undefined) => {
  //Watch for block changes to keep data fresh
  const { data: blockNumber } = useBlockNumber({ watch: true });
  const { data: contract } = useScaffoldContract({ contractName: "Lending" });
  const { targetNetwork } = useTargetNetwork();

  // Sepolia average: ~7,165 blocks per 24 hours (12s block time)
  const blocksPerDay = targetNetwork.id === 11155111 ? 7165n : targetNetwork.id === 31337 ? 5n : 0n;
  const historicalBlock = blockNumber ? blockNumber - blocksPerDay : undefined;

  // Fetch historical TVL at exactly ~24 hours ago
  const { data: historicalTvl, refetch } = useReadContract({
    address: contract?.address,
    abi: contract?.abi,
    functionName: "getTotalSystemCollateral",
    blockNumber: historicalBlock,
    chainId: targetNetwork.id,
    query: {
      enabled: !!contract && !!historicalBlock,
    },
  });
  // Re-fetch historical data when the block moves forward

  useEffect(() => {
    if (blockNumber) refetch();
  }, [blockNumber, refetch]);

  const current = Number(currentTvl || 0n);
  const previous = Number(historicalTvl || 0n);
  const percentChange = previous > 0 ? ((current - previous) / previous) * 100 : 0;

  return {
    percentChange,
    direction: percentChange > 0 ? "up" : percentChange < 0 ? "down" : "same",
    hasChange: percentChange !== 0 && isFinite(percentChange),
    isLoading: !historicalTvl && !!historicalBlock,
  };
};

export default useTvlChange;
