import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Sparkles, ArrowRight, Edit2, Check, X, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

async function generatePackingPlan(trip, items) {
  try {
    const prompt = `You are a travel packing expert. Analyze this packing list and provide recommendations.

Trip: ${trip.destination}
Dates: ${trip.start_date} to ${trip.end_date || 'TBD'}
Weather: ${trip.weather || 'Unknown'}

Items to pack:
${items.map(item => `- ${item.name} (${item.quantity}x, ${item.category})`).join('\n')}

Provide:
1. Estimated weight for each item in kg (be realistic)
2. Total weight analysis
3. What to keep, remove/reduce, and add
4. Step-by-step packing plan

CRITICAL FOR PACKING PLAN: Do NOT output generic packing tips. Every step MUST mention specific user items by name and quantity from the list above. Order steps by packing sequence: bottom/heavy items first, middle layers, top quick-access items, then carry-on. Generate 6-10 concrete steps that reference the actual items (e.g., "Place jeans (2) and shoes (1) at the bottom near wheels"). If overweight, mention specific items to reduce/swap.

Format as JSON:
{
  "items": [{"name": string, "qty": number, "category": string, "estWeightEachValue": number, "estWeightEachUnit": "kg", "estWeightTotalValue": number, "rationale": string}],
  "totals": {"totalWeightValue": number, "totalWeightUnit": "kg", "limitValue": 23, "limitUnit": "kg", "deltaValue": number, "deltaType": "OVER"|"UNDER"|"EVEN"},
  "keep": [{"name": string, "reason": string}],
  "removeOrSwap": [{"name": string, "action": "REMOVE"|"REDUCE"|"SWAP", "reason": string, "alternatives": [string]}],
  "add": [{"name": string, "reason": string}],
  "packingPlanSteps": [string]
}`;

    const result = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: "object",
        properties: {
          items: { type: "array" },
          totals: { type: "object" },
          keep: { type: "array" },
          removeOrSwap: { type: "array" },
          add: { type: "array" },
          packingPlanSteps: { type: "array" }
        }
      }
    });
    return result;
  } catch (error) {
    return generateFallbackPlan(items);
  }
}

function generateFallbackPlan(items) {
  const weightMap = {
    clothing: 0.3, toiletries: 0.2, electronics: 0.5,
    documents: 0.1, medications: 0.1, accessories: 0.2, other: 0.3
  };

  const analysisItems = items.map(item => {
    const weightEach = weightMap[item.category] || 0.3;
    return {
      name: item.name,
      qty: item.quantity,
      category: item.category,
      estWeightEachValue: weightEach,
      estWeightEachUnit: "kg",
      estWeightTotalValue: weightEach * item.quantity,
      rationale: `Estimated based on typical ${item.category} weight`
    };
  });

  const totalWeight = analysisItems.reduce((sum, i) => sum + i.estWeightTotalValue, 0);
  const limit = 23;
  const delta = totalWeight - limit;

  // Categorize items by type for packing order
  const categorizeItem = (item) => {
    const name = item.name.toLowerCase();
    if (name.includes('shoe') || name.includes('boot')) return 'shoes';
    if (name.includes('jean') || name.includes('pant') || name.includes('trouser')) return 'heavy_clothing';
    if (name.includes('jacket') || name.includes('coat') || name.includes('hoodie') || name.includes('sweater')) return 'heavy_clothing';
    if (name.includes('toiletries') || name.includes('shampoo') || name.includes('soap') || name.includes('liquid')) return 'liquids';
    if (name.includes('laptop') || name.includes('charger') || name.includes('cable') || name.includes('electronics')) return 'tech';
    if (name.includes('passport') || name.includes('document') || name.includes('ticket') || name.includes('id')) return 'documents';
    if (name.includes('shirt') || name.includes('short') || name.includes('sock') || name.includes('underwear')) return 'rollable_clothing';
    return 'other';
  };

  const grouped = {
    shoes: items.filter(i => categorizeItem(i) === 'shoes'),
    heavy_clothing: items.filter(i => categorizeItem(i) === 'heavy_clothing'),
    rollable_clothing: items.filter(i => categorizeItem(i) === 'rollable_clothing'),
    liquids: items.filter(i => categorizeItem(i) === 'liquids'),
    tech: items.filter(i => categorizeItem(i) === 'tech'),
    documents: items.filter(i => categorizeItem(i) === 'documents'),
    other: items.filter(i => categorizeItem(i) === 'other')
  };

  const steps = [];
  
  // Step 1: Bottom layer - heavy items
  const heavyItems = [...grouped.shoes, ...grouped.heavy_clothing].slice(0, 4);
  if (heavyItems.length > 0) {
    const itemsList = heavyItems.map(i => `${i.name} (${i.quantity})`).join(', ');
    steps.push(`Bottom layer: Place ${itemsList} at the bottom near the wheels for stability`);
  }

  // Step 2: Middle layer - rolled clothing
  if (grouped.rollable_clothing.length > 0) {
    const itemsList = grouped.rollable_clothing.map(i => `${i.name} (${i.quantity})`).join(', ');
    steps.push(`Middle layer: Roll ${itemsList} tightly to save space and prevent wrinkles`);
  }

  // Step 3: Organize with packing cubes
  if (grouped.rollable_clothing.length > 2 || grouped.other.length > 0) {
    steps.push(`Group similar items into packing cubes for easy organization and quick access`);
  }

  // Step 4: Fill gaps
  if (grouped.other.length > 0) {
    const itemsList = grouped.other.slice(0, 3).map(i => `${i.name} (${i.quantity})`).join(', ');
    steps.push(`Fill side gaps with ${itemsList} to maximize space`);
  }

  // Step 5: Top layer - liquids
  if (grouped.liquids.length > 0) {
    const itemsList = grouped.liquids.map(i => `${i.name} (${i.quantity})`).join(', ');
    steps.push(`Top layer: Seal ${itemsList} in a clear plastic bag and place at the top for easy security access`);
  }

  // Step 6: Quick access items
  const quickAccessItems = [...grouped.documents, ...grouped.tech].slice(0, 3);
  if (quickAccessItems.length > 0) {
    const itemsList = quickAccessItems.map(i => `${i.name} (${i.quantity})`).join(', ');
    steps.push(`Quick access: Keep ${itemsList} in an outer pocket or top compartment`);
  }

  // Step 7: Carry-on essentials
  const carryOnItems = [...grouped.documents, ...grouped.tech.slice(0, 2)];
  if (carryOnItems.length > 0) {
    const itemsList = carryOnItems.map(i => i.name).slice(0, 3).join(', ');
    steps.push(`Carry-on: Pack ${itemsList} and one change of clothes in your personal item`);
  }

  // Step 8: Weight-specific advice
  if (delta > 0) {
    const heavyItems = analysisItems.sort((a, b) => b.estWeightTotalValue - a.estWeightTotalValue).slice(0, 2);
    const itemsList = heavyItems.map(i => i.name).join(' or ');
    steps.push(`Weight reduction: Consider wearing ${itemsList} during travel to reduce baggage weight`);
  } else {
    steps.push(`Final check: Weigh your bag and ensure zippers close smoothly without forcing`);
  }

  return {
    items: analysisItems,
    totals: {
      totalWeightValue: parseFloat(totalWeight.toFixed(2)),
      totalWeightUnit: "kg",
      limitValue: limit,
      limitUnit: "kg",
      deltaValue: parseFloat(Math.abs(delta).toFixed(2)),
      deltaType: delta > 0 ? "OVER" : delta < 0 ? "UNDER" : "EVEN"
    },
    keep: items.slice(0, Math.ceil(items.length * 0.7)).map(i => ({
      name: i.name,
      reason: "Essential for your trip"
    })),
    removeOrSwap: delta > 0 ? items.slice(Math.ceil(items.length * 0.7)).map(i => ({
      name: i.name,
      action: "REDUCE",
      reason: "To reduce weight",
      alternatives: []
    })) : [],
    add: [
      { name: "Travel adapter", reason: "Essential for international travel" },
      { name: "Reusable water bottle", reason: "Stay hydrated" }
    ],
    packingPlanSteps: steps
  };
}

export default function TripAIReview() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const urlParams = new URLSearchParams(window.location.search);
  const tripId = urlParams.get('id');

  const [aiResult, setAiResult] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [editingWeights, setEditingWeights] = useState({});

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

  const updateItemMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.PackingItem.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['packingItems', tripId] });
    }
  });

  const deleteItemMutation = useMutation({
    mutationFn: (id) => base44.entities.PackingItem.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['packingItems', tripId] });
      if (aiResult) {
        setAiResult({
          ...aiResult,
          items: aiResult.items.filter(i => items.find(item => item.name === i.name && item.id !== id))
        });
      }
    }
  });

  const handleGenerate = async () => {
    setIsGenerating(true);
    const result = await generatePackingPlan(trip, items);
    setAiResult(result);
    setIsGenerating(false);
  };

  const handleWeightEdit = (itemName, value) => {
    setEditingWeights({ ...editingWeights, [itemName]: value });
  };

  const handleRemoveItem = async (itemName) => {
    const item = items.find(i => i.name === itemName);
    if (item) {
      await deleteItemMutation.mutateAsync(item.id);
    }
  };

  const handleReduceQty = async (itemName) => {
    const item = items.find(i => i.name === itemName);
    if (item && item.quantity > 1) {
      await updateItemMutation.mutateAsync({
        id: item.id,
        data: { quantity: item.quantity - 1 }
      });
    }
  };

  const handleSwap = async (itemName, alternative) => {
    const item = items.find(i => i.name === itemName);
    if (item && alternative) {
      await updateItemMutation.mutateAsync({
        id: item.id,
        data: { name: alternative }
      });
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-500 to-pink-600 rounded-3xl p-8 text-white shadow-xl">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-6 h-6" />
          <span className="text-sm font-medium opacity-90">AI-Powered</span>
        </div>
        <h1 className="text-3xl font-bold mb-2">Packing Analysis</h1>
        <p className="text-white/90">Get smart recommendations</p>
      </div>

      {!aiResult ? (
        <Card className="bg-white rounded-2xl p-8 text-center shadow-md">
          <Sparkles className="w-16 h-16 mx-auto mb-4 text-purple-500" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Ready to Optimize?</h3>
          <p className="text-gray-600 mb-6">
            AI will analyze your {items.length} items, estimate weights, and create a smart packing plan
          </p>
          <Button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white h-12 px-8"
          >
            {isGenerating ? (
              <>Analyzing...</>
            ) : (
              <>
                <Sparkles className="w-5 h-5 mr-2" />
                Generate AI Analysis
              </>
            )}
          </Button>
        </Card>
      ) : (
        <>
          {/* Weight Summary */}
          <Card className={`rounded-2xl p-6 shadow-md ${
            aiResult.totals.deltaType === "OVER" ? "bg-red-50 border-2 border-red-300" :
            aiResult.totals.deltaType === "UNDER" ? "bg-green-50 border-2 border-green-300" :
            "bg-blue-50 border-2 border-blue-300"
          }`}>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Weight Analysis</h2>
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-700">Total Weight</span>
              <span className="text-2xl font-bold text-gray-900">
                {aiResult.totals.totalWeightValue} {aiResult.totals.totalWeightUnit}
              </span>
            </div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-gray-700">Baggage Limit</span>
              <span className="font-semibold text-gray-900">
                {aiResult.totals.limitValue} {aiResult.totals.limitUnit}
              </span>
            </div>
            <div className={`text-center p-3 rounded-lg font-semibold ${
              aiResult.totals.deltaType === "OVER" ? "bg-red-100 text-red-700" :
              aiResult.totals.deltaType === "UNDER" ? "bg-green-100 text-green-700" :
              "bg-blue-100 text-blue-700"
            }`}>
              {aiResult.totals.deltaType === "OVER" && `⚠️ ${aiResult.totals.deltaValue} kg OVER limit`}
              {aiResult.totals.deltaType === "UNDER" && `✓ ${aiResult.totals.deltaValue} kg under limit`}
              {aiResult.totals.deltaType === "EVEN" && `✓ Exactly at limit`}
            </div>
          </Card>

          {/* Item Weights */}
          <Card className="bg-white rounded-2xl p-6 shadow-md">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Item Weight Breakdown</h2>
            <div className="space-y-2">
              {aiResult.items.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{item.name}</div>
                    <div className="text-xs text-gray-500">{item.rationale}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Input
                      type="number"
                      step="0.1"
                      value={editingWeights[item.name] ?? item.estWeightEachValue}
                      onChange={(e) => handleWeightEdit(item.name, parseFloat(e.target.value))}
                      className="w-20 h-8 text-center text-sm"
                    />
                    <span className="text-sm text-gray-600">kg × {item.qty}</span>
                    <span className="font-semibold text-gray-900 w-16 text-right">
                      {item.estWeightTotalValue.toFixed(1)} kg
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Recommendations */}
          {aiResult.keep.length > 0 && (
            <Card className="bg-white rounded-2xl p-6 shadow-md">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Check className="w-5 h-5 text-green-500" />
                Keep These
              </h2>
              <div className="space-y-2">
                {aiResult.keep.map((rec, idx) => (
                  <div key={idx} className="p-3 bg-green-50 rounded-lg border border-green-200">
                    <div className="font-medium text-gray-900">{rec.name}</div>
                    <div className="text-sm text-gray-600">{rec.reason}</div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {aiResult.removeOrSwap.length > 0 && (
            <Card className="bg-white rounded-2xl p-6 shadow-md">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <X className="w-5 h-5 text-red-500" />
                Consider Removing/Reducing
              </h2>
              <div className="space-y-3">
                {aiResult.removeOrSwap.map((rec, idx) => (
                  <div key={idx} className="p-3 bg-red-50 rounded-lg border border-red-200">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{rec.name}</div>
                        <div className="text-sm text-gray-600">{rec.reason}</div>
                      </div>
                      <Badge variant="outline" className="ml-2">{rec.action}</Badge>
                    </div>
                    <div className="flex gap-2">
                      {rec.action === "REMOVE" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRemoveItem(rec.name)}
                          className="text-red-600 border-red-300 hover:bg-red-50"
                        >
                          <Trash2 className="w-3 h-3 mr-1" />
                          Remove
                        </Button>
                      )}
                      {rec.action === "REDUCE" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleReduceQty(rec.name)}
                          className="text-orange-600 border-orange-300 hover:bg-orange-50"
                        >
                          Reduce Quantity
                        </Button>
                      )}
                      {rec.action === "SWAP" && rec.alternatives?.length > 0 && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleSwap(rec.name, rec.alternatives[0])}
                          className="text-blue-600 border-blue-300 hover:bg-blue-50"
                        >
                          Swap to {rec.alternatives[0]}
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {aiResult.add.length > 0 && (
            <Card className="bg-white rounded-2xl p-6 shadow-md">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Plus className="w-5 h-5 text-blue-500" />
                Suggested Additions
              </h2>
              <div className="space-y-2">
                {aiResult.add.map((rec, idx) => (
                  <div key={idx} className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="font-medium text-gray-900">{rec.name}</div>
                    <div className="text-sm text-gray-600">{rec.reason}</div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Packing Plan */}
          <Card className="bg-white rounded-2xl p-6 shadow-md">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Packing Plan</h2>
            <div className="space-y-3">
              {aiResult.packingPlanSteps.map((step, idx) => (
                <div key={idx} className="flex gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-semibold text-sm">
                    {idx + 1}
                  </div>
                  <div className="flex-1 text-gray-700 pt-1">{step}</div>
                </div>
              ))}
            </div>
          </Card>

          {/* Continue Button */}
          <Button
            onClick={() => navigate(`${createPageUrl("TripSetupChecklist")}?id=${tripId}`)}
            className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg h-14 text-base font-semibold"
          >
            Continue to Checklist
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </>
      )}
    </div>
  );
}