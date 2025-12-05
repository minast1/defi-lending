import React from "react";
import { Card, CardContent } from "./ui/card";
import { Activity } from "lucide-react";

const HealthFactorCard = () => {
  return (
    <Card
      className="relative overflow-hidden border-border bg-card hover:border-primary/50 transition-all duration-300 group"
      style={{ animationDelay: `${0 * 100}ms` }}
    >
      <CardContent className="px-4">
        <div className="flex items-start justify-between">
          <div className="p-3 rounded-xl bg-card border border-border group-hover:glow-cyan transition-all text-primary">
            <Activity className="h-5 w-5" />
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
        <p className="text-sm text-muted-foreground mb-1">Health Factor</p>
        <p className="text-2xl font-bold text-foreground">2.45</p>
      </CardContent>
    </Card>
  );
};

export default HealthFactorCard;
