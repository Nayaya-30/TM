"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Boxes, Plus, AlertTriangle, TrendingDown, Package } from "lucide-react";
import { useState } from "react";

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
        <Skeleton className="h-8 w-64" />
        <div className="grid gap-4 md:grid-cols-4">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
        <Skeleton className="h-64" />
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Materials</h1>
          <p className="text-muted-foreground">Manage inventory and stock levels</p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Material
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Materials</CardTitle>
            <Boxes className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
            <TrendingDown className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{summary.lowStock}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Out of Stock</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{summary.outOfStock}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₦{summary.totalValue.toFixed(2)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Materials List */}
      {materials.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Boxes className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-medium mb-2">No materials yet</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Add your first material to start tracking inventory
            </p>
            <Button onClick={() => setIsCreateModalOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Material
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {materials.map((material) => (
            <Card
              key={material._id}
              className={material.needsReorder ? "border-yellow-500" : ""}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-lg">{material.name}</h3>
                      <Badge
                        variant={
                          material.stockStatus === "out_of_stock"
                            ? "danger"
                            : material.stockStatus === "low_stock"
                            ? "warning"
                            : "success"
                        }
                      >
                        {material.stockStatus === "out_of_stock"
                          ? "Out of Stock"
                          : material.stockStatus === "low_stock"
                          ? "Low Stock"
                          : "In Stock"}
                      </Badge>
                    </div>

                    {material.description && (
                      <p className="text-sm text-muted-foreground mb-3">
                        {material.description}
                      </p>
                    )}

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">On Hand</p>
                        <p className="font-medium">
                          {material.quantityOnHand} {material.unit}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Reorder Level</p>
                        <p className="font-medium">
                          {material.reorderLevel} {material.unit}
                        </p>
                      </div>
                      {material.costPerUnit && (
                        <div>
                          <p className="text-muted-foreground">Cost per {material.unit}</p>
                          <p className="font-medium">₦{material.costPerUnit.toFixed(2)}</p>
                        </div>
                      )}
                      {material.costPerUnit && (
                        <div>
                          <p className="text-muted-foreground">Total Value</p>
                          <p className="font-medium">
                            ₦{(material.quantityOnHand * material.costPerUnit).toFixed(2)}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedMaterial(material._id);
                      setIsPurchaseModalOpen(true);
                    }}
                  >
                    Add Stock
                  </Button>
                </div>
              </CardContent>
            </Card>
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
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Description (Optional)</label>
            <Input
              value={createFormData.description}
              onChange={(e) =>
                setCreateFormData({ ...createFormData, description: e.target.value })
              }
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
              className="flex h-11 w-full rounded-lg border border-input bg-background px-4 py-2 text-base"
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
            />
          </div>

          <div className="flex gap-2 justify-end pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsCreateModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" isLoading={isCreating}>
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
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Notes (Optional)</label>
            <Input
              value={purchaseNotes}
              onChange={(e) => setPurchaseNotes(e.target.value)}
              placeholder="Purchase order number, supplier, etc."
            />
          </div>

          <div className="flex gap-2 justify-end pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsPurchaseModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" isLoading={isPurchasing}>
              Add Stock
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}