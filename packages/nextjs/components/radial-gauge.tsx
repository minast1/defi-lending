"use client";

import { ForwardRefExoticComponent, RefAttributes } from "react";
import { LucideProps } from "lucide-react";

interface RadialGaugeProps {
  ratio: number | string; // health factor ratio → example: 1.35 (135%)
  threshold: number; // liquidation threshold → example: 1.2 (120%)
  status: {
    color: string;
    text: string;
    icon: ForwardRefExoticComponent<Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>>;
  };
}

const radius = 70;
const strokeWidth = 12;
const circumference = 2 * Math.PI * radius;
const SAFE_CR = 200;
export function RadialGauge({ ratio, threshold, status }: RadialGaugeProps) {
  // No-debt case → display SAFE (∞)
  const getArcColor = () => {
    if (Number(ratio) < threshold) return "#F04438";
    if (Number(ratio) < SAFE_CR) return "#FDB022";
    return "#17B26A";
  };

  // Map CR to arc (0% to 300%+ maps to 0 to full arc)
  const maxDisplayCR = 300;
  const normalizedCR = Math.min(Number(ratio) || 0, maxDisplayCR);

  return (
    <>
      <div className="flex justify-center">
        <div className="relative w-58 h-40">
          <svg viewBox="0 0 200 159" className="w-full h-full">
            {/* Background arc */}
            <path
              d="M 20 140 A 70 70 0 1 1 180 140"
              fill="none"
              stroke="#E9EFF5"
              strokeWidth={strokeWidth}
              strokeLinecap="round"
            />

            {/* Danger zone (0-120%) */}
            <path
              d="M 20 140 A 70 70 0 0 1 53 50"
              fill="none"
              stroke="#F044384C"
              strokeWidth={strokeWidth}
              strokeLinecap="round"
            />

            {/* Warning zone (120-200%) */}
            <path d="M 53 50 A 70 70 0 0 1 147 50" fill="none" stroke="#FDB0224C" strokeWidth={strokeWidth} />

            {/* Safe zone (200%+) */}
            <path
              d="M 147 50 A 70 70 0 0 1 180 140"
              fill="none"
              stroke="#17B26A4C"
              strokeWidth={strokeWidth}
              strokeLinecap="round"
            />

            {/* Active progress arc */}
            <path
              d="M 20 140 A 70 70 0 1 1 180 140"
              fill="none"
              stroke={getArcColor()}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeDasharray={circumference * 0.75}
              strokeDashoffset={circumference * 0.75 * (1 - Math.min(normalizedCR / maxDisplayCR, 1))}
              className="transition-all duration-500"
              style={{ filter: `drop-shadow(0 0 6px ${getArcColor()})` }}
            />

            {/* Zone labels */}
            <text x="25" y="155" className="fill-destructive text-[8px] font-medium">
              0%
            </text>
            <text x="40" y="42" className="fill-warning text-[8px] font-medium">
              {threshold}%
            </text>
            <text x="145" y="42" className="fill-success text-[8px] font-medium">
              {SAFE_CR}%
            </text>
            <text x="170" y="155" className="fill-success text-[8px] font-medium">
              300%
            </text>

            {/* Center display */}
            {/* <text
              x="100"
              y="95"
              textAnchor="middle"
             
            >
              {ratio == "N/A" ? "∞" : Number(ratio).toFixed(0)}%
            </text> */}
            <text
              x="100"
              y="115"
              textAnchor="middle"
              className={`fill-${status.color} text-2xl font-bold`}
              style={{ fill: getArcColor() }}
            >
              {ratio == "N/A" ? "∞" : Number(ratio).toFixed(0)}%
            </text>
          </svg>
        </div>
      </div>

      {/* Legend */}
      <div className="flex justify-center gap-4 text-xs">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-destructive" />
          <span className="text-muted-foreground">&lt;{threshold}% Liquidatable</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-warning" />
          <span className="text-muted-foreground">
            {threshold}-{SAFE_CR}% At Risk
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-success" />
          <span className="text-muted-foreground">&gt;{SAFE_CR}% Safe</span>
        </div>
      </div>
    </>
  );
}
