import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Skeleton } from "./ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import UserPosition from "./user-position";
import { AlertTriangle, Users } from "lucide-react";
import { useAccount } from "wagmi";
import { useDeployedContractInfo, useScaffoldReadContract } from "~~/hooks/scaffold-eth";
import useLiquidationHistory from "~~/hooks/use-liquidation-history";

const LiquidationMonitor = () => {
  const { address: connectedAddress } = useAccount();
  const { data: contract } = useDeployedContractInfo({ contractName: "Lending" });

  const { events, isLoading, totalLiquidations } = useLiquidationHistory(contract?.address, contract?.abi);

  const { data: ethPrice } = useScaffoldReadContract({
    contractName: "DEX",
    functionName: "currentPrice",
  });

  const LoadingSkeleton = () => (
    <>
      {[...Array(4)].map((_, i) => (
        <TableRow key={i}>
          <TableCell>
            <Skeleton className="h-4 w-24" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-16" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-16" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-6 w-12" />
          </TableCell>
          <TableCell className="text-right">
            <Skeleton className="h-4 w-8 ml-auto" />
          </TableCell>
        </TableRow>
      ))}
    </>
  );

  const EmptyState = () => (
    <TableRow>
      <TableCell colSpan={5} className="h-32">
        <div className="flex flex-col items-center justify-center text-muted-foreground">
          <Users className="h-10 w-10 mb-2 opacity-50" />
          <p className="text-sm font-medium">No positions at risk</p>
          <p className="text-xs">All users have healthy collateralization ratios</p>
        </div>
      </TableCell>
    </TableRow>
  );

  return (
    <Card className="border-border bg-card animate-fade-in h-[410px] overflow-y-scroll">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-destructive" />
          Liquidation Monitor
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative max-h-[300px] rounded-lg border border-border overflow-y-auto">
          <Table>
            <TableHeader className="sticky top-0 z-10">
              <TableRow className="bg-muted/50">
                <TableHead>User</TableHead>
                <TableHead>Collateral</TableHead>
                <TableHead>Debt</TableHead>
                <TableHead>HF</TableHead>
                <TableHead className="text-left"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading || events === undefined ? (
                <LoadingSkeleton />
              ) : totalLiquidations === 0 ? (
                <EmptyState />
              ) : (
                events.map((position, index) => (
                  <UserPosition
                    key={index}
                    user={position}
                    ethPrice={Number(ethPrice || 0n)}
                    connectedAddress={connectedAddress || ""}
                    idx={index + 1}
                  />
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default LiquidationMonitor;
