import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ArrowLeft, Users, DollarSign, Percent } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";

const TIP_STANDARDS = {
  "USA": { standard: 20, range: "15-25%" },
  "Canada": { standard: 15, range: "15-20%" },
  "UK": { standard: 10, range: "10-15%" },
  "France": { standard: 0, range: "Service included" },
  "Germany": { standard: 10, range: "5-10%" },
  "Italy": { standard: 0, range: "Service included" },
  "Spain": { standard: 10, range: "5-10%" },
  "Japan": { standard: 0, range: "Not customary" },
  "Australia": { standard: 10, range: "10-15%" },
  "Mexico": { standard: 15, range: "10-15%" },
  "Brazil": { standard: 10, range: "10%" },
  "India": { standard: 10, range: "10%" },
  "China": { standard: 0, range: "Not customary" },
  "Thailand": { standard: 0, range: "Optional" }
};

export default function TipCalculator() {
  const navigate = useNavigate();
  const [billAmount, setBillAmount] = useState("");
  const [tipPercent, setTipPercent] = useState(20);
  const [splitCount, setSplitCount] = useState(1);
  const [country, setCountry] = useState("USA");

  const bill = parseFloat(billAmount) || 0;
  const tipAmount = (bill * tipPercent) / 100;
  const totalAmount = bill + tipAmount;
  const perPerson = splitCount > 0 ? totalAmount / splitCount : 0;

  const handleCountryChange = (newCountry) => {
    setCountry(newCountry);
    setTipPercent(TIP_STANDARDS[newCountry].standard);
  };

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
          <h1 className="text-2xl font-bold text-gray-900">Tip Calculator</h1>
          <p className="text-sm text-gray-500">Calculate tips for any country</p>
        </div>
      </div>

      {/* Country Selection */}
      <Card className="bg-white rounded-2xl p-6 shadow-md">
        <Label className="text-sm font-medium mb-2 block">Country / Region</Label>
        <Select value={country} onValueChange={handleCountryChange}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.keys(TIP_STANDARDS).map((c) => (
              <SelectItem key={c} value={c}>
                {c} - {TIP_STANDARDS[c].range}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-gray-500 mt-2">
          Standard tip: {TIP_STANDARDS[country].range}
        </p>
      </Card>

      {/* Bill Amount */}
      <Card className="bg-white rounded-2xl p-6 shadow-md">
        <Label className="text-sm font-medium mb-2 block">Bill Amount</Label>
        <div className="relative">
          <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            type="number"
            placeholder="0.00"
            value={billAmount}
            onChange={(e) => setBillAmount(e.target.value)}
            className="pl-10 text-2xl h-14 text-center font-semibold"
          />
        </div>
      </Card>

      {/* Tip Percentage */}
      <Card className="bg-white rounded-2xl p-6 shadow-md">
        <div className="flex items-center justify-between mb-4">
          <Label className="text-sm font-medium">Tip Percentage</Label>
          <span className="text-2xl font-bold text-blue-600">{tipPercent}%</span>
        </div>
        <input
          type="range"
          min="0"
          max="30"
          step="1"
          value={tipPercent}
          onChange={(e) => setTipPercent(parseInt(e.target.value))}
          className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          style={{
            background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${(tipPercent / 30) * 100}%, #e5e7eb ${(tipPercent / 30) * 100}%, #e5e7eb 100%)`
          }}
        />
        <div className="flex justify-between mt-2 text-xs text-gray-500">
          <span>0%</span>
          <span>30%</span>
        </div>
        <div className="flex gap-2 mt-4">
          {[10, 15, 20, 25].map((percent) => (
            <Button
              key={percent}
              variant="outline"
              size="sm"
              onClick={() => setTipPercent(percent)}
              className={tipPercent === percent ? "bg-blue-50 border-blue-500" : ""}
            >
              {percent}%
            </Button>
          ))}
        </div>
      </Card>

      {/* Split Bill */}
      <Card className="bg-white rounded-2xl p-6 shadow-md">
        <Label className="text-sm font-medium mb-2 block">Split Between</Label>
        <div className="relative">
          <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            type="number"
            min="1"
            value={splitCount}
            onChange={(e) => setSplitCount(parseInt(e.target.value) || 1)}
            className="pl-10 text-xl h-12 text-center font-semibold"
          />
        </div>
        <div className="flex gap-2 mt-3">
          {[1, 2, 3, 4].map((count) => (
            <Button
              key={count}
              variant="outline"
              size="sm"
              onClick={() => setSplitCount(count)}
              className={`flex-1 ${splitCount === count ? "bg-blue-50 border-blue-500" : ""}`}
            >
              {count}
            </Button>
          ))}
        </div>
      </Card>

      {/* Results */}
      <Card className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl p-6 shadow-xl text-white">
        <div className="space-y-4">
          <div className="flex justify-between items-center pb-4 border-b border-white/20">
            <span className="text-white/80">Bill Amount</span>
            <span className="text-xl font-semibold">${bill.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center pb-4 border-b border-white/20">
            <span className="text-white/80">Tip Amount ({tipPercent}%)</span>
            <span className="text-xl font-semibold">${tipAmount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center pb-4 border-b border-white/20">
            <span className="text-white/80">Total</span>
            <span className="text-2xl font-bold">${totalAmount.toFixed(2)}</span>
          </div>
          {splitCount > 1 && (
            <div className="flex justify-between items-center pt-2">
              <span className="text-white/80">Per Person</span>
              <span className="text-3xl font-bold">${perPerson.toFixed(2)}</span>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}