import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { CheckCircle, ArrowRight, Forward } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { format } from "date-fns";

export default function TripSetup() {
  const navigate = useNavigate();
  const urlParams = new URLSearchParams(window.location.search);
  const tripId = urlParams.get('id');

  const { data: trip, isLoading } = useQuery({
    queryKey: ['trip', tripId],
    queryFn: async () => {
      const trips = await base44.entities.Trip.list();
      return trips.find(t => t.id === tripId);
    },
    enabled: !!tripId
  });

  if (isLoading) {
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

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Success Header */}
      <div className="text-center py-8">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-12 h-12 text-green-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Trip Created!</h1>
        <p className="text-gray-600">Let's set up your packing list</p>
      </div>

      {/* Trip Summary Card */}
      <Card className="bg-white rounded-2xl p-6 shadow-md">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Trip Summary</h2>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-600">Destination</span>
            <span className="font-semibold text-gray-900">{trip.destination}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Dates</span>
            <span className="font-semibold text-gray-900">
              {format(new Date(trip.start_date), 'MMM d')}
              {trip.end_date && ` - ${format(new Date(trip.end_date), 'MMM d, yyyy')}`}
            </span>
          </div>
          {trip.weather_emoji && (
            <div className="flex justify-between">
              <span className="text-gray-600">Weather</span>
              <span className="text-2xl">{trip.weather_emoji}</span>
            </div>
          )}
          {trip.notes && (
            <div className="pt-3 border-t">
              <span className="text-gray-600 block mb-2">Notes</span>
              <p className="text-sm text-gray-700">{trip.notes}</p>
            </div>
          )}
        </div>
      </Card>

      {/* Action Buttons */}
      <div className="space-y-3">
        <Button
          onClick={() => navigate(`${createPageUrl("TripItemsInput")}?id=${tripId}`)}
          className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg h-14 text-base font-semibold"
        >
          Continue to Add Items
          <ArrowRight className="w-5 h-5 ml-2" />
        </Button>
        <Button
          onClick={() => navigate(`${createPageUrl("TripSetupChecklist")}?id=${tripId}`)}
          variant="outline"
          className="w-full h-12"
        >
          <Forward className="w-4 h-4 mr-2" />
          Skip to Empty Checklist
        </Button>
      </div>
    </div>
  );
}