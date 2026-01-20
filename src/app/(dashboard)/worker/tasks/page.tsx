"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Calendar, 
  ArrowRight,
  Filter,
  Search
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import clsx from "clsx";
import { format } from "date-fns";

export default function WorkerTasksPage() {
  // TODO: Add query for worker tasks
  // const tasks = useQuery(api.tasks.queries.listMyTasks);
  const tasks = undefined; // Placeholder until query is ready

  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  // Mock data for UI development
  const mockTasks = [
    {
      _id: "1",
      name: "Cut Fabric for Order #1234",
      description: "Cut the navy blue wool fabric according to the pattern.",
      deadline: Date.now() + 86400000, // tomorrow
      status: "pending",
      priority: "high",
      stage: "cutting"
    },
    {
      _id: "2",
      name: "Sew Sleeves for Order #1234",
      description: "Assemble and attach sleeves.",
      deadline: Date.now() + 172800000, // 2 days
      status: "in_progress",
      priority: "medium",
      stage: "sewing"
    },
    {
      _id: "3",
      name: "Final Inspection Order #1230",
      description: "Check for loose threads and proper fit.",
      deadline: Date.now() - 86400000, // yesterday
      status: "overdue",
      priority: "high",
      stage: "finishing"
    }
  ];

  const displayTasks = tasks || mockTasks;

  return (
    <div className="space-y-8 p-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">My Tasks</h1>
          <p className="text-muted-foreground">Manage your assigned tasks and track progress</p>
        </div>
        <div className="flex items-center gap-2">
           <Button className="rounded-xl shadow-lg shadow-primary/20">
             View Schedule
           </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-6 md:grid-cols-4">
        {[
          { label: "Pending", value: "12", icon: Clock, color: "text-blue-500", bg: "bg-blue-500/10" },
          { label: "In Progress", value: "5", icon: CheckCircle2, color: "text-orange-500", bg: "bg-orange-500/10" },
          { label: "Completed", value: "45", icon: CheckCircle2, color: "text-green-500", bg: "bg-green-500/10" },
          { label: "Overdue", value: "2", icon: AlertCircle, color: "text-red-500", bg: "bg-red-500/10" },
        ].map((stat, i) => (
          <div key={i} className="group relative overflow-hidden rounded-3xl border border-border/50 bg-card/50 backdrop-blur-sm p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="flex items-center justify-between mb-4">
              <div className={clsx("h-10 w-10 rounded-xl flex items-center justify-center", stat.bg)}>
                <stat.icon className={clsx("h-5 w-5", stat.color)} />
              </div>
              <span className="text-2xl font-bold">{stat.value}</span>
            </div>
            <p className="text-sm text-muted-foreground font-medium">{stat.label} Tasks</p>
          </div>
        ))}
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row gap-4 items-center bg-card/30 p-4 rounded-2xl border border-border/50 backdrop-blur-sm">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search tasks..." 
            className="pl-10 bg-background/50 border-border/50"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
          {["all", "pending", "in_progress", "completed", "overdue"].map((f) => (
            <Button
              key={f}
              variant={filter === f ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter(f)}
              className="capitalize rounded-full whitespace-nowrap"
            >
              {f.replace("_", " ")}
            </Button>
          ))}
        </div>
      </div>

      {/* Tasks Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {displayTasks.map((task) => (
          <div key={task._id} className="group flex flex-col relative overflow-hidden rounded-[2rem] border border-border/50 bg-card/50 backdrop-blur-sm p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            <div className="relative flex items-start justify-between mb-4">
              <Badge 
                variant={
                  task.status === "completed" ? "success" : 
                  task.status === "overdue" ? "destructive" : 
                  task.status === "in_progress" ? "default" : "secondary"
                }
                className="capitalize rounded-full px-3"
              >
                {task.status.replace("_", " ")}
              </Badge>
              {task.priority === "high" && (
                <span className="flex h-3 w-3 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                </span>
              )}
            </div>

            <div className="relative mb-6 flex-1">
              <h3 className="font-bold text-lg mb-2 group-hover:text-primary transition-colors">{task.name}</h3>
              <p className="text-muted-foreground text-sm line-clamp-2">{task.description}</p>
            </div>

            <div className="relative mt-auto space-y-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/30 p-2 rounded-lg">
                <Calendar className="h-4 w-4 text-primary" />
                <span>Due {format(task.deadline, "MMM d, yyyy")}</span>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-border/50">
                <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  {task.stage} Stage
                </span>
                <Button size="sm" className="rounded-xl group-hover:translate-x-1 transition-transform">
                  Details <ArrowRight className="ml-2 h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
