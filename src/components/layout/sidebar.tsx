"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";
import {
  LayoutDashboard,
  Package,
  Users,
  ClipboardList,
  Boxes,
  Palette,
  BarChart3,
  Settings,
  ListChecks,
  UserCircle,
} from "lucide-react";
import { ReactNode } from "react";

interface NavItem {
  href: string;
  icon: ReactNode;
  label: string;
  roles?: string[];
}

interface SidebarProps {
  userRole: "admin" | "manager" | "worker" | "customer";
  accentColor?: string;
}

export function Sidebar({ userRole, accentColor = "#3b82f6" }: SidebarProps) {
  const pathname = usePathname();

  const navItems: NavItem[] = [
    // Customer
    { href: "/dashboard", icon: <LayoutDashboard />, label: "Dashboard", roles: ["customer"] },
    { href: "/orders", icon: <Package />, label: "Orders", roles: ["customer"] },
    { href: "/dependants", icon: <Users />, label: "Dependants", roles: ["customer"] },
    { href: "/profile", icon: <UserCircle />, label: "Profile", roles: ["customer"] },

    // Worker
    { href: "/worker/dashboard", icon: <LayoutDashboard />, label: "Dashboard", roles: ["worker"] },
    { href: "/worker/tasks", icon: <ListChecks />, label: "Tasks", roles: ["worker"] },
    { href: "/worker/profile", icon: <UserCircle />, label: "Profile", roles: ["worker"] },

    // Manager
    { href: "/manager/dashboard", icon: <LayoutDashboard />, label: "Dashboard", roles: ["manager"] },
    { href: "/manager/orders", icon: <Package />, label: "Orders", roles: ["manager"] },
    { href: "/manager/workers", icon: <Users />, label: "Workers", roles: ["manager"] },

    // Admin
    { href: "/admin/dashboard", icon: <LayoutDashboard />, label: "Dashboard", roles: ["admin"] },
    { href: "/admin/materials", icon: <Boxes />, label: "Materials", roles: ["admin"] },
    { href: "/admin/fabrics", icon: <Palette />, label: "Fabrics", roles: ["admin"] },
    { href: "/admin/analytics", icon: <BarChart3 />, label: "Analytics", roles: ["admin"] },
    { href: "/admin/settings", icon: <Settings />, label: "Settings", roles: ["admin"] },
  ];

  const filteredItems = navItems.filter((item) => !item.roles || item.roles.includes(userRole));

  return (
    <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:border-r lg:border-border lg:bg-card">
      <div className="flex-1 overflow-y-auto p-4 space-y-1">
        {filteredItems.map((item) => {
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                "flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all",
                "hover:bg-accent",
                isActive && "bg-accent shadow-sm"
              )}
              style={
                isActive
                  ? {
                      backgroundColor: `${accentColor}15`,
                      color: accentColor,
                    }
                  : undefined
              }
            >
              <span className="h-5 w-5">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </div>
    </aside>
  );
}