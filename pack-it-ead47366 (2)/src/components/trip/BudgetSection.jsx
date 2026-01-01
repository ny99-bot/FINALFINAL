import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DollarSign, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";

const CATEGORIES = [
  { value: "food", label: "Food", emoji: "🍽️", color: "#f59e0b" },
  { value: "transport", label: "Transport", emoji: "🚗", color: "#3b82f6" },
  { value: "accommodation", label: "Accommodation", emoji: "🏨", color: "#8b5cf6" },
  { value: "activities", label: "Activities", emoji: "🎭", color: "#10b981" },
  { value: "shopping", label: "Shopping", emoji: "🛍️", color: "#ec4899" },
  { value: "other", label: "Other", emoji: "📦", color: "#6b7280" }
];

export default function BudgetSection({ tripId }) {
  const [showDialog, setShowDialog] = useState(false);
  const [formData, setFormData] = useState({
    category: "food",
    amount: "",
    currency: "USD",
    description: ""
  });

  const queryClient = useQueryClient();

  const { data: expenses = [] } = useQuery({
    queryKey: ['budgetItems', tripId],
    queryFn: () => base44.entities.BudgetItem.filter({ trip_id: tripId }),
    enabled: !!tripId,
    initialData: []
  });

  const addExpenseMutation = useMutation({
    mutationFn: (data) => base44.entities.BudgetItem.create({ ...data, trip_id: tripId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgetItems', tripId] });
      setShowDialog(false);
      setFormData({ category: "food", amount: "", currency: "USD", description: "" });
    }
  });

  const deleteExpenseMutation = useMutation({
    mutationFn: (id) => base44.entities.BudgetItem.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgetItems', tripId] });
    }
  });

  const total = expenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);

  const chartData = CATEGORIES.map(cat => {
    const amount = expenses
      .filter(exp => exp.category === cat.value)
      .reduce((sum, exp) => sum + (exp.amount || 0), 0);
    return {
      name: cat.label,
      value: amount,
      color: cat.color
    };
  }).filter(d => d.value > 0);

  return (
    <div className="bg-white rounded-2xl p-6 shadow-md">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-green-500" />
          <span className="font-semibold text-gray-900">Budget Tracker</span>
        </div>
        <Button
          size="sm"
          onClick={() => setShowDialog(true)}
          className="bg-green-500 hover:bg-green-600 text-white"
        >
          <Plus className="w-4 h-4 mr-1" />
          Add Expense
        </Button>
      </div>

      {expenses.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <DollarSign className="w-12 h-12 mx-auto mb-2 opacity-30" />
          <p className="text-sm">No expenses tracked yet</p>
        </div>
      ) : (
        <>
          {/* Total */}
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl p-4 mb-6 text-white">
            <div className="text-sm opacity-90">Total Spent</div>
            <div className="text-3xl font-bold">${total.toFixed(2)}</div>
          </div>

          {/* Pie Chart */}
          {chartData.length > 0 && (
            <div className="mb-6">
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Expense List */}
          <div className="space-y-2">
            {expenses.map((expense) => {
              const category = CATEGORIES.find(c => c.value === expense.category);
              return (
                <div
                  key={expense.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <span className="text-xl">{category?.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 truncate">
                        {expense.description || category?.label}
                      </div>
                      <div className="text-xs text-gray-500">{category?.label}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-900">
                      ${expense.amount.toFixed(2)}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteExpenseMutation.mutate(expense.id)}
                      className="h-8 w-8 text-red-500 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Add Expense Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Expense</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Label htmlFor="category">Category</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      <span className="flex items-center gap-2">
                        <span>{cat.emoji}</span>
                        {cat.label}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="currency">Currency</Label>
              <Input
                id="currency"
                placeholder="USD"
                value={formData.currency}
                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="description">Description (optional)</Label>
              <Input
                id="description"
                placeholder="Dinner at restaurant"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="mt-1"
              />
            </div>
          </div>
          <div className="flex gap-3 mt-6">
            <Button
              variant="outline"
              onClick={() => setShowDialog(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={() => addExpenseMutation.mutate({ 
                ...formData, 
                amount: parseFloat(formData.amount) || 0 
              })}
              disabled={!formData.amount}
              className="flex-1 bg-green-500 hover:bg-green-600 text-white"
            >
              Add
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}