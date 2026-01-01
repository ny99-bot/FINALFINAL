import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { 
  ArrowLeft, Plus, Trash2, Check, Package, 
  Calendar, MapPin, Edit, X, Cloud, StickyNote, Timer
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { motion, AnimatePresence } from "framer-motion";
import { format, differenceInDays, isFuture } from "date-fns";
import BudgetSection from "../components/trip/BudgetSection";

const CATEGORIES = [
  { value: "clothing", label: "Clothing", icon: "👕", color: "bg-blue-100 text-blue-700 border-blue-300" },
  { value: "toiletries", label: "Toiletries", icon: "🧴", color: "bg-green-100 text-green-700 border-green-300" },
  { value: "electronics", label: "Electronics", icon: "🔌", color: "bg-purple-100 text-purple-700 border-purple-300" },
  { value: "documents", label: "Documents", icon: "📄", color: "bg-red-100 text-red-700 border-red-300" },
  { value: "medications", label: "Medications", icon: "💊", color: "bg-pink-100 text-pink-700 border-pink-300" },
  { value: "accessories", label: "Accessories", icon: "👜", color: "bg-yellow-100 text-yellow-700 border-yellow-300" },
  { value: "other", label: "Other", icon: "📦", color: "bg-orange-100 text-orange-700 border-orange-300" }
];

const WEATHER_EMOJIS = [
  { value: "☀️", label: "Sunny" },
  { value: "⛅", label: "Partly Cloudy" },
  { value: "☁️", label: "Cloudy" },
  { value: "🌧️", label: "Rainy" },
  { value: "⛈️", label: "Stormy" },
  { value: "❄️", label: "Snowy" },
  { value: "🌡️", label: "Hot" },
  { value: "🥶", label: "Cold" }
];

export default function TripDetails() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const urlParams = new URLSearchParams(window.location.search);
  const tripId = urlParams.get('id');

  const [showAddItem, setShowAddItem] = useState(false);
  const [showEditTrip, setShowEditTrip] = useState(false);
  const [newItem, setNewItem] = useState({ name: "", category: "other", quantity: 1 });
  const [editedTrip, setEditedTrip] = useState(null);

  const { data: trip, isLoading: tripLoading } = useQuery({
    queryKey: ['trip', tripId],
    queryFn: async () => {
      const trips = await base44.entities.Trip.list();
      return trips.find(t => t.id === tripId);
    },
    enabled: !!tripId
  });

  const { data: items = [], isLoading: itemsLoading } = useQuery({
    queryKey: ['packingItems', tripId],
    queryFn: () => base44.entities.PackingItem.filter({ trip_id: tripId }, 'category'),
    enabled: !!tripId,
    initialData: []
  });

  const addItemMutation = useMutation({
    mutationFn: (itemData) => base44.entities.PackingItem.create({ ...itemData, trip_id: tripId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['packingItems', tripId] });
      setShowAddItem(false);
      setNewItem({ name: "", category: "other", quantity: 1 });
    }
  });

  const togglePackedMutation = useMutation({
    mutationFn: ({ id, is_packed }) => base44.entities.PackingItem.update(id, { is_packed }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['packingItems', tripId] });
    }
  });

  const deleteItemMutation = useMutation({
    mutationFn: (id) => base44.entities.PackingItem.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['packingItems', tripId] });
    }
  });

  const updateTripMutation = useMutation({
    mutationFn: (tripData) => base44.entities.Trip.update(tripId, tripData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trip', tripId] });
      setShowEditTrip(false);
    }
  });

  React.useEffect(() => {
    if (trip && showEditTrip) {
      setEditedTrip(trip);
    }
  }, [trip, showEditTrip]);

  if (tripLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="text-center py-16">
        <h2 className="text-xl font-semibold text-gray-900">Trip not found</h2>
        <Button onClick={() => navigate(createPageUrl("Trips"))} className="mt-4">
          Back to Trips
        </Button>
      </div>
    );
  }

  const packedCount = items.filter(item => item.is_packed).length;
  const totalCount = items.length;
  const progress = totalCount > 0 ? (packedCount / totalCount) * 100 : 0;

  const groupedItems = items.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {});

  const countdown = isFuture(new Date(trip.start_date)) 
    ? differenceInDays(new Date(trip.start_date), new Date())
    : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(createPageUrl("Trips"))}
          className="rounded-full"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-2xl font-bold text-gray-900 flex-1">Trip Details</h1>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setShowEditTrip(true)}
          className="text-blue-500 hover:text-blue-700 hover:bg-blue-50"
        >
          <Edit className="w-5 h-5" />
        </Button>
      </div>

      {/* Trip Info Card */}
      <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl p-6 text-white shadow-xl">
        <div className="flex items-start justify-between mb-2">
          <h2 className="text-2xl font-bold">{trip.name}</h2>
          {trip.weather_emoji && (
            <span className="text-4xl">{trip.weather_emoji}</span>
          )}
        </div>
        <div className="flex items-center gap-2 mb-4">
          <MapPin className="w-4 h-4" />
          <span className="text-white/90">{trip.destination}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-white/80 mb-4">
          <Calendar className="w-4 h-4" />
          <span>
            {format(new Date(trip.start_date), 'MMM d')}
            {trip.end_date && ` - ${format(new Date(trip.end_date), 'MMM d, yyyy')}`}
          </span>
        </div>
        
        {countdown !== null && countdown >= 0 && (
          <div className="flex items-center gap-2 bg-white/10 rounded-lg px-4 py-3 mb-4 backdrop-blur-sm">
            <Timer className="w-5 h-5" />
            <div>
              <div className="text-2xl font-bold">{countdown}</div>
              <div className="text-xs text-white/80">days until departure</div>
            </div>
          </div>
        )}

        {trip.weather && (
          <div className="flex items-center gap-2 border-t border-white/20 pt-4">
            <Cloud className="w-4 h-4" />
            <span className="text-sm text-white/90">{trip.weather}</span>
          </div>
        )}
      </div>

      {/* Progress Card with Pie Chart */}
      <div className="bg-white rounded-2xl p-6 shadow-md">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-blue-500" />
            <span className="font-semibold text-gray-900">Packing Progress</span>
          </div>
          <span className="text-sm font-medium text-gray-600">
            {packedCount} of {totalCount} packed
          </span>
        </div>
        
        <div className="flex items-center gap-6">
          {/* Pie/Ring Chart */}
          <div className="relative w-24 h-24 flex-shrink-0">
            <svg className="transform -rotate-90 w-24 h-24">
              <circle
                cx="48"
                cy="48"
                r="40"
                stroke="currentColor"
                strokeWidth="10"
                fill="none"
                className="text-gray-200"
              />
              <circle
                cx="48"
                cy="48"
                r="40"
                stroke="currentColor"
                strokeWidth="10"
                fill="none"
                strokeDasharray={`${2 * Math.PI * 40}`}
                strokeDashoffset={`${2 * Math.PI * 40 * (1 - progress / 100)}`}
                className={`transition-all duration-500 ${
                  progress === 100 ? "text-green-500" : "text-blue-500"
                }`}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xl font-bold text-gray-700">{Math.round(progress)}%</span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="flex-1">
            <Progress value={progress} className="h-4" />
            <p className="text-xs text-gray-500 mt-2">
              {progress === 100 
                ? "🎉 All packed and ready to go!" 
                : `${totalCount - packedCount} items left to pack`}
            </p>
          </div>
        </div>
      </div>

      {/* Notes Section */}
      {trip.notes && (
        <div className="bg-yellow-50 rounded-2xl p-6 shadow-md border-2 border-yellow-200">
          <div className="flex items-start gap-3">
            <StickyNote className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-1" />
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 mb-2">Trip Notes</h3>
              <p className="text-gray-700 text-sm whitespace-pre-wrap">{trip.notes}</p>
            </div>
          </div>
        </div>
      )}

      {/* Budget Section */}
      <BudgetSection tripId={tripId} />

      {/* Add Item Button */}
      <Button
        onClick={() => setShowAddItem(true)}
        className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg h-14 text-base font-semibold"
      >
        <Plus className="w-5 h-5 mr-2" />
        Add Item to Pack
      </Button>

      {/* Packing List */}
      {itemsLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-xl p-4 shadow-sm animate-pulse">
              <div className="h-5 bg-gray-200 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl shadow-md">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Package className="w-8 h-8 text-blue-500" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No items yet</h3>
          <p className="text-gray-500 text-sm">Start building your packing list!</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedItems).map(([category, categoryItems]) => {
            const categoryInfo = CATEGORIES.find(c => c.value === category);
            const categoryPacked = categoryItems.filter(item => item.is_packed).length;
            const categoryTotal = categoryItems.length;
            
            return (
              <div key={category} className="bg-white rounded-2xl p-4 shadow-md">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <span className="text-2xl">{categoryInfo?.icon}</span>
                    {categoryInfo?.label}
                  </h3>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${categoryInfo?.color}`}>
                    {categoryPacked}/{categoryTotal}
                  </span>
                </div>
                <div className="space-y-2">
                  <AnimatePresence>
                    {categoryItems.map((item) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ duration: 0.2 }}
                        className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${
                          item.is_packed 
                            ? "bg-green-50 border-green-200" 
                            : "bg-gray-50 border-gray-200 hover:border-blue-300"
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
                              : "border-gray-300 hover:border-blue-500"
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
                        <button
                          onClick={() => deleteItemMutation.mutate(item.id)}
                          className="text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Item Dialog */}
      <Dialog open={showAddItem} onOpenChange={setShowAddItem}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Add Packing Item</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Label htmlFor="item_name" className="text-sm font-medium">Item Name</Label>
              <Input
                id="item_name"
                placeholder="e.g., Passport, Sunscreen, Phone charger"
                value={newItem.name}
                onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="category" className="text-sm font-medium">Category</Label>
              <Select
                value={newItem.category}
                onValueChange={(value) => setNewItem({ ...newItem, category: value })}
              >
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
            <div>
              <Label htmlFor="quantity" className="text-sm font-medium">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                value={newItem.quantity}
                onChange={(e) => setNewItem({ ...newItem, quantity: parseInt(e.target.value) || 1 })}
                className="mt-1"
              />
            </div>
          </div>
          <div className="flex gap-3 mt-6">
            <Button
              variant="outline"
              onClick={() => setShowAddItem(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={() => addItemMutation.mutate(newItem)}
              disabled={!newItem.name || addItemMutation.isPending}
              className="flex-1 bg-blue-500 hover:bg-blue-600 text-white"
            >
              {addItemMutation.isPending ? "Adding..." : "Add Item"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Trip Dialog */}
      <Dialog open={showEditTrip} onOpenChange={setShowEditTrip}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Edit Trip</DialogTitle>
          </DialogHeader>
          {editedTrip && (
            <div className="space-y-4 mt-4">
              <div>
                <Label htmlFor="edit_name" className="text-sm font-medium">Trip Name</Label>
                <Input
                  id="edit_name"
                  value={editedTrip.name}
                  onChange={(e) => setEditedTrip({ ...editedTrip, name: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="edit_destination" className="text-sm font-medium">Destination</Label>
                <Input
                  id="edit_destination"
                  value={editedTrip.destination}
                  onChange={(e) => setEditedTrip({ ...editedTrip, destination: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit_start" className="text-sm font-medium">Start Date</Label>
                  <Input
                    id="edit_start"
                    type="date"
                    value={editedTrip.start_date}
                    onChange={(e) => setEditedTrip({ ...editedTrip, start_date: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="edit_end" className="text-sm font-medium">End Date</Label>
                  <Input
                    id="edit_end"
                    type="date"
                    value={editedTrip.end_date || ''}
                    onChange={(e) => setEditedTrip({ ...editedTrip, end_date: e.target.value })}
                    className="mt-1"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="edit_weather_emoji" className="text-sm font-medium">Weather</Label>
                <Select
                  value={editedTrip.weather_emoji || "☀️"}
                  onValueChange={(value) => setEditedTrip({ ...editedTrip, weather_emoji: value })}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {WEATHER_EMOJIS.map((w) => (
                      <SelectItem key={w.value} value={w.value}>
                        <span className="flex items-center gap-2">
                          <span className="text-xl">{w.value}</span>
                          {w.label}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit_weather" className="text-sm font-medium">Weather Details</Label>
                <Input
                  id="edit_weather"
                  placeholder="Sunny, 75°F"
                  value={editedTrip.weather || ''}
                  onChange={(e) => setEditedTrip({ ...editedTrip, weather: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="edit_notes" className="text-sm font-medium">Notes</Label>
                <Textarea
                  id="edit_notes"
                  value={editedTrip.notes || ''}
                  onChange={(e) => setEditedTrip({ ...editedTrip, notes: e.target.value })}
                  className="mt-1 h-20"
                />
              </div>
            </div>
          )}
          <div className="flex gap-3 mt-6">
            <Button
              variant="outline"
              onClick={() => setShowEditTrip(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={() => updateTripMutation.mutate(editedTrip)}
              disabled={updateTripMutation.isPending}
              className="flex-1 bg-blue-500 hover:bg-blue-600 text-white"
            >
              {updateTripMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}