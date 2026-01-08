"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Id } from "@/convex/_generated/dataModel";

interface CreateOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function CreateOrderModal({ isOpen, onClose, onSuccess }: CreateOrderModalProps) {
  const createOrder = useMutation(api.orders.mutations.create);
  const customers = useQuery(api.customers.queries.list);
  const styles = useQuery(api.styles.queries.listInternal);

  const [isCreating, setIsCreating] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [dependants, setDependants] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    customerId: "",
    dependantId: "",
    styleId: "",
    description: "",
    estimatedDelivery: "",
    price: "",
    notes: "",
  });

  // Load dependants when customer changes
  const loadDependants = useQuery(
    api.dependants.queries.listByCustomer,
    selectedCustomer ? { customerId: selectedCustomer as Id<"customers"> } : "skip"
  );

  if (loadDependants && loadDependants !== dependants) {
    setDependants(loadDependants);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsCreating(true);

    try {
      await createOrder({
        customerId: formData.customerId as Id<"customers">,
        dependantId: formData.dependantId as Id<"dependants">,
        styleId: formData.styleId ? (formData.styleId as Id<"styles">) : undefined,
        description: formData.description,
        estimatedDelivery: new Date(formData.estimatedDelivery).getTime(),
        price: formData.price ? parseFloat(formData.price) : undefined,
        notes: formData.notes || undefined,
      });

      onClose();
      if (onSuccess) onSuccess();
      
      // Reset form
      setFormData({
        customerId: "",
        dependantId: "",
        styleId: "",
        description: "",
        estimatedDelivery: "",
        price: "",
        notes: "",
      });
      setSelectedCustomer("");
    } catch (error) {
      console.error("Failed to create order:", error);
    } finally {
      setIsCreating(false);
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Order" size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Customer</label>
          <select
            value={formData.customerId}
            onChange={(e) => {
              setFormData({ ...formData, customerId: e.target.value, dependantId: "" });
              setSelectedCustomer(e.target.value);
            }}
            className="flex h-11 w-full rounded-lg border border-input bg-background px-4 py-2 text-base"
            required
          >
            <option value="">Select customer...</option>
            {customers?.map((customer) => (
              <option key={customer._id} value={customer._id}>
                {customer.firstName} {customer.lastName}
              </option>
            ))}
          </select>
        </div>

        {formData.customerId && (
          <div className="space-y-2">
            <label className="text-sm font-medium">Dependant</label>
            <select
              value={formData.dependantId}
              onChange={(e) => setFormData({ ...formData, dependantId: e.target.value })}
              className="flex h-11 w-full rounded-lg border border-input bg-background px-4 py-2 text-base"
              required
            >
              <option value="">Select dependant...</option>
              {dependants.map((dependant) => (
                <option key={dependant._id} value={dependant._id}>
                  {dependant.firstName} {dependant.lastName}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="space-y-2">
          <label className="text-sm font-medium">Style (Optional)</label>
          <select
            value={formData.styleId}
            onChange={(e) => setFormData({ ...formData, styleId: e.target.value })}
            className="flex h-11 w-full rounded-lg border border-input bg-background px-4 py-2 text-base"
          >
            <option value="">No style reference</option>
            {styles?.map((style) => (
              <option key={style._id} value={style._id}>
                {style.name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="flex min-h-[100px] w-full rounded-lg border border-input bg-background px-4 py-2 text-base"
            placeholder="Describe the order details..."
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Estimated Delivery</label>
            <Input
              type="date"
              value={formData.estimatedDelivery}
              onChange={(e) => setFormData({ ...formData, estimatedDelivery: e.target.value })}
              min={new Date().toISOString().split("T")[0]}
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Price (Optional)</label>
            <Input
              type="number"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              placeholder="0.00"
              min={0}
              step={0.01}
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Notes (Optional)</label>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            className="flex min-h-[80px] w-full rounded-lg border border-input bg-background px-4 py-2 text-base"
            placeholder="Additional notes or special instructions..."
          />
        </div>

        <div className="flex gap-2 justify-end pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isCreating}>
            Create Order
          </Button>
        </div>
      </form>
    </Modal>
  );
}
}