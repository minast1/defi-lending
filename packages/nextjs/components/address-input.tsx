import React, { useCallback, useEffect, useState } from "react";
import clsx from "clsx";
//import { blo } from "blo";
import { Loader2, User } from "lucide-react";
//import { useDebounceValue } from "usehooks-ts";
import { isAddress } from "viem";
import { normalize } from "viem/ens";
import { useEnsAddress, useEnsAvatar, useEnsName } from "wagmi";
//import { isENS } from "~~/components/scaffold-eth";
import { Avatar, AvatarFallback, AvatarImage } from "~~/components/ui/avatar";
//import { Input } from "~~/components/ui/input";
import { InputGroup, InputGroupAddon, InputGroupInput } from "~~/components/ui/input-group";

/**
 * Address input with ENS name resolution
 */
type AddressInputProps = React.ComponentProps<"input"> & {
  onChange: (value: string) => void;
};

export function AddressInput({
  onChange,
  placeholder,
  disabled,
  value,
  className,
  onBlur,
  ...props
}: AddressInputProps) {
  // Debounce the input to keep clean RPC calls when resolving ENS names
  // If the input is an address, we don't need to debounce it
  const [input, setInput] = useState<string>("");
  const [enteredEnsName, setEnteredEnsName] = useState<string | undefined>();
  const [ensToAddrEnabled, setEnsToAddrEnabled] = useState<boolean>(false);

  const { data: ensAddress, isLoading: isEnsAddressLoading } = useEnsAddress({
    name: ensToAddrEnabled ? input : undefined,
    chainId: 1,
    query: {
      gcTime: 30_000,
      enabled: ensToAddrEnabled,
    },
  });

  const { data: ensName, isLoading: isEnsNameLoading } = useEnsName({
    address: ensToAddrEnabled ? input : undefined,
    chainId: 1,
    query: {
      enabled: ensToAddrEnabled,
      gcTime: 30_000,
    },
  });

  const { data: ensAvatar, isLoading: isEnsAvatarLoading } = useEnsAvatar({
    name: ensName ? normalize(ensName) : undefined,
    chainId: 1,
    query: {
      enabled: Boolean(ensName),
      gcTime: 30_000,
    },
  });

  const handleENSChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const newInput = event.target.value;
      setInput(newInput);
      setEnsToAddrEnabled(newInput.endsWith(".eth") && !isAddress(newInput));
      onChange(newInput);

      if (isAddress(newInput)) {
        setEnteredEnsName(undefined);
        setEnsToAddrEnabled(true);
      } else {
        setEnteredEnsName((newInput as string).endsWith(".eth") ? undefined : newInput);
      }
    },
    [onChange],
  );

  useEffect(() => {
    if (ensAddress) {
      onChange(ensAddress);
      setInput(ensAddress);
      setEnteredEnsName(undefined);
    }
  }, [ensAddress, onChange]);

  useEffect(() => {
    if (ensName) {
      setEnteredEnsName(ensName);
    } else {
      setEnteredEnsName(undefined);
    }
  }, [ensName]);

  return (
    <InputGroup className={className}>
      <InputGroupAddon className={clsx(ensName && "bg-primary/5 rounded-l-md")}>
        {ensName ? (
          <>
            {isEnsAvatarLoading && <Loader2 className="w-8 h-8 animate-spin text-primary/80" />}
            {ensAvatar ? (
              <Avatar className="rounded-full">
                <AvatarImage src={ensAvatar} alt={`${ensAddress} avatar`} />
                <AvatarFallback>
                  <User className="w-4 h-4" />
                </AvatarFallback>
              </Avatar>
            ) : null}
            <span className="text-accent px-2 ">{enteredEnsName ?? ensName}</span>
          </>
        ) : (
          (isEnsNameLoading || isEnsAddressLoading) && (
            // <div className="flex bg-primary-300 rounded-l-full items-center gap-2 pr-2">
            //   <div className="skeleton bg-base-200 w-[35px] h-[35px] rounded-full shrink-0"></div>
            //   <div className="skeleton bg-base-200 h-3 w-20"></div>
            // </div>
            <Loader2 className="w-6 animate-spin text-primary/80" />
          )
        )}
      </InputGroupAddon>
      <InputGroupInput
        placeholder={placeholder}
        value={value}
        onChange={handleENSChange}
        disabled={disabled}
        className={clsx("text-xs text-gray-500 font-normal", ensName && "w-7/8 truncate")}
        onBlur={onBlur}
        {...props}
      />

      {/* <InputGroupAddon align="inline-end">
        {
          // Don't want to use nextJS Image here (and adding remote patterns for the URL)
          // eslint-disable-next-line @next/next/no-img-element
          value && <img alt="" className="rounded-full!" src={blo(value as `0x${string}`)} width="35" height="35" />
        }
      </InputGroupAddon> */}
    </InputGroup>
  );
  //     error={ensAddress === null}

  //     reFocus={reFocus}
  //     prefix={
  //       ensName ? (
  //         <div className="flex bg-base-300 rounded-l-full items-center">
  //           {isEnsAvatarLoading && <div className="skeleton bg-base-200 w-[35px] h-[35px] rounded-full shrink-0"></div>}
  //           {ensAvatar ? (
  //             <span className="w-[35px]">
  //               {
  //                 // eslint-disable-next-line
  //                 <img className="w-full rounded-full" src={ensAvatar} alt={`${ensAddress} avatar`} />
  //               }
  //             </span>
  //           ) : null}
  //           <span className="text-accent px-2">{enteredEnsName ?? ensName}</span>
  //         </div>
  //       ) : (
  //         (isEnsNameLoading || isEnsAddressLoading) && (
  //           <div className="flex bg-base-300 rounded-l-full items-center gap-2 pr-2">
  //             <div className="skeleton bg-base-200 w-[35px] h-[35px] rounded-full shrink-0"></div>
  //             <div className="skeleton bg-base-200 h-3 w-20"></div>
  //           </div>
  //         )
  //       )
  //     }
  //     suffix={
  //       // Don't want to use nextJS Image here (and adding remote patterns for the URL)
  //       // eslint-disable-next-line @next/next/no-img-element
  //       value && <img alt="" className="rounded-full!" src={blo(value as `0x${string}`)} width="35" height="35" />
  //     }
  //   />
  // );
}
