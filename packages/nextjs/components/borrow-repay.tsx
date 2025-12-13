import BorrowTab from "./tabs/borrow-tab";
import RepayTab from "./tabs/repay-tab";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Tabs, TabsList, TabsTrigger } from "./ui/tabs";

const BorrowRepay = () => {
  return (
    <Card className="border-border bg-card animate-fade-in gap-3 max-h-[290px]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span className="text-warning">●</span>
          Borrow & Repay
          <Avatar>
            <AvatarImage src="https://assets.coingecko.com/coins/images/9956/small/4943.png" alt="Dai" />
            <AvatarFallback>Dai</AvatarFallback>
          </Avatar>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="borrow" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-3">
            <TabsTrigger value="borrow">Borrow</TabsTrigger>
            <TabsTrigger value="repay">Repay</TabsTrigger>
          </TabsList>

          <BorrowTab />

          <RepayTab />
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default BorrowRepay;
