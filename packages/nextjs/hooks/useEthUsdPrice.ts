"use client";

import { useTargetNetwork } from "./scaffold-eth";
import { useQuery } from "@tanstack/react-query";
import scaffoldConfig from "~~/scaffold.config";

const { alchemyApiKey } = scaffoldConfig;
export const useEthUsdPrice = () => {
  const { targetNetwork } = useTargetNetwork();
  return useQuery({
    queryKey: ["eth-usd-price", targetNetwork.name],
    queryFn: async () => {
      const response = await fetch(`https://api.g.alchemy.com/prices/v1/${alchemyApiKey}/tokens/by-symbol?symbols=ETH`);
      const data = await response.json();
      const usdPrice = targetNetwork.id === 31337 ? "3092.2708585203" : data.at(0).prices[0].value;
      console.log(usdPrice);
      if (!usdPrice) throw new Error("Price not found");

      return usdPrice;
    },
    refetchInterval: 60 * 1000, //every minute
  });
};
