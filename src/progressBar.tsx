import React from "react";
import { cn } from "./lib/utils";

interface CustomProgressBarProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number;
  max?: number;
}

export const CustomProgressBar: React.FC<CustomProgressBarProps> = ({
  value,
  max = 100,
  className,
  ...props
}) => {
  const percent = Math.min(Math.max((Math.abs(value) / max) * 100, 0), 100);
  const isNegative = value < 0;

  return (
    <div
      className={cn(
        "relative p-2 w-full h-4 bg-gray-200 overflow-hidden border-gray-300 border-2",
        className
      )}
      {...props}
    >
      <div className="absolute top-0 bottom-0 w-1/2 left-1/2 " />
      <div
        className={cn(
          "absolute top-0 bottom-0",
          isNegative ? "right-1/2 bg-blue-400" : "left-1/2 bg-red-400"
        )}
        style={{
          width: `${percent / 2}%`,
        }}
      />
    </div>
  );
};

export default CustomProgressBar;
