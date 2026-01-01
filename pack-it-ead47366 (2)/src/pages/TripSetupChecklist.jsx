import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Check, Package, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export default function TripSetupChecklist() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const urlParams = new URLSearchParams(window.location.search);
  const tripId = urlParams.get('id');

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

  const togglePackedMutation = useMutation({
    mutationFn: ({ id, is_packed }) => base44.entities.PackingItem.update(id, { is_packed }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['packingItems', tripId] });
    }
  });

  const packedCount = items.filter(item => item.is_packed).length;
  const totalCount = items.length;
  const progress = totalCount > 0 ? (packedCount / totalCount) * 100 : 0;

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-3xl p-8 text-white shadow-xl">
        <h1 className="text-3xl font-bold mb-2">Packing Checklist</h1>
        <p className="text-white/90">{trip?.destination}</p>
      </div>

      {/* Progress */}
      <Card className="bg-white rounded-2xl p-6 shadow-md">
        <div className="flex items-center justify-between mb-4">
          <span className="font-semibold text-gray-900">Progress</span>
          <span className="text-sm text-gray-600">
            {packedCount} of {totalCount} packed
          </span>
        </div>
        <Progress value={progress} className="h-3 mb-2" />
        <p className="text-xs text-gray-500 text-center">
          {progress === 100 ? "🎉 All packed!" : `${totalCount - packedCount} items left`}
        </p>
      </Card>

      {/* Checklist */}
      {items.length === 0 ? (
        <Card className="bg-blue-50 rounded-2xl p-8 text-center border border-blue-100">
          <Package className="w-12 h-12 mx-auto mb-3 text-blue-400" />
          <p className="text-gray-600 mb-2">No items in your checklist</p>
          <p className="text-sm text-gray-500">Your packing list is empty</p>
        </Card>
      ) : (
        <Card className="bg-white rounded-2xl p-6 shadow-md">
          <h3 className="font-semibold text-gray-900 mb-4">Items to Pack</h3>
          <div className="space-y-2">
            {items.map((item) => (
              <div
                key={item.id}
                className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${
                  item.is_packed
                    ? "bg-green-50 border-green-200"
                    : "bg-gray-50 border-gray-200"
                }`}
              >
                <button
                  onClick={() => togglePackedMutation.mutate({
                    id: item.id,
                    is_packed: !item.is_packed
                  })}
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0 ${
                    item.is_packed
                      ? "bg-green-500 border-green-500"
                      : "border-gray-300 hover:border-green-500"
                  }`}
                >
                  {item.is_packed && <Check className="w-4 h-4 text-white" />}
                </button>
                <span className={`flex-1 ${item.is_packed ? "line-through text-gray-500" : "text-gray-900"}`}>
                  {item.name}
                  {item.quantity > 1 && (
                    <span className="text-sm text-gray-500 ml-2">× {item.quantity}</span>
                  )}
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Done Button */}
      <Button
        onClick={() => navigate(`${createPageUrl("TripSetupDone")}?id=${tripId}`)}
        className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg h-14 text-base font-semibold"
      >
        Done
        <ArrowRight className="w-5 h-5 ml-2" />
      </Button>
    </div>
  );
}