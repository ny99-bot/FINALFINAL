import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { BarChart3, MapPin, Calendar, Package, TrendingUp } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Cell, Pie, PieChart, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";
import { differenceInDays } from "date-fns";

export default function Statistics() {
  const { data: trips = [] } = useQuery({
    queryKey: ['trips'],
    queryFn: () => base44.entities.Trip.list(),
    initialData: []
  });

  const { data: items = [] } = useQuery({
    queryKey: ['allPackingItems'],
    queryFn: () => base44.entities.PackingItem.list(),
    initialData: []
  });

  // Most visited destinations
  const destinationCounts = trips.reduce((acc, trip) => {
    const dest = trip.destination || "Unknown";
    acc[dest] = (acc[dest] || 0) + 1;
    return acc;
  }, {});

  const topDestinations = Object.entries(destinationCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // Average trip duration
  const tripDurations = trips
    .filter(t => t.end_date)
    .map(t => differenceInDays(new Date(t.end_date), new Date(t.start_date)));
  
  const avgDuration = tripDurations.length > 0 
    ? Math.round(tripDurations.reduce((sum, d) => sum + d, 0) / tripDurations.length)
    : 0;

  // Packing efficiency
  const packingEfficiencies = trips.map(trip => {
    const tripItems = items.filter(item => item.trip_id === trip.id);
    if (tripItems.length === 0) return 0;
    const packed = tripItems.filter(item => item.is_packed).length;
    return Math.round((packed / tripItems.length) * 100);
  }).filter(eff => eff > 0);

  const avgEfficiency = packingEfficiencies.length > 0
    ? Math.round(packingEfficiencies.reduce((sum, e) => sum + e, 0) / packingEfficiencies.length)
    : 0;

  // Category breakdown
  const categoryBreakdown = items.reduce((acc, item) => {
    const cat = item.category || "other";
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {});

  const categoryData = Object.entries(categoryBreakdown).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value
  }));

  const COLORS = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ec4899', '#14b8a6', '#6b7280'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-3xl p-8 text-white shadow-xl">
        <div className="flex items-center gap-2 mb-2">
          <BarChart3 className="w-6 h-6" />
          <span className="text-sm font-medium opacity-90">Insights</span>
        </div>
        <h1 className="text-3xl font-bold mb-2">Travel Statistics</h1>
        <p className="text-white/80">Your travel journey at a glance</p>
      </div>

      {trips.length === 0 ? (
        <Card className="bg-white rounded-2xl p-12 shadow-md text-center">
          <BarChart3 className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Data Yet</h3>
          <p className="text-gray-500">Create some trips to see your travel statistics!</p>
        </Card>
      ) : (
        <>
          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="bg-white rounded-2xl p-6 shadow-md">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-blue-600" />
                </div>
              </div>
              <div className="text-3xl font-bold text-gray-900">{trips.length}</div>
              <div className="text-sm text-gray-500">Total Trips</div>
            </Card>

            <Card className="bg-white rounded-2xl p-6 shadow-md">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-green-600" />
                </div>
              </div>
              <div className="text-3xl font-bold text-gray-900">{avgDuration}</div>
              <div className="text-sm text-gray-500">Avg Days/Trip</div>
            </Card>

            <Card className="bg-white rounded-2xl p-6 shadow-md">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Package className="w-5 h-5 text-purple-600" />
                </div>
              </div>
              <div className="text-3xl font-bold text-gray-900">{items.length}</div>
              <div className="text-sm text-gray-500">Items Packed</div>
            </Card>

            <Card className="bg-white rounded-2xl p-6 shadow-md">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-orange-600" />
                </div>
              </div>
              <div className="text-3xl font-bold text-gray-900">{avgEfficiency}%</div>
              <div className="text-sm text-gray-500">Packing Efficiency</div>
            </Card>
          </div>

          {/* Top Destinations */}
          {topDestinations.length > 0 && (
            <Card className="bg-white rounded-2xl p-6 shadow-md">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-blue-500" />
                Top Destinations
              </h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={topDestinations}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          )}

          {/* Packing Category Breakdown */}
          {categoryData.length > 0 && (
            <Card className="bg-white rounded-2xl p-6 shadow-md">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Package className="w-5 h-5 text-purple-500" />
                Items by Category
              </h2>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Card>
          )}

          {/* Insights */}
          <Card className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-6 shadow-md border-2 border-blue-200">
            <h2 className="text-xl font-bold text-gray-900 mb-4">📊 Insights</h2>
            <div className="space-y-3 text-sm text-gray-700">
              {topDestinations[0] && (
                <p>• Your favorite destination is <strong>{topDestinations[0].name}</strong> with {topDestinations[0].count} trip{topDestinations[0].count > 1 ? 's' : ''}</p>
              )}
              {avgDuration > 0 && (
                <p>• Your trips typically last <strong>{avgDuration} days</strong></p>
              )}
              {avgEfficiency > 0 && (
                <p>• You pack with an average efficiency of <strong>{avgEfficiency}%</strong></p>
              )}
              {items.length > 0 && (
                <p>• You've packed a total of <strong>{items.length} items</strong> across all trips</p>
              )}
            </div>
          </Card>
        </>
      )}
    </div>
  );
}