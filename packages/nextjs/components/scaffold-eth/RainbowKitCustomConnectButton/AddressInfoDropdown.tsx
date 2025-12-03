import { useState } from "react";
import { useRouter } from "next/navigation";
import { AddressQRCodeModal } from "./AddressQRCodeModal";
import { NetworkOptions } from "./NetworkOptions";
import { useWatchBalance } from "@scaffold-ui/hooks";
import { ChevronDown, SquareArrowLeft, Wallet } from "lucide-react";
import { getAddress } from "viem";
import { Address } from "viem";
import { hardhat, sepolia } from "viem/chains";
import { useDisconnect } from "wagmi";
import {
  ArrowTopRightOnSquareIcon,
  ArrowsRightLeftIcon,
  CheckCircleIcon,
  DocumentDuplicateIcon, // EyeIcon,
  QrCodeIcon,
} from "@heroicons/react/24/outline";
//import { BlockieAvatar } from "~~/components/scaffold-eth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger, //DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~~/components/ui/dropdown-menu";
import { useCopyToClipboard, useTargetNetwork } from "~~/hooks/scaffold-eth";
import { getTargetNetworks } from "~~/utils/scaffold-eth";
//import { getTargetNetworks } from "~~/utils/scaffold-eth";
import { isENS } from "~~/utils/scaffold-eth/common";

//const BURNER_WALLET_ID = "burnerWallet";

const allowedNetworks = getTargetNetworks();

type AddressInfoDropdownProps = {
  address: Address;
  blockExplorerAddressLink: string | undefined;
  displayName: string;
  ensAvatar?: string;
};

export const AddressInfoDropdown = ({ address, displayName, blockExplorerAddressLink }: AddressInfoDropdownProps) => {
  const { disconnect } = useDisconnect();
  const [showQrCodeModal, setShowQrCodeModal] = useState(false);
  const checkSumAddress = getAddress(address);
  const { targetNetwork } = useTargetNetwork();
  const router = useRouter();
  const { copyToClipboard: copyAddressToClipboard, isCopiedToClipboard: isAddressCopiedToClipboard } =
    useCopyToClipboard();
  const [selectingNetwork] = useState(false);
  const { data: balance } = useWatchBalance({ address, chain: targetNetwork.id === 31337 ? hardhat : sepolia });

  const handleDisconnect = () => {
    disconnect();
    //setIsConnected(false);
    localStorage.removeItem("isWalletConnected");

    router.push("/");
  };

  return (
    <>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/30 hover:bg-primary/20 transition-colors cursor-pointer">
            <Wallet className="h-4 w-4 text-primary" />
            <span className="text-sm font-mono text-primary">
              {isENS(displayName) ? displayName : checkSumAddress?.slice(0, 6) + "..." + checkSumAddress?.slice(-4)}
            </span>
            <span className="text-sm font-bold text-primary border-l border-primary/30 pl-2">{balance?.value} ETH</span>
            <ChevronDown className="h-3 w-3 text-primary/70" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="shadow-xl" onCloseAutoFocus={e => e.preventDefault()}>
          <DropdownMenuItem
            onSelect={e => {
              e.preventDefault();
              copyAddressToClipboard(checkSumAddress);
            }}
            className={selectingNetwork ? "hidden" : ""}
          >
            {isAddressCopiedToClipboard ? (
              <>
                <CheckCircleIcon className="text-xl font-normal h-6 w-4 ml-2 sm:ml-0" aria-hidden="true" />
                <span className="whitespace-nowrap">Copied!</span>
              </>
            ) : (
              <>
                <DocumentDuplicateIcon className="text-xl font-normal h-6 w-4 ml-2 sm:ml-0" aria-hidden="true" />
                <span className="whitespace-nowrap">Copy address</span>
              </>
            )}
          </DropdownMenuItem>
          <DropdownMenuItem>
            <DropdownMenuItem className="w-full hover:bg-transparent" onSelect={() => setShowQrCodeModal(true)}>
              <QrCodeIcon className="h-6 w-4 sm:ml-0" />
              View QR Code
            </DropdownMenuItem>
          </DropdownMenuItem>
          <DropdownMenuItem className={selectingNetwork ? "hidden" : ""}>
            <ArrowTopRightOnSquareIcon className="h-6 w-4 ml-2 sm:ml-0" />
            <a target="_blank" href={blockExplorerAddressLink} rel="noopener noreferrer" className="whitespace-nowrap">
              View on Block Explorer
            </a>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          {allowedNetworks.length > 1 ? (
            <DropdownMenuGroup>
              <DropdownMenuSub>
                <DropdownMenuSubTrigger
                  className="text-sm"
                  // onSelect={() => {
                  //   setSelectingNetwork(true);
                  // }}
                >
                  <ArrowsRightLeftIcon className="h-6 w-4 ml-2 sm:ml-0" />
                  Switch Network
                </DropdownMenuSubTrigger>
                <DropdownMenuPortal>
                  <DropdownMenuSubContent className="mr-2">
                    <NetworkOptions />
                  </DropdownMenuSubContent>
                </DropdownMenuPortal>
              </DropdownMenuSub>
            </DropdownMenuGroup>
          ) : null}

          <DropdownMenuItem onSelect={handleDisconnect} className={selectingNetwork ? "hidden" : ""}>
            <SquareArrowLeft className="h-6 w-4 ml-2 sm:ml-0" /> Disconnect
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <AddressQRCodeModal address={address} onOpenChange={setShowQrCodeModal} open={showQrCodeModal} />
    </>
  );
};
