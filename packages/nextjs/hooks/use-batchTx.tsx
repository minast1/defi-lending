import { TxnNotification } from "./scaffold-eth";
import { useGetWalletCapabilities } from "./use-getwallet-capabilities";
import { useMutation } from "@tanstack/react-query";
import { Address } from "viem";
import { useAccount } from "wagmi";
import { notification } from "~~/utils/scaffold-eth";
import { getParsedErrorWithAllAbis } from "~~/utils/scaffold-eth/contract";

interface ActionCalls {
  to: Address;
  value?: bigint;
  data?: `0x${string}`;
}
interface BatchAction {
  calls: ActionCalls[];
}

interface BatchTxResponse {
  id: string;
  chainId: number;
  status: "success" | "pending" | "failure" | undefined;
  // calls: {
  //   to: Address;
  //   value?: bigint;
  //   data: Hex;
  // }[];
}

export function useBatchTx() {
  const { walletClient } = useGetWalletCapabilities();
  const { address } = useAccount();

  const mutation = useMutation<BatchTxResponse, Error, BatchAction>({
    mutationFn: async ({ calls = [] }) => {
      let notificationId = null;
      //let blockExplorerTxURL = "";

      if (!walletClient || !address) {
        throw new Error("Wallet client not connected");
      }

      if (!calls.length) {
        throw new Error("No calls to execute");
      }
      try {
        //notificationId = notification.loading(<TxnNotification message="Awaiting user confirmation.." />);
        //Send atomic batch with EIP-5792
        const { id } = await walletClient.sendCalls({
          account: address,
          calls,
        });

        //notification.remove(notificationId);

        notificationId = notification.loading(<TxnNotification message="Transaction confirmation in progress" />);
        const result = await walletClient.waitForCallsStatus({ id });
        notification.remove(notificationId);

        if (result.status === "success") {
          notification.remove(notificationId);
          notification.success(
            <TxnNotification message={`Batch executed across ${result.receipts?.length} transactions!`} />,
            {
              icon: "🎉",
            },
          );
        }

        if (result.status === "failure" || result.status === undefined) {
          const failureReceipt = result.receipts?.find(r => r.status === "reverted");
          notification.error(
            <TxnNotification
              message={`One or more transactions in the batched reverted.First failure hash: ${failureReceipt?.transactionHash}`}
            />,
            {
              icon: "⚠️",
            },
          );
          throw new Error(result.status);
        }

        return { id, status: result.status, chainId: result.chainId };
      } catch (error: any) {
        if (notificationId) {
          notification.remove(notificationId);
        }
        console.error("⚡️ ~ file: useTransactor.ts ~ error", error);
        const message = getParsedErrorWithAllAbis(error, 1);

        if (message.includes("No matching bundle found")) {
          notification.error(<TxnNotification message={"Transaction was rejected by user.."} />);
        } else {
          notification.error(<TxnNotification message={message} />);
        }

        throw error;
      }
    },
  });

  return {
    executeBatch: mutation.mutate,
    ...mutation,
  };
}
