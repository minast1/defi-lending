"use client";

//import Link from "next/link";
//import { Address } from "@scaffold-ui/components";
import type { NextPage } from "next";
//import { hardhat } from "viem/chains";
//import { useAccount } from "wagmi";
import StatsOverview from "~~/components/stats-overview";

//import { BugAntIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
//import { useTargetNetwork } from "~~/hooks/scaffold-eth";

const Home: NextPage = () => {
  // const { address: connectedAddress } = useAccount();
  //const { targetNetwork } = useTargetNetwork();

  return (
    <>
      <div className="container mx-auto px-4 py-8 space-y-8">
        <StatsOverview />
      </div>
    </>
  );
};

export default Home;
