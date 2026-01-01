import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Plus, Calendar, MapPin, Sparkles, Copy, Trash2, ArrowUpDown, Cloud } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion, AnimatePresence } from "framer-motion";
import { format, differenceInDays, isPast, isFuture } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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

export default function Trips() {
  const navigate = useNavigate();
  const [showNewTrip, setShowNewTrip] = useState(false);
  const [sortBy, setSortBy] = useState("date");
  const [newTrip, setNewTrip] = useState({
    name: "",
    destination: "",
    start_date: "",
    end_date: "",
    notes: "",
    weather: "",
    weather_emoji: "☀️"
  });

  const queryClient = useQueryClient();

  const { data: trips = [], isLoading } = useQuery({
    queryKey: ['trips'],
    queryFn: () => base44.entities.Trip.list('-start_date'),
    initialData: []
  });

  const { data: allPackingItems = [] } = useQuery({
    queryKey: ['allPackingItems'],
    queryFn: () => base44.entities.PackingItem.list(),
    initialData: []
  });

  const createTripMutation = useMutation({
    mutationFn: (tripData) => base44.entities.Trip.create(tripData),
    onSuccess: (createdTrip) => {
      queryClient.invalidateQueries({ queryKey: ['trips'] });
      setShowNewTrip(false);
      setNewTrip({ name: "", destination: "", start_date: "", end_date: "", notes: "", weather: "", weather_emoji: "☀️" });
      navigate(`${createPageUrl("TripSetup")}?id=${createdTrip.id}`);
    }
  });

  const duplicateTripMutation = useMutation({
    mutationFn: async (trip) => {
      const newTrip = await base44.entities.Trip.create({
        name: `${trip.name} (Copy)`,
        destination: trip.destination,
        start_date: trip.start_date,
        end_date: trip.end_date,
        notes: trip.notes,
        weather: trip.weather,
        weather_emoji: trip.weather_emoji || "☀️"
      });
      
      const items = allPackingItems.filter(item => item.trip_id === trip.id);
      if (items.length > 0) {
        await base44.entities.PackingItem.bulkCreate(
          items.map(item => ({
            trip_id: newTrip.id,
            name: item.name,
            category: item.category,
            quantity: item.quantity,
            is_packed: false
          }))
        );
      }
      return newTrip;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trips'] });
      queryClient.invalidateQueries({ queryKey: ['allPackingItems'] });
    }
  });

  const deleteTripMutation = useMutation({
    mutationFn: async (tripId) => {
      const items = allPackingItems.filter(item => item.trip_id === tripId);
      for (const item of items) {
        await base44.entities.PackingItem.delete(item.id);
      }
      await base44.entities.Trip.delete(tripId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trips'] });
      queryClient.invalidateQueries({ queryKey: ['allPackingItems'] });
    }
  });

  const handleCreateTrip = () => {
    createTripMutation.mutate(newTrip);
  };

  const getTripStatus = (trip) => {
    const start = new Date(trip.start_date);
    const end = trip.end_date ? new Date(trip.end_date) : null;
    const now = new Date();

    if (end && isPast(end)) {
      return { label: "Completed", color: "bg-gray-100 text-gray-700" };
    }
    if (start <= now && (!end || end >= now)) {
      return { label: "Ongoing", color: "bg-green-100 text-green-700" };
    }
    if (isFuture(start)) {
      const days = differenceInDays(start, now);
      return { label: `${days} days away`, color: "bg-blue-100 text-blue-700" };
    }
    return { label: "Upcoming", color: "bg-blue-100 text-blue-700" };
  };

  const getPackingProgress = (tripId) => {
    const items = allPackingItems.filter(item => item.trip_id === tripId);
    if (items.length === 0) return 0;
    const packed = items.filter(item => item.is_packed).length;
    return Math.round((packed / items.length) * 100);
  };

  const sortedTrips = [...trips].sort((a, b) => {
    if (sortBy === "name") {
      return a.name.localeCompare(b.name);
    } else if (sortBy === "completion") {
      return getPackingProgress(b.id) - getPackingProgress(a.id);
    }
    return new Date(b.start_date) - new Date(a.start_date);
  });

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-500 via-purple-500 to-orange-500 rounded-3xl p-8 text-white shadow-xl">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-5 h-5" />
          <span className="text-sm font-medium opacity-90">Ready for adventure?</span>
        </div>
        <h2 className="text-3xl font-bold mb-2">My Trips</h2>
        <p className="text-white/80 mb-6">Plan your journey, pack with ease</p>
        <div className="flex gap-3 flex-wrap">
          <Button
            onClick={() => setShowNewTrip(true)}
            className="bg-white text-blue-600 hover:bg-blue-50 font-semibold shadow-lg"
          >
            <Plus className="w-5 h-5 mr-2" />
            Create New Trip
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="bg-white/10 border-white/30 text-white hover:bg-white/20">
                <ArrowUpDown className="w-4 h-4 mr-2" />
                Sort
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setSortBy("date")}>
                Sort by Date
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy("name")}>
                Sort by Name
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy("completion")}>
                Sort by Completion
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Trips List */}
      {isLoading ? (
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-2xl p-6 shadow-md animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      ) : trips.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <MapPin className="w-12 h-12 text-blue-500" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No trips yet</h3>
          <p className="text-gray-500 mb-6">Start planning your next adventure!</p>
          <Button
            onClick={() => setShowNewTrip(true)}
            className="bg-blue-500 hover:bg-blue-600 text-white"
          >
            <Plus className="w-5 h-5 mr-2" />
            Create Your First Trip
          </Button>
        </div>
      ) : (
        <div className="grid gap-4">
          <AnimatePresence>
            {sortedTrips.map((trip, index) => {
              const status = getTripStatus(trip);
              const progress = getPackingProgress(trip.id);
              return (
                <motion.div
                  key={trip.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <div className="bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-blue-200">
                    <div className="flex gap-4">
                      {/* Weather Emoji & Progress Ring */}
                      <div className="flex-shrink-0 flex flex-col items-center gap-2">
                        {trip.weather_emoji && (
                          <div className="text-3xl">{trip.weather_emoji}</div>
                        )}
                        <Link to={`${createPageUrl("TripDetails")}?id=${trip.id}`}>
                          <div className="relative w-16 h-16">
                            <svg className="transform -rotate-90 w-16 h-16">
                              <circle
                                cx="32"
                                cy="32"
                                r="28"
                                stroke="currentColor"
                                strokeWidth="6"
                                fill="none"
                                className="text-gray-200"
                              />
                              <circle
                                cx="32"
                                cy="32"
                                r="28"
                                stroke="currentColor"
                                strokeWidth="6"
                                fill="none"
                                strokeDasharray={`${2 * Math.PI * 28}`}
                                strokeDashoffset={`${2 * Math.PI * 28 * (1 - progress / 100)}`}
                                className={`transition-all duration-500 ${
                                  progress === 100 ? "text-green-500" : "text-blue-500"
                                }`}
                                strokeLinecap="round"
                              />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center">
                              <span className="text-sm font-bold text-gray-700">{progress}%</span>
                            </div>
                          </div>
                        </Link>
                      </div>

                      {/* Trip Info */}
                      <div className="flex-1 min-w-0">
                        <Link to={`${createPageUrl("TripDetails")}?id=${trip.id}`}>
                          <h3 className="text-xl font-bold text-gray-900 mb-1 truncate">{trip.name}</h3>
                          <div className="flex items-center gap-2 text-gray-600 mb-2">
                            <MapPin className="w-4 h-4 flex-shrink-0" />
                            <span className="text-sm truncate">{trip.destination}</span>
                          </div>
                          <div className="flex items-center justify-between flex-wrap gap-2">
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                              <Calendar className="w-4 h-4" />
                              <span>
                                {format(new Date(trip.start_date), 'MMM d')}
                                {trip.end_date && ` - ${format(new Date(trip.end_date), 'MMM d, yyyy')}`}
                              </span>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${status.color}`}>
                              {status.label}
                            </span>
                          </div>
                        </Link>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            duplicateTripMutation.mutate(trip);
                          }}
                          className="hover:bg-blue-50"
                          title="Duplicate trip"
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (confirm(`Delete "${trip.name}"? This will also delete all packing items.`)) {
                              deleteTripMutation.mutate(trip.id);
                            }
                          }}
                          className="hover:bg-red-50 text-red-500"
                          title="Delete trip"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Create Trip Dialog */}
      <Dialog open={showNewTrip} onOpenChange={setShowNewTrip}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Create New Trip</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Label htmlFor="name" className="text-sm font-medium">Trip Name</Label>
              <Input
                id="name"
                placeholder="Summer Vacation 2025"
                value={newTrip.name}
                onChange={(e) => setNewTrip({ ...newTrip, name: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="destination" className="text-sm font-medium">Destination</Label>
              <Input
                id="destination"
                placeholder="Paris, France"
                value={newTrip.destination}
                onChange={(e) => setNewTrip({ ...newTrip, destination: e.target.value })}
                className="mt-1"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="start_date" className="text-sm font-medium">Start Date</Label>
                <Input
                  id="start_date"
                  type="date"
                  value={newTrip.start_date}
                  onChange={(e) => setNewTrip({ ...newTrip, start_date: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="end_date" className="text-sm font-medium">End Date</Label>
                <Input
                  id="end_date"
                  type="date"
                  value={newTrip.end_date}
                  onChange={(e) => setNewTrip({ ...newTrip, end_date: e.target.value })}
                  className="mt-1"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="weather_emoji" className="text-sm font-medium">Weather</Label>
              <Select
                value={newTrip.weather_emoji}
                onValueChange={(value) => setNewTrip({ ...newTrip, weather_emoji: value })}
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
              <Label htmlFor="weather" className="text-sm font-medium">Weather Details (optional)</Label>
              <Input
                id="weather"
                placeholder="Sunny, 75°F"
                value={newTrip.weather}
                onChange={(e) => setNewTrip({ ...newTrip, weather: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="notes" className="text-sm font-medium">Notes (optional)</Label>
              <Textarea
                id="notes"
                placeholder="Any special plans or reminders..."
                value={newTrip.notes}
                onChange={(e) => setNewTrip({ ...newTrip, notes: e.target.value })}
                className="mt-1 h-20"
              />
            </div>
          </div>
          <div className="flex gap-3 mt-6">
            <Button
              variant="outline"
              onClick={() => setShowNewTrip(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateTrip}
              disabled={!newTrip.name || !newTrip.destination || !newTrip.start_date || createTripMutation.isPending}
              className="flex-1 bg-blue-500 hover:bg-blue-600 text-white"
            >
              {createTripMutation.isPending ? "Creating..." : "Create Trip"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}