"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Id } from "@/convex/_generated/dataModel";
import { Plus, X } from "lucide-react";

interface CreateTaskModalProps {
	isOpen: boolean;
	onClose: () => void;
	orderId: Id<"orders">;
	onSuccess?: () => void;
}

export function CreateTaskModal({ isOpen, onClose, orderId, onSuccess }: CreateTaskModalProps) {
	const createTask = useMutation(api.tasks.mutations.create);
	const workers = useQuery(api.members.queries.listWorkersWithStats);
	const materials = useQuery(api.materials.queries.list, {});

	const [isCreating, setIsCreating] = useState(false);
	const [formData, setFormData] = useState({
		name: "",
		description: "",
		assignedTo: "",
		stage: "cutting" as "cutting" | "sewing" | "finishing" | "delivery",
		deadline: "",
	});

	const [materialAllocations, setMaterialAllocations] = useState<
		Array<{ materialId: string; plannedQuantity: number }>
	>([]);

	function addMaterialAllocation() {
		setMaterialAllocations([...materialAllocations, { materialId: "", plannedQuantity: 0 }]);
	}

	function removeMaterialAllocation(index: number) {
		setMaterialAllocations(materialAllocations.filter((_, i) => i !== index));
	}

	function updateMaterialAllocation(
		index: number,
		field: "materialId" | "plannedQuantity",
		value: string | number
	) {
		const updated = [...materialAllocations];
		updated[index] = { ...updated[index], [field]: value };
		setMaterialAllocations(updated);
	}

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		setIsCreating(true);

		try {
			await createTask({
				orderId,
				assignedTo: formData.assignedTo as Id<"users">,
				name: formData.name,
				description: formData.description || undefined,
				stage: formData.stage,
				deadline: new Date(formData.deadline).getTime(),
				materialAllocations:
					materialAllocations.length > 0
						? materialAllocations.map((alloc) => ({
							materialId: alloc.materialId as Id<"materials">,
							plannedQuantity: alloc.plannedQuantity,
						}))
						: undefined,
			});

			onClose();
			if (onSuccess) onSuccess();

			// Reset form
			setFormData({
				name: "",
				description: "",
				assignedTo: "",
				stage: "cutting",
				deadline: "",
			});
			setMaterialAllocations([]);
		} catch (error) {
			console.error("Failed to create task:", error);
		} finally {
			setIsCreating(false);
		}
	}

	return (
		<Modal isOpen={isOpen} onClose={onClose} title="Create Task" size="lg">
			<form onSubmit={handleSubmit} className="space-y-4">
				<div className="space-y-2">
					<label className="text-sm font-medium">Task Name</label>
					<Input
						value={formData.name}
						onChange={(e) => setFormData({ ...formData, name: e.target.value })}
						placeholder="e.g., Cut fabric pieces"
						required
					/>
				</div>

				<div className="space-y-2">
					<label className="text-sm font-medium">Description (Optional)</label>
					<textarea
						value={formData.description}
						onChange={(e) => setFormData({ ...formData, description: e.target.value })}
						className="flex min-h-[80px] w-full rounded-lg border border-input bg-background px-4 py-2 text-base"
						placeholder="Additional instructions..."
					/>
				</div>

				<div className="grid grid-cols-2 gap-4">
					<div className="space-y-2">
						<label className="text-sm font-medium">Assign to Worker</label>
						<select
							value={formData.assignedTo}
							onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
							className="flex h-11 w-full rounded-lg border border-input bg-background px-4 py-2 text-base"
							required
						>
							<option value="">Select worker...</option>
							{workers?.map((worker) => (
								<option key={worker.userId} value={worker.userId}>
									{worker.user?.firstName} {worker.user?.lastName}
								</option>
							))}
						</select>
					</div>

					<div className="space-y-2">
						<label className="text-sm font-medium">Stage</label>
						<select
							value={formData.stage}
							onChange={(e) => setFormData({ ...formData, stage: e.target.value as any })}
							className="flex h-11 w-full rounded-lg border border-input bg-background px-4 py-2 text-base"
							required
						>
							<option value="cutting">Cutting</option>
							<option value="sewing">Sewing</option>
							<option value="finishing">Finishing</option>
							<option value="delivery">Delivery</option>
						</select>
					</div>
				</div>

				<div className="space-y-2">
					<label className="text-sm font-medium">Deadline</label>
					<Input
						type="datetime-local"
						value={formData.deadline}
						onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
						min={new Date().toISOString().slice(0, 16)}
						required
					/>
				</div>

				{/* Material Allocations */}
				<div className="space-y-2">
					<div className="flex items-center justify-between">
						<label className="text-sm font-medium">Material Allocations (Optional)</label>
						<Button type="button" variant="outline" size="sm" onClick={addMaterialAllocation}>
							<Plus className="h-4 w-4 mr-1" />
							Add Material
						</Button>
					</div>

					{materialAllocations.length > 0 && (
						<div className="space-y-3 p-4 rounded-lg border border-border">
							{materialAllocations.map((allocation, index) => (
								<div key={index} className="flex gap-2">
									<select
										value={allocation.materialId}
										onChange={(e) =>
											updateMaterialAllocation(index, "materialId", e.target.value)
										}
										className="flex h-11 flex-1 rounded-lg border border-input bg-background px-4 py-2 text-base"
										required
									>
										<option value="">Select material...</option>
										{materials?.map((material) => (
											<option key={material._id} value={material._id}>
												{material.name} ({material.quantityOnHand} {material.unit} available)
											</option>
										))}
									</select>

									<Input
										type="number"
										value={allocation.plannedQuantity}
										onChange={(e) =>
											updateMaterialAllocation(
												index,
												"plannedQuantity",
												parseFloat(e.target.value) || 0
											)
										}
										placeholder="Quantity"
										min={0}
										step={0.1}
										className="w-32"
										required
									/>

									<Button
										type="button"
										variant="ghost"
										size="sm"
										onClick={() => removeMaterialAllocation(index)}
									>
										<X className="h-4 w-4" />
									</Button>
								</div>
							))}
						</div>
					)}
				</div>

				<div className="flex gap-2 justify-end pt-4">
					<Button type="button" variant="outline" onClick={onClose}>
						Cancel
					</Button>
					<Button type="submit" isLoading={isCreating}>
						Create Task
					</Button>
				</div>
			</form>
		</Modal>
	);
}
