import { twMerge } from "tailwind-merge";
import * as React from "react";

export function Tabs({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={twMerge("w-full", className)} {...props} />;
}

export function TabsList({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={twMerge("inline-flex items-center gap-1", className)} {...props} />;
}

export function TabsPanel({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={twMerge("mt-4", className)} {...props} />;
}
