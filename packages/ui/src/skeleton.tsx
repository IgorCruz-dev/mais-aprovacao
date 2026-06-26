import { twMerge } from "tailwind-merge";
import * as React from "react";

export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={twMerge("animate-pulse rounded-md bg-muted", className)}
      {...props}
    />
  );
}
