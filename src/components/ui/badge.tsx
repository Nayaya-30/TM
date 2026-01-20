import { HTMLAttributes } from "react";
import { clsx } from "clsx";

interface BadgeProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "destructive" | "outline" | "success" | "warning" | "danger" | "info";
}

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <div
      className={clsx(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border border-transparent backdrop-blur-sm",
        {
          "bg-primary/10 text-primary hover:bg-primary/20 border-primary/20": variant === "default",
          "bg-secondary text-secondary-foreground hover:bg-secondary/80": variant === "secondary",
          "bg-destructive/10 text-destructive hover:bg-destructive/20 border-destructive/20": variant === "destructive" || variant === "danger",
          "text-foreground border-border hover:bg-accent hover:text-accent-foreground": variant === "outline",
          
          // Legacy/Color variants
          "bg-green-500/15 text-green-600 dark:text-green-400 border-green-500/20 hover:bg-green-500/25": variant === "success",
          "bg-yellow-500/15 text-yellow-600 dark:text-yellow-400 border-yellow-500/20 hover:bg-yellow-500/25": variant === "warning",
          "bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/20 hover:bg-blue-500/25": variant === "info",
        },
        className
      )}
      {...props}
    />
  );
}