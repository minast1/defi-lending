"use client";

//import Link from "next/link";
//import { Address } from "@scaffold-ui/components";
import type { NextPage } from "next";
import DaiBalanceCard from "~~/components/dai-balance-card";
import DepositWithdraw from "~~/components/deposit-and-withdraw";
import HealthFactorCard from "~~/components/health-factor-card";
import LiquidationMonitor from "~~/components/liquidation-monitor";
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
      <div className="container mx-auto px-4 py-8 space-y-10">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in">
          <TVLCard />
          <DaiBalanceCard />
          <PriceCard />
          <HealthFactorCard />
        </div>
        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Deposit & Withdraw */}

          <DepositWithdraw />

          <div className="md:col-span-2">
            <LiquidationMonitor />
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
