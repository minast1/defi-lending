"use client";

import type { NextPage } from "next";
import BorrowRepay from "~~/components/borrow-repay";
import CollateralCard from "~~/components/collateral-card";
import CollateralVizCard from "~~/components/collateral-viz-card";
import DaiBalanceCard from "~~/components/dai-balance-card";
import DepositWithdraw from "~~/components/deposit-and-withdraw";
import HealthFactorCard from "~~/components/health-factor-card";
import LiquidationMonitor from "~~/components/liquidation-monitor";
import TVLCard from "~~/components/tvl-card";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";

//import { BugAntIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
//import { useTargetNetwork } from "~~/hooks/scaffold-eth";

const Home: NextPage = () => {
  const { data: tvl } = useScaffoldReadContract({
    contractName: "Lending",
    functionName: "getTVLInETH",
  });

  return (
    <>
      <div className="container mx-auto px-4 py-8 space-y-10">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in">
          <TVLCard currentTvl={tvl} />
          <DaiBalanceCard />
          <CollateralCard />
          <HealthFactorCard />
        </div>
        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Deposit & Withdraw */}

          <DepositWithdraw />

          <div className="md:col-span-2">
            <LiquidationMonitor />
          </div>
          <BorrowRepay />
          <div className="md:col-span-2">
            <CollateralVizCard />
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
