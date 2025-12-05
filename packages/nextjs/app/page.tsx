"use client";

//import Link from "next/link";
//import { Address } from "@scaffold-ui/components";
import type { NextPage } from "next";
import DaiBalanceCard from "~~/components/dai-balance-card";
import HealthFactorCard from "~~/components/health-factor-card";
import PriceCard from "~~/components/price-card";
//import { hardhat } from "viem/chains";
//import { useAccount } from "wagmi";
import TVLCard from "~~/components/tvl-card";

//import { BugAntIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
//import { useTargetNetwork } from "~~/hooks/scaffold-eth";

const Home: NextPage = () => {
  // const { address: connectedAddress } = useAccount();
  //const { targetNetwork } = useTargetNetwork();

  return (
    <>
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in">
          <TVLCard />
          <DaiBalanceCard />
          <PriceCard />
          <HealthFactorCard />
        </div>
      </div>
    </>
  );
};

export default Home;
