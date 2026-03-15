import { useQuery } from "@tanstack/react-query";
import { Abi, parseAbiItem } from "viem";
import { usePublicClient, useWatchContractEvent } from "wagmi";

const CollateralAddedAbi = parseAbiItem(
  `event CollateralAdded(address indexed user,uint256 indexed amount,uint256 price)`,
);
const useLiquidationHistory = (contractAddress: `0x${string}` | undefined, contractAbi: Abi | undefined) => {
  const publicClient = usePublicClient();
  const isReady = !!publicClient && !!contractAddress && !!contractAbi;

  const {
    data: events,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["liquidationHistory"],
    enabled: isReady,
    queryFn: async () => {
      const logs = await publicClient!.getLogs({
        address: contractAddress as `0x${string}`,
        fromBlock: BigInt(process.env.NEXT_PUBLIC_DEPLOYMENT_BLOCK || 0),
        event: CollateralAddedAbi,
      });

      // De-duplication Logic: Only keep the latest event per user
      const uniqueUsersMap = new Map();

      // Process logs from newest to oldest
      [...logs].reverse().forEach(log => {
        const userAddress = log.args.user;
        if (!uniqueUsersMap.has(userAddress)) {
          uniqueUsersMap.set(userAddress, {
            ...log.args,
            blockNumber: log.blockNumber,
            transactionHash: log.transactionHash,
          });
        }
      });

      return Array.from(uniqueUsersMap.values());
    },
    staleTime: Infinity,
  });

  useWatchContractEvent({
    address: contractAddress,
    abi: contractAbi,
    fromBlock: BigInt(0),
    onLogs: () => {
      console.log("New Liquidation detected! Refetching history...");
      refetch();
    },
  });

  return { events, isLoading: isLoading, totalLiquidations: events?.length || 0 };
};

export default useLiquidationHistory;
