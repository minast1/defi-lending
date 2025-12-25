import { useMemo, useRef } from "react";
import { useScaffoldEventHistory } from "../hooks/scaffold-eth/useScaffoldEventHistory";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Skeleton } from "./ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import UserPosition from "./user-position";
import { AlertTriangle, Users } from "lucide-react";
import { formatEther } from "viem";
import { useAccount } from "wagmi";
import { useScaffoldReadContract, useScaffoldWatchContractEvent } from "~~/hooks/scaffold-eth";

const LiquidationMonitor = () => {
  const { address: connectedAddress } = useAccount();
  // const [users, setUsers] = useState<string[]>([]);

  const {
    data: events,
    isLoading: isLoading,
    // error: errorReadingEvents,
  } = useScaffoldEventHistory({
    contractName: "Lending",
    eventName: "CollateralAdded",
    watch: true,
    blockData: false,
    transactionData: false,
    receiptData: false,
  });

  const liveLogsRef = useRef<typeof events>([]);

  useScaffoldWatchContractEvent({
    contractName: "Lending",
    eventName: "CollateralAdded",
    onLogs: logs => {
      logs.forEach(log => {
        liveLogsRef.current.push(log);
      });
    },
  });

  /** 4️⃣ Derive users */
  const users = useMemo(() => {
    const set = new Set<string>();

    events?.forEach(event => {
      if (event.args?.user) {
        set.add(event.args.user);
      }
    });

    liveLogsRef.current.forEach(log => {
      if (log?.args?.user) {
        set.add(log.args.user);
      }
    });

    return Array.from(set);
  }, [events]);

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
                <TableHead>Ratio</TableHead>
                <TableHead className="text-left"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading || events === undefined ? (
                <LoadingSkeleton />
              ) : users.length === 0 ? (
                <EmptyState />
              ) : (
                users.map((position, index) => (
                  <UserPosition
                    key={position + index}
                    user={position}
                    ethPrice={Number(formatEther(ethPrice || 0n))}
                    connectedAddress={connectedAddress || ""}
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
