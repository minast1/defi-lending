import { useEffect, useState } from "react";
import { useTargetNetwork } from "./scaffold-eth";
import { Capabilities } from "viem";
import { useAccount, useWalletClient } from "wagmi";

export const useGetWalletCapabilities = () => {
  const { address, isConnected } = useAccount();
  const { targetNetwork } = useTargetNetwork();
  const { data: walletClient, isFetching } = useWalletClient({
    account: address,
    chainId: targetNetwork.id,
  });
  // console.log(walletClient.data?.getCapabilities({ chainId: targetNetwork.id }));
  const [capabilities, setCapabilities] = useState<Capabilities>();

  useEffect(() => {
    if (!isConnected || !address || !walletClient) return;
    const loadCapabilities = async () => {
      const capa = await walletClient?.getCapabilities({ chainId: targetNetwork.id, account: address });
      setCapabilities(capa);
    };
    loadCapabilities();
  }, [address, targetNetwork, isConnected, walletClient]);

  //console.log(currentCapability);
  const isReady = capabilities?.atomic.status == "ready";
  const isSupported = capabilities?.atomic.status == "supported";

  return {
    capabilities,
    isFetching,
    isReady,
    isSupported,
    walletClient,
    supportsAtomicActions: isReady || isSupported,
  };
};
