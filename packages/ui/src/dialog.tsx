import { twMerge } from "tailwind-merge";
import * as React from "react";

export function Dialog({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div role="dialog" className={twMerge("rounded-md border bg-background", className)} {...props} />;
}

export function DialogHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={twMerge("border-b p-4", className)} {...props} />;
}

export function DialogContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={twMerge("p-4", className)} {...props} />;
}
