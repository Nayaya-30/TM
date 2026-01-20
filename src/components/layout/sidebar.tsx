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
      <div className="flex-1 rounded-[2rem] border border-border/50 bg-card/30 backdrop-blur-xl shadow-xl flex flex-col p-4 overflow-hidden relative group">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent pointer-events-none opacity-50" />
        
        {/* Logo */}
        <div className="mb-8 px-4 py-4 flex items-center gap-3 relative z-10">
           <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg shadow-primary/20 ring-1 ring-white/20">
             <div className="h-5 w-5 rounded-full border-2 border-white/90" />
           </div>
           <div className="flex flex-col">
             <span className="font-bold text-xl tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
               TailorMade
             </span>
             <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
               Workspace
             </span>
           </div>
        </div>

        <div className="flex-1 overflow-y-auto space-y-1 relative z-10 pr-2 scrollbar-thin scrollbar-thumb-border/50 scrollbar-track-transparent">
          {filteredItems.map((item) => {
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={clsx(
                  "group/item relative flex items-center gap-3 rounded-2xl px-4 py-3.5 text-sm font-medium transition-all duration-300",
                  "hover:bg-primary/5 hover:pl-5",
                  isActive 
                    ? "bg-primary/10 text-primary font-bold shadow-sm ring-1 ring-primary/10" 
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 rounded-r-full bg-primary shadow-[0_0_8px_rgba(var(--primary),0.6)]" />
                )}
                <span className={clsx(
                  "transition-all duration-300 group-hover/item:scale-110", 
                  isActive ? "scale-110 text-primary" : "text-muted-foreground group-hover/item:text-primary"
                )}>
                  {item.icon}
                </span>
                {item.label}
                {isActive && (
                  <div className="absolute right-3 h-1.5 w-1.5 rounded-full bg-primary/50 animate-pulse" />
                )}
              </Link>
            );
          })}
        </div>
        
        {/* Footer */}
        <div className="mt-auto pt-4 border-t border-border/50 relative z-10">
           <div className="flex items-center gap-3 px-3 py-3 rounded-2xl bg-gradient-to-br from-muted/50 to-muted/10 border border-border/30 hover:border-primary/20 transition-colors cursor-pointer group/user">
             <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center border border-primary/10 group-hover/user:scale-105 transition-transform">
               <UserCircle className="h-5 w-5 text-primary" />
             </div>
             <div className="flex flex-col overflow-hidden">
               <span className="text-xs font-bold truncate capitalize group-hover/user:text-primary transition-colors">{userRole} Account</span>
               <span className="text-[10px] text-muted-foreground truncate">v1.0.0</span>
             </div>
           </div>
        </div>
      </div>
    </aside>
  );
}