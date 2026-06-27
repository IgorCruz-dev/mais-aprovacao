import { twMerge } from "tailwind-merge";
import * as React from "react";

export function Toast({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      role="status"
      className={twMerge("rounded-md border bg-background px-4 py-3 text-sm shadow-sm", className)}
      {...props}
    />
  );
}
