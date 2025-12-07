import { Badge } from "./ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { AlertTriangle } from "lucide-react";

const liquidatablePositions = [
  {
    user: "0x742d...3f8c",
    collateral: "$12,450",
    debt: "$11,200",
    healthFactor: 1.11,
    threshold: "1.0",
  },
  {
    user: "0x8a3e...9b2d",
    collateral: "$8,320",
    debt: "$7,850",
    healthFactor: 1.06,
    threshold: "1.0",
  },
  {
    user: "0x5f1c...4e7a",
    collateral: "$15,680",
    debt: "$14,200",
    healthFactor: 1.1,
    threshold: "1.0",
  },
  {
    user: "0x9d2a...6c1b",
    collateral: "$6,540",
    debt: "$6,100",
    healthFactor: 1.07,
    threshold: "1.0",
  },
];

const LiquidationMonitor = () => {
  return (
    <Card className="border-border bg-card animate-fade-in">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-destructive" />
          Liquidation Monitor
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-lg border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>User</TableHead>
                <TableHead>Collateral</TableHead>
                <TableHead>Debt</TableHead>
                <TableHead>Health Factor</TableHead>
                <TableHead className="text-right">Threshold</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {liquidatablePositions.map((position, index) => (
                <TableRow key={index} className="hover:bg-muted/30">
                  <TableCell className="font-mono text-sm">{position.user}</TableCell>
                  <TableCell className="text-primary font-medium">{position.collateral}</TableCell>
                  <TableCell className="text-warning font-medium">{position.debt}</TableCell>
                  <TableCell>
                    <Badge variant={position.healthFactor < 1.08 ? "destructive" : "outline"} className="font-mono">
                      {position.healthFactor.toFixed(2)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">{position.threshold}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default LiquidationMonitor;
