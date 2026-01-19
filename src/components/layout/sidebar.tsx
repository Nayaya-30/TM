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
    <aside className="hidden lg:flex lg:flex-col lg:w-72 lg:p-4 fixed h-screen z-40">
      <div className="flex-1 rounded-2xl border border-border bg-card/50 backdrop-blur-xl shadow-lg flex flex-col p-4 overflow-hidden">
        {/* Logo or Brand placeholder could go here */}
        <div className="mb-8 px-4 py-2 flex items-center gap-2">
           <div className="h-8 w-8 rounded-lg bg-primary/20 flex items-center justify-center">
             <div className="h-4 w-4 rounded-full bg-primary" />
           </div>
           <span className="font-bold text-lg tracking-tight">TailorMade</span>
        </div>

        <div className="flex-1 overflow-y-auto space-y-2">
          {filteredItems.map((item) => {
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={clsx(
                  "group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200",
                  "hover:bg-accent hover:shadow-sm",
                  isActive ? "bg-primary text-primary-foreground shadow-md" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <span className={clsx("transition-transform duration-200 group-hover:scale-110", isActive && "scale-110")}>
                  {item.icon}
                </span>
                {item.label}
              </Link>
            );
          })}
        </div>
        
        {/* Footer / User Profile snippet could go here */}
        <div className="mt-auto pt-4 border-t border-border/50">
           <div className="text-xs text-muted-foreground px-4 text-center">
             v1.0.0
           </div>
        </div>
      </div>
    </aside>
  );
}