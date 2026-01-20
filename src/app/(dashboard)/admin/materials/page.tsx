"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Boxes, Plus, AlertTriangle, TrendingDown, Package, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { useState } from "react";
import { clsx } from "clsx";

export default function AdminMaterialsPage() {
  const materials = useQuery(api.materials.queries.list);
  const summary = useQuery(api.materials.queries.getSummary);
  const createMaterial = useMutation(api.materials.mutations.create);
  const purchaseMaterial = useMutation(api.materials.mutations.purchase);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isPurchasing, setIsPurchasing] = useState(false);

  const [createFormData, setCreateFormData] = useState({
    name: "",
    description: "",
    unit: "yards" as "yards" | "meters" | "units" | "pieces",
    quantityOnHand: 0,
    reorderLevel: 0,
    costPerUnit: 0,
  });

  const [purchaseQuantity, setPurchaseQuantity] = useState(0);
  const [purchaseNotes, setPurchaseNotes] = useState("");

  if (materials === undefined || summary === undefined) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-64 rounded-xl" />
        <div className="grid gap-6 md:grid-cols-4">
          <Skeleton className="h-40 rounded-3xl" />
          <Skeleton className="h-40 rounded-3xl" />
          <Skeleton className="h-40 rounded-3xl" />
          <Skeleton className="h-40 rounded-3xl" />
        </div>
        <Skeleton className="h-96 rounded-3xl" />
      </div>
    );
  }

  async function handleCreateSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsCreating(true);

    try {
      await createMaterial(createFormData);
      setIsCreateModalOpen(false);
      setCreateFormData({
        name: "",
        description: "",
        unit: "yards",
        quantityOnHand: 0,
        reorderLevel: 0,
        costPerUnit: 0,
      });
    } catch (error) {
      console.error("Failed to create material:", error);
    } finally {
      setIsCreating(false);
    }
  }

  async function handlePurchaseSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedMaterial) return;

    setIsPurchasing(true);

    try {
      await purchaseMaterial({
        materialId: selectedMaterial as any,
        quantity: purchaseQuantity,
        notes: purchaseNotes,
      });
      setIsPurchaseModalOpen(false);
      setSelectedMaterial(null);
      setPurchaseQuantity(0);
      setPurchaseNotes("");
    } catch (error) {
      console.error("Failed to purchase material:", error);
    } finally {
      setIsPurchasing(false);
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-transparent">
            Materials
          </h1>
          <p className="text-muted-foreground mt-1 text-lg">Manage inventory and stock levels</p>
        </div>
        <Button 
          onClick={() => setIsCreateModalOpen(true)}
          className="rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all duration-300"
          size="lg"
        >
          <Plus className="h-5 w-5 mr-2" />
          Add Material
        </Button>
      </div>

      {/* Stats Bento Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[
          { 
            title: "Total Materials", 
            value: summary.total, 
            icon: Boxes, 
            color: "text-blue-500", 
            bg: "bg-blue-500/10",
            trend: "Neutral"
          },
          { 
            title: "Low Stock", 
            value: summary.lowStock, 
            icon: TrendingDown, 
            color: "text-yellow-600", 
            bg: "bg-yellow-500/10",
            trend: "Action Needed"
          },
          { 
            title: "Out of Stock", 
            value: summary.outOfStock, 
            icon: AlertTriangle, 
            color: "text-red-500", 
            bg: "bg-red-500/10",
            trend: "Critical"
          },
          { 
            title: "Total Value", 
            value: `₦${summary.totalValue.toFixed(2)}`, 
            icon: Package, 
            color: "text-green-500", 
            bg: "bg-green-500/10",
            trend: "Asset Value"
          }
        ].map((stat, i) => (
          <div 
            key={i}
            className="group relative overflow-hidden rounded-[2rem] border border-border/50 bg-card/50 backdrop-blur-sm p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative flex items-center justify-between mb-4">
              <div className={clsx("h-12 w-12 rounded-2xl flex items-center justify-center transition-transform duration-500 group-hover:scale-110", stat.bg)}>
                <stat.icon className={clsx("h-6 w-6", stat.color)} />
              </div>
              <Badge variant="outline" className="rounded-lg bg-background/50 backdrop-blur-sm border-border/50">
                {stat.trend}
              </Badge>
            </div>
            <div className="relative">
              <h3 className="text-sm font-medium text-muted-foreground">{stat.title}</h3>
              <p className="text-3xl font-bold tracking-tight mt-1">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Materials Grid */}
      {materials.length === 0 ? (
        <div className="rounded-[2.5rem] border border-dashed border-border/60 bg-card/30 backdrop-blur-sm p-12 text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-muted/50">
            <Boxes className="h-10 w-10 text-muted-foreground opacity-50" />
          </div>
          <h3 className="mt-6 text-xl font-semibold">No materials yet</h3>
          <p className="mt-2 text-muted-foreground max-w-sm mx-auto">
            Add your first material to start tracking inventory, costs, and reorder levels.
          </p>
          <Button 
            onClick={() => setIsCreateModalOpen(true)}
            variant="outline"
            className="mt-6 rounded-xl"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Material
          </Button>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {materials.map((material) => (
            <div
              key={material._id}
              className={clsx(
                "group relative overflow-hidden rounded-[2rem] border bg-card/50 backdrop-blur-sm p-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-1",
                material.needsReorder ? "border-yellow-500/50 shadow-yellow-500/5" : "border-border/50"
              )}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <div className="relative flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={clsx(
                    "h-12 w-12 rounded-2xl flex items-center justify-center text-lg font-bold",
                    material.stockStatus === "out_of_stock" ? "bg-red-500/10 text-red-500" :
                    material.stockStatus === "low_stock" ? "bg-yellow-500/10 text-yellow-500" :
                    "bg-green-500/10 text-green-500"
                  )}>
                    {material.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg leading-tight">{material.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge
                        variant={
                          material.stockStatus === "out_of_stock" ? "destructive" :
                          material.stockStatus === "low_stock" ? "secondary" : "outline"
                        }
                        className={clsx("rounded-lg", material.stockStatus === "low_stock" && "bg-yellow-500/10 text-yellow-600 border-yellow-500/20")}
                      >
                        {material.stockStatus === "out_of_stock" ? "Out of Stock" :
                         material.stockStatus === "low_stock" ? "Low Stock" : "In Stock"}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>

              {material.description && (
                <p className="relative text-sm text-muted-foreground mb-6 line-clamp-2">
                  {material.description}
                </p>
              )}

              <div className="relative grid grid-cols-2 gap-4 text-sm p-4 rounded-2xl bg-muted/30 border border-border/30 mb-6">
                <div>
                  <p className="text-muted-foreground text-xs font-medium uppercase tracking-wider">On Hand</p>
                  <p className="font-bold text-lg">
                    {material.quantityOnHand} <span className="text-sm font-normal text-muted-foreground">{material.unit}</span>
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs font-medium uppercase tracking-wider">Reorder Level</p>
                  <p className="font-bold text-lg">
                    {material.reorderLevel} <span className="text-sm font-normal text-muted-foreground">{material.unit}</span>
                  </p>
                </div>
                {material.costPerUnit && (
                  <>
                    <div>
                      <p className="text-muted-foreground text-xs font-medium uppercase tracking-wider">Cost / Unit</p>
                      <p className="font-semibold">₦{material.costPerUnit.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs font-medium uppercase tracking-wider">Total Value</p>
                      <p className="font-semibold text-primary">
                        ₦{(material.quantityOnHand * material.costPerUnit).toFixed(2)}
                      </p>
                    </div>
                  </>
                )}
              </div>

              <div className="relative pt-2">
                <Button
                  variant="outline"
                  className="w-full rounded-xl hover:bg-primary hover:text-primary-foreground border-primary/20 hover:border-primary transition-all duration-300"
                  onClick={() => {
                    setSelectedMaterial(material._id);
                    setIsPurchaseModalOpen(true);
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Stock
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Material Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Add New Material"
        size="md"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Material Name</label>
            <Input
              value={createFormData.name}
              onChange={(e) =>
                setCreateFormData({ ...createFormData, name: e.target.value })
              }
              required
              className="rounded-xl"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Description (Optional)</label>
            <Input
              value={createFormData.description}
              onChange={(e) =>
                setCreateFormData({ ...createFormData, description: e.target.value })
              }
              className="rounded-xl"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Unit</label>
            <select
              value={createFormData.unit}
              onChange={(e) =>
                setCreateFormData({
                  ...createFormData,
                  unit: e.target.value as any,
                })
              }
              className="flex h-11 w-full rounded-xl border border-input bg-background px-4 py-2 text-base ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <option value="yards">Yards</option>
              <option value="meters">Meters</option>
              <option value="units">Units</option>
              <option value="pieces">Pieces</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Initial Quantity</label>
              <Input
                type="number"
                value={createFormData.quantityOnHand}
                onChange={(e) =>
                  setCreateFormData({
                    ...createFormData,
                    quantityOnHand: parseFloat(e.target.value) || 0,
                  })
                }
                min={0}
                step={0.1}
                required
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Reorder Level</label>
              <Input
                type="number"
                value={createFormData.reorderLevel}
                onChange={(e) =>
                  setCreateFormData({
                    ...createFormData,
                    reorderLevel: parseFloat(e.target.value) || 0,
                  })
                }
                min={0}
                step={0.1}
                required
                className="rounded-xl"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Cost per Unit (Optional)</label>
            <Input
              type="number"
              value={createFormData.costPerUnit}
              onChange={(e) =>
                setCreateFormData({
                  ...createFormData,
                  costPerUnit: parseFloat(e.target.value) || 0,
                })
              }
              min={0}
              step={0.01}
              className="rounded-xl"
            />
          </div>

          <div className="flex gap-2 justify-end pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsCreateModalOpen(false)}
              className="rounded-xl"
            >
              Cancel
            </Button>
            <Button type="submit" isLoading={isCreating} className="rounded-xl">
              Add Material
            </Button>
          </div>
        </form>
      </Modal>

      {/* Purchase Modal */}
      <Modal
        isOpen={isPurchaseModalOpen}
        onClose={() => setIsPurchaseModalOpen(false)}
        title="Add Stock"
        size="sm"
      >
        <form onSubmit={handlePurchaseSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Quantity</label>
            <Input
              type="number"
              value={purchaseQuantity}
              onChange={(e) => setPurchaseQuantity(parseFloat(e.target.value) || 0)}
              min={0}
              step={0.1}
              required
              className="rounded-xl"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Notes (Optional)</label>
            <Input
              value={purchaseNotes}
              onChange={(e) => setPurchaseNotes(e.target.value)}
              placeholder="Purchase order number, supplier, etc."
              className="rounded-xl"
            />
          </div>

          <div className="flex gap-2 justify-end pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsPurchaseModalOpen(false)}
              className="rounded-xl"
            >
              Cancel
            </Button>
            <Button type="submit" isLoading={isPurchasing} className="rounded-xl">
              Add Stock
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}