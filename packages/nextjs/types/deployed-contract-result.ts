export enum ContractCodeStatus {
  LOADING = "LOADING",
  DEPLOYED = "DEPLOYED",
  NOT_FOUND = "NOT_FOUND",
}

export type DeployedContractResult<T> = {
  status: ContractCodeStatus;
  contract?: T;
};
