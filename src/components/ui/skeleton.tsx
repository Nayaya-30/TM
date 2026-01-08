import { HTMLAttributes } from "react";
import { clsx } from "clsx";

export function Skeleton({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={clsx("skeleton rounded-lg", className)}
      {...props}
    />
  );
}