import { botAccounts } from "./accounts";
import { createPublicClient, createWalletClient, fallback, http } from "viem";
//import { privateKeyToAccount } from "viem/accounts";
import scaffoldConfig from "~~/scaffold.config";
import { getAlchemyHttpUrl } from "~~/utils/scaffold-eth";

const { targetNetworks } = scaffoldConfig;

function rpcTransport(chainId: number) {
  const alchemyUrl = getAlchemyHttpUrl(chainId);
  return fallback([http(alchemyUrl), http()]);
}
export const faucetWalletClient = createWalletClient({
  account: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
  chain: targetNetworks[0],
  transport: rpcTransport(targetNetworks[0].id),
});

export const publicClient = createPublicClient({
  chain: targetNetworks[0],
  transport: rpcTransport(targetNetworks[0].id),
});

export const walletClients = botAccounts.map(account =>
  createWalletClient({
    account,
    chain: targetNetworks[0],
    transport: rpcTransport(targetNetworks[0].id),
  }),
);
