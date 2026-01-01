import React from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { CheckCircle, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function TripSetupDone() {
  const navigate = useNavigate();

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center space-y-6 max-w-md mx-auto px-4">
        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle className="w-16 h-16 text-green-600" />
        </div>
        
        <h1 className="text-4xl font-bold text-gray-900">You're All Set!</h1>
        
        <p className="text-lg text-gray-600">
          Your trip is ready. You can always come back to update your packing list.
        </p>

        <div className="pt-6">
          <Button
            onClick={() => navigate(createPageUrl("Trips"))}
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg h-14 px-8 text-base font-semibold"
          >
            <Home className="w-5 h-5 mr-2" />
            Back to Home
          </Button>
        </div>
      </div>
    </div>
  );
}