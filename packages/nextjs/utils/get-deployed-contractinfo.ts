import { PublicClient } from "viem";
import { ContractCodeStatus, DeployedContractResult } from "~~/types/deployed-contract-result";

export async function getDeployedContractInfo<TContract extends { address: `0x${string}` }>(params: {
  publicClient: PublicClient;
  chainId: number;
  contractName: string;
  contracts: Record<number, Record<string, TContract>>;
}): Promise<DeployedContractResult<TContract>> {
  const { publicClient, chainId, contractName, contracts } = params;

  const deployedContract = contracts?.[chainId]?.[contractName];

  if (!deployedContract) {
    return { status: ContractCodeStatus.NOT_FOUND };
  }

  try {
    const bytecode = await publicClient.getBytecode({
      address: deployedContract.address,
    });

    if (!bytecode || bytecode === "0x") {
      return { status: ContractCodeStatus.NOT_FOUND };
    }

    return {
      status: ContractCodeStatus.DEPLOYED,
      contract: deployedContract,
    };
  } catch (err) {
    console.error("Contract check failed:", err);
    return { status: ContractCodeStatus.NOT_FOUND };
  }
}
