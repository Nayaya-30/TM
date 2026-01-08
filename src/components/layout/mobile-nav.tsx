"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";
import {
  LayoutDashboard,
  Package,
  Users,
  ListChecks,
  Settings,
  UserCircle,
} from "lucide-react";
import { ReactNode } from "react";

interface NavItem {
  href: string;
  icon: ReactNode;
  label: string;
  roles?: string[];
}

interface MobileNavProps {
  userRole: "admin" | "manager" | "worker" | "customer";
  accentColor?: string;
}

export function MobileNav({ userRole, accentColor = "#3b82f6" }: MobileNavProps) {
  const pathname = usePathname();

  const navItems: NavItem[] = [
    // Customer
    { href: "/dashboard", icon: <LayoutDashboard />, label: "Home", roles: ["customer"] },
    { href: "/orders", icon: <Package />, label: "Orders", roles: ["customer"] },
    { href: "/dependants", icon: <Users />, label: "Family", roles: ["customer"] },
    { href: "/profile", icon: <UserCircle />, label: "Profile", roles: ["customer"] },

    // Worker
    { href: "/worker/dashboard", icon: <LayoutDashboard />, label: "Home", roles: ["worker"] },
    { href: "/worker/tasks", icon: <ListChecks />, label: "Tasks", roles: ["worker"] },
    { href: "/worker/profile", icon: <UserCircle />, label: "Profile", roles: ["worker"] },

    // Manager
    { href: "/manager/dashboard", icon: <LayoutDashboard />, label: "Home", roles: ["manager"] },
    { href: "/manager/orders", icon: <Package />, label: "Orders", roles: ["manager"] },
    { href: "/manager/workers", icon: <Users />, label: "Workers", roles: ["manager"] },

    // Admin
    { href: "/admin/dashboard", icon: <LayoutDashboard />, label: "Home", roles: ["admin"] },
    { href: "/admin/materials", icon: <Package />, label: "Stock", roles: ["admin"] },
    { href: "/admin/settings", icon: <Settings />, label: "Settings", roles: ["admin"] },
  ];

  const filteredItems = navItems.filter((item) => !item.roles || item.roles.includes(userRole)).slice(0, 4);

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-card/95 backdrop-blur-sm">
      <div className="flex items-center justify-around px-2 py-2">
        {filteredItems.map((item) => {
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                "flex flex-col items-center gap-1 rounded-lg px-4 py-2 text-xs font-medium transition-all",
                "hover:bg-accent",
                isActive && "bg-accent"
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
    </nav>
  );
}