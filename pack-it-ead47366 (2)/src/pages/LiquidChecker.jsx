import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ArrowLeft, Droplet, Check, X, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function LiquidChecker() {
  const navigate = useNavigate();
  const [size, setSize] = useState("");
  const [unit, setUnit] = useState("ml");

  const sizeInMl = unit === "ml" ? parseFloat(size) || 0 : (parseFloat(size) || 0) * 29.5735;
  const isAllowed = sizeInMl <= 100;
  const hasValue = size !== "";

  const commonItems = [
    { name: "Travel-size shampoo", size: "100ml", allowed: true },
    { name: "Perfume sample", size: "30ml", allowed: true },
    { name: "Contact lens solution", size: "100ml", allowed: true },
    { name: "Hand sanitizer", size: "60ml", allowed: true },
    { name: "Regular shampoo bottle", size: "250ml", allowed: false },
    { name: "Full-size perfume", size: "150ml", allowed: false },
    { name: "Water bottle", size: "500ml", allowed: false }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(createPageUrl("TravelTools"))}
          className="rounded-full"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Carry-on Liquid Checker</h1>
          <p className="text-sm text-gray-500">TSA 3-1-1 Rule Helper</p>
        </div>
      </div>

      {/* Info Card */}
      <Card className="bg-gradient-to-br from-cyan-500 to-blue-500 rounded-2xl p-6 text-white shadow-xl">
        <div className="flex items-start gap-3">
          <Droplet className="w-6 h-6 flex-shrink-0 mt-1" />
          <div>
            <h3 className="font-semibold mb-2">The 3-1-1 Rule</h3>
            <p className="text-sm text-white/90 mb-3">
              <strong>3</strong> ounces (100ml) or less per container<br />
              <strong>1</strong> quart-size clear plastic bag<br />
              <strong>1</strong> bag per passenger
            </p>
            <p className="text-xs text-white/80">
              Applies to: liquids, gels, aerosols, creams, and pastes
            </p>
          </div>
        </div>
      </Card>

      {/* Checker */}
      <Card className="bg-white rounded-2xl p-6 shadow-md space-y-6">
        <div>
          <Label className="text-sm font-medium mb-2 block">Container Size</Label>
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Input
                type="number"
                placeholder="Enter size"
                value={size}
                onChange={(e) => setSize(e.target.value)}
                className="h-14 text-2xl text-center font-semibold pr-20"
              />
            </div>
            <Select value={unit} onValueChange={setUnit}>
              <SelectTrigger className="w-24 h-14">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ml">ml</SelectItem>
                <SelectItem value="oz">oz</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Result */}
        {hasValue && (
          <div className={`p-6 rounded-xl border-2 ${
            isAllowed 
              ? "bg-green-50 border-green-300" 
              : "bg-red-50 border-red-300"
          }`}>
            <div className="flex items-center gap-3 mb-2">
              {isAllowed ? (
                <>
                  <Check className="w-8 h-8 text-green-600" />
                  <div>
                    <h3 className="text-lg font-bold text-green-900">Allowed ✓</h3>
                    <p className="text-sm text-green-700">This container can go in your carry-on</p>
                  </div>
                </>
              ) : (
                <>
                  <X className="w-8 h-8 text-red-600" />
                  <div>
                    <h3 className="text-lg font-bold text-red-900">Not Allowed ✗</h3>
                    <p className="text-sm text-red-700">This container is too large for carry-on</p>
                  </div>
                </>
              )}
            </div>
            <div className="text-sm text-gray-600 mt-3 pt-3 border-t border-gray-300">
              {isAllowed ? (
                <p>Place it in your clear quart-size bag with other liquids</p>
              ) : (
                <p>Pack it in your checked luggage instead, or transfer to a smaller container (100ml or less)</p>
              )}
            </div>
          </div>
        )}
      </Card>

      {/* Common Items Reference */}
      <Card className="bg-white rounded-2xl p-6 shadow-md">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          Common Items
        </h3>
        <div className="space-y-3">
          {commonItems.map((item, index) => (
            <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
              <div className="flex-1">
                <p className="font-medium text-gray-900">{item.name}</p>
                <p className="text-sm text-gray-500">{item.size}</p>
              </div>
              {item.allowed ? (
                <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
              ) : (
                <X className="w-5 h-5 text-red-600 flex-shrink-0" />
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* Tips */}
      <Card className="bg-blue-50 rounded-2xl p-6 border border-blue-100">
        <h3 className="font-semibold text-gray-900 mb-3">✈️ Pro Tips</h3>
        <div className="space-y-2 text-sm text-gray-700">
          <p>• Buy travel-size containers (usually 50-100ml)</p>
          <p>• Use solid alternatives (bar soap, solid shampoo, stick deodorant)</p>
          <p>• Medications and baby formula are exempt from the 3-1-1 rule</p>
          <p>• Empty water bottles can pass security and be refilled inside</p>
          <p>• All liquids must fit in ONE quart-size clear bag</p>
        </div>
      </Card>
    </div>
  );
}