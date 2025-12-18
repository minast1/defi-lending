import deployedContracts from "~~/contracts/deployedContracts";
import scaffoldConfig from "~~/scaffold.config";

const { targetNetworks } = scaffoldConfig;

const contracts = {
  Lending: deployedContracts[targetNetworks[0].id].Lending,
  Dai: deployedContracts[targetNetworks[0].id].Dai,
  DEX: deployedContracts[targetNetworks[0].id].DEX,
  MovePrice: deployedContracts[targetNetworks[0].id].MovePrice,
};

export default contracts;
