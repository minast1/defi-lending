"use client";

import React, { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { SwitchTheme } from "./SwitchTheme";
import TestnetFaucetButton from "./testnet-faucet";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "./ui/sheet";
import { Globe, Menu, SquareArrowLeft } from "lucide-react";
//import Image from "next/image";
//import Link from "next/link";
//import { usePathname } from "next/navigation";
import { hardhat } from "viem/chains";
import { useDisconnect } from "wagmi";
//import { Bars3Icon, BugAntIcon } from "@heroicons/react/24/outline";
import { FaucetButton, RainbowKitCustomConnectButton } from "~~/components/scaffold-eth";
import { Button } from "~~/components/ui/button";
import { useOutsideClick, useTargetNetwork } from "~~/hooks/scaffold-eth";
import useMedia from "~~/hooks/use-media";

export const Header = () => {
  const { targetNetwork } = useTargetNetwork();
  const router = useRouter();
  const { disconnect } = useDisconnect();
  const [open, setOpen] = useState(false);
  const isLocalNetwork = targetNetwork.id === hardhat.id;
  const { isMobile } = useMedia();
  const burgerMenuRef = useRef<HTMLDetailsElement>(null);
  useOutsideClick(burgerMenuRef, () => {
    burgerMenuRef?.current?.removeAttribute("open");
  });

  const handleDisconnect = () => {
    disconnect();
  };

  return (
    <header className="border-b border-border backdrop-blur-sm bg-background/80 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3 hover:cursor-pointer" onClick={() => router.push("/")}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center font-bold text-primary-foreground">
            L
          </div>
          <h1 className="hidden md:block text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Lamma
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <RainbowKitCustomConnectButton />
          {isLocalNetwork && !isMobile && <FaucetButton />}
          {isMobile ? null : <SwitchTheme />}
          {/* Mobile menu */}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <button className="md:hidden rounded-md p-2 text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors">
                <Menu className="h-5 w-5" />
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="w-64" showCloseButton={false}>
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center font-bold text-primary-foreground">
                    L
                  </div>
                  <span className="text-lg font-semibold">Lamma</span>
                </SheetTitle>
              </SheetHeader>
              <nav className="mt-6 flex flex-col gap-3 px-6">
                <div className="flex items-center gap-2 px-3 py-1 w-fit rounded-lg bg-success/10 border border-success/30 mb-5">
                  <Globe className="h-3 w-3 text-success" />
                  <span className="text-xs font-medium text-success">{targetNetwork.name}</span>
                </div>
                <SwitchTheme />
                <TestnetFaucetButton />
                <Button onClick={handleDisconnect}>
                  <SquareArrowLeft className="h-6 w-4 mr-2 sm:ml-0" />
                  Disconnect{" "}
                </Button>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};
