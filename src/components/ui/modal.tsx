"use client";

import { ReactNode, useEffect } from "react";
import { clsx } from "clsx";
import { X } from "lucide-react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
}

export function Modal({ isOpen, onClose, title, children, size = "md" }: ModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      {/* Modal */}
      <div
        className={clsx(
          "relative z-10 w-full bg-background/80 backdrop-blur-xl border border-border/50 rounded-[2rem] shadow-2xl animate-in zoom-in-95 duration-300",
          "max-h-[90vh] overflow-y-auto scrollbar-thin scrollbar-thumb-primary/10 scrollbar-track-transparent",
          {
            "max-w-sm": size === "sm",
            "max-w-lg": size === "md",
            "max-w-2xl": size === "lg",
            "max-w-4xl": size === "xl",
          }
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        {title && (
          <div className="flex items-center justify-between border-b border-border/50 p-6">
            <h2 className="text-xl font-semibold bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-transparent">{title}</h2>
            <button
              onClick={onClose}
              className="rounded-full p-2 hover:bg-muted/50 transition-colors"
            >
              <X className="h-5 w-5 text-muted-foreground hover:text-foreground" />
            </button>
          </div>
        )}

        {/* Content */}
        <div className={clsx(title ? "p-6" : "p-6")}>{children}</div>
      </div>
    </div>
  );
}