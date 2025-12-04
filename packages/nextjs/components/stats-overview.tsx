import { Card, CardContent } from "./ui/card";
import { Activity, CreditCard, TrendingUp, Wallet } from "lucide-react";

const stats = [
  {
    title: "Total Value Locked",
    value: "$42.5M",
    change: "+12.5%",
    icon: TrendingUp,
    color: "text-primary",
  },
  {
    title: "Your Dai Balance",
    value: "$15,420",
    change: "+8.2%",
    icon: Wallet,
    color: "text-success",
  },
  {
    title: "Total Borrowed Dai",
    value: "$8,950",
    change: "-2.1%",
    icon: CreditCard,
    color: "text-warning",
  },
  {
    title: "Health Factor",
    value: "2.45",
    change: "Safe",
    icon: Activity,
    color: "text-success",
  },
];

const StatsOverview = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card
            key={index}
            className="relative overflow-hidden border-border bg-card hover:border-primary/50 transition-all duration-300 group"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <CardContent className="px-4">
              <div className="flex items-start justify-between">
                <div
                  className={`p-3 rounded-xl bg-card border border-border group-hover:glow-cyan transition-all ${stat.color}`}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <span
                  className={`text-xs font-medium px-2 py-1 rounded-full ${
                    stat.change.startsWith("+")
                      ? "bg-success/10 text-success"
                      : stat.change.startsWith("-")
                        ? "bg-destructive/10 text-destructive"
                        : "bg-success/10 text-success"
                  }`}
                >
                  {stat.change}
                </span>
              </div>
              <p className="text-sm text-muted-foreground mb-1">{stat.title}</p>
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default StatsOverview;
