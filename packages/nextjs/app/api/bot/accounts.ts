import { Account, mnemonicToAccount } from "viem/accounts";

const NUM_ACCOUNTS = 5;

const mnemonic = "legal winner thank year wave sausage worth useful legal winner thank yellow";

export const botAccounts: Account[] = Array.from({ length: NUM_ACCOUNTS }).map((_, index) =>
  mnemonicToAccount(mnemonic, {
    addressIndex: index,
  }),
);
