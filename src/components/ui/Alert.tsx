"use client";

import React from "react";
import clsx from "clsx";
import { FaExclamationCircle, FaInfoCircle, FaShieldAlt } from "react-icons/fa";

interface AlertProps {
  variant?: "info" | "security" | "warning";
  title: string;
  description: string;
  className?: string;
}

const Alert: React.FC<AlertProps> = ({
  variant = "info",
  title,
  description,
  className,
}) => {
  const variantStyles = {
    info: "bg-[#EFF6FF] border-[#BFDBFE] text-[#1E40AF]",
    security: "bg-[#F3F4F6] border-[#E5E7EB] text-[#374151]",
    warning: "bg-yellow-100 border-yellow-300 text-yellow-800",
  };

  const icons = {
    info: <FaInfoCircle />,
    security: <FaShieldAlt />,
    warning: <FaExclamationCircle />,
  };

  return (
    <div
      className={clsx(
        "flex p-[17px] border rounded-md shadow-sm gap-3",
        variantStyles[variant],
        className
      )}
    >
      {/* Icon */}
      <div className="shrink-0 mt-1 text-current">{icons[variant]}</div>

      {/* Content */}
      <div className="flex flex-col">
        <h4 className="font-semibold text-sm leading-5">{title}</h4>
        <p className="text-sm mt-1 leading-5">{description}</p>
      </div>
    </div>
  );
};

export default Alert;
