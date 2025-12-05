import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Card, CardContent } from "./ui/card";

const PriceCard = () => {
  return (
    <Card
      className="relative overflow-hidden border-border bg-card hover:border-primary/50 transition-all duration-300 group"
      style={{ animationDelay: `${0 * 100}ms` }}
    >
      <CardContent className="px-4">
        <div className="flex items-start justify-between">
          <div className="p-3 rounded-xl bg-card border border-border group-hover:glow-cyan transition-all text-primary">
            <Avatar className="w-5 h-5">
              <AvatarImage src="https://assets.coingecko.com/coins/images/9956/small/4943.png" alt="Dai" />
              <AvatarFallback>Dai</AvatarFallback>
            </Avatar>
          </div>
          {/* <span
                          className={`text-xs font-medium px-2 py-1 rounded-full ${
                            stat.change.startsWith("+")
                              ? "bg-success/10 text-success"
                              : stat.change.startsWith("-")
                                ? "bg-destructive/10 text-destructive"
                                : "bg-success/10 text-success"
                          }`}
                        >
                          {stat.change}
                        </span> */}
        </div>
        <p className="text-sm text-muted-foreground mb-1">Current Price of Dai</p>
        <p className="text-2xl font-bold text-foreground">$42.5M</p>
      </CardContent>
    </Card>
  );
};

export default PriceCard;
