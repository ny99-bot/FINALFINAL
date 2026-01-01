import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Plus, Trash2, ArrowRight, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const CATEGORIES = [
  { value: "clothing", label: "Clothing", icon: "👕" },
  { value: "toiletries", label: "Toiletries", icon: "🧴" },
  { value: "electronics", label: "Electronics", icon: "🔌" },
  { value: "documents", label: "Documents", icon: "📄" },
  { value: "medications", label: "Medications", icon: "💊" },
  { value: "accessories", label: "Accessories", icon: "👜" },
  { value: "other", label: "Other", icon: "📦" }
];

export default function TripItemsInput() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const urlParams = new URLSearchParams(window.location.search);
  const tripId = urlParams.get('id');

  const [itemName, setItemName] = useState("");
  const [itemQty, setItemQty] = useState(1);
  const [itemCategory, setItemCategory] = useState("other");

  const { data: trip } = useQuery({
    queryKey: ['trip', tripId],
    queryFn: async () => {
      const trips = await base44.entities.Trip.list();
      return trips.find(t => t.id === tripId);
    },
    enabled: !!tripId
  });

  const { data: items = [] } = useQuery({
    queryKey: ['packingItems', tripId],
    queryFn: () => base44.entities.PackingItem.filter({ trip_id: tripId }),
    enabled: !!tripId,
    initialData: []
  });

  const addItemMutation = useMutation({
    mutationFn: (itemData) => base44.entities.PackingItem.create({ ...itemData, trip_id: tripId, is_packed: false }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['packingItems', tripId] });
      setItemName("");
      setItemQty(1);
      setItemCategory("other");
    }
  });

  const deleteItemMutation = useMutation({
    mutationFn: (id) => base44.entities.PackingItem.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['packingItems', tripId] });
    }
  });

  const handleAddItem = () => {
    if (itemName.trim()) {
      addItemMutation.mutate({
        name: itemName.trim(),
        quantity: itemQty,
        category: itemCategory
      });
    }
  };

  const handleNext = () => {
    navigate(`${createPageUrl("TripAIReview")}?id=${tripId}`);
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-3xl p-8 text-white shadow-xl">
        <h1 className="text-3xl font-bold mb-2">Add Items to Pack</h1>
        <p className="text-white/90">{trip?.destination}</p>
      </div>

      {/* Add Item Form */}
      <Card className="bg-white rounded-2xl p-6 shadow-md">
        <div className="space-y-4">
          <div>
            <Label htmlFor="itemName" className="text-sm font-medium">Item Name</Label>
            <Input
              id="itemName"
              placeholder="e.g., T-shirt, Toothbrush, Phone charger"
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddItem()}
              className="mt-1"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="itemQty" className="text-sm font-medium">Quantity</Label>
              <div className="flex items-center gap-2 mt-1">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setItemQty(Math.max(1, itemQty - 1))}
                  className="h-10 w-10"
                >
                  -
                </Button>
                <Input
                  id="itemQty"
                  type="number"
                  min="1"
                  value={itemQty}
                  onChange={(e) => setItemQty(Math.max(1, parseInt(e.target.value) || 1))}
                  className="text-center h-10"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setItemQty(itemQty + 1)}
                  className="h-10 w-10"
                >
                  +
                </Button>
              </div>
            </div>

            <div>
              <Label htmlFor="itemCategory" className="text-sm font-medium">Category</Label>
              <Select value={itemCategory} onValueChange={setItemCategory}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      <span className="flex items-center gap-2">
                        <span>{cat.icon}</span>
                        {cat.label}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button
            onClick={handleAddItem}
            disabled={!itemName.trim()}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Item
          </Button>
        </div>
      </Card>

      {/* Items List */}
      {items.length > 0 ? (
        <Card className="bg-white rounded-2xl p-6 shadow-md">
          <h3 className="font-semibold text-gray-900 mb-4">Items Added ({items.length})</h3>
          <div className="space-y-2">
            {items.map((item) => {
              const cat = CATEGORIES.find(c => c.value === item.category);
              return (
                <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3 flex-1">
                    <span className="text-xl">{cat?.icon}</span>
                    <div className="flex-1">
                      <span className="font-medium text-gray-900">{item.name}</span>
                      {item.quantity > 1 && (
                        <span className="text-sm text-gray-500 ml-2">× {item.quantity}</span>
                      )}
                      <div className="text-xs text-gray-500">{cat?.label}</div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteItemMutation.mutate(item.id)}
                    className="text-red-500 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              );
            })}
          </div>
        </Card>
      ) : (
        <Card className="bg-blue-50 rounded-2xl p-8 text-center border border-blue-100">
          <Package className="w-12 h-12 mx-auto mb-3 text-blue-400" />
          <p className="text-gray-600">No items added yet</p>
          <p className="text-sm text-gray-500 mt-1">Add your first item above</p>
        </Card>
      )}

      {/* Next Button */}
      <Button
        onClick={handleNext}
        disabled={items.length === 0}
        className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white shadow-lg h-14 text-base font-semibold"
      >
        Next: AI Review
        <ArrowRight className="w-5 h-5 ml-2" />
      </Button>
    </div>
  );
}