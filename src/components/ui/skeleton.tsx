import { HTMLAttributes } from "react";
import { clsx } from "clsx";

export function Skeleton({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={clsx("skeleton rounded-2xl bg-muted/50", className)}
      {...props}
    />
  );
}