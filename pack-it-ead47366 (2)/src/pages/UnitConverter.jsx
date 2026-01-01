import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ArrowLeft, ArrowRightLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const CONVERSIONS = {
  temperature: {
    celsius: {
      fahrenheit: (val) => (val * 9/5) + 32,
      kelvin: (val) => val + 273.15
    },
    fahrenheit: {
      celsius: (val) => (val - 32) * 5/9,
      kelvin: (val) => (val - 32) * 5/9 + 273.15
    },
    kelvin: {
      celsius: (val) => val - 273.15,
      fahrenheit: (val) => (val - 273.15) * 9/5 + 32
    }
  },
  weight: {
    kg: {
      lb: (val) => val * 2.20462,
      oz: (val) => val * 35.274,
      g: (val) => val * 1000
    },
    lb: {
      kg: (val) => val / 2.20462,
      oz: (val) => val * 16,
      g: (val) => val * 453.592
    },
    oz: {
      kg: (val) => val / 35.274,
      lb: (val) => val / 16,
      g: (val) => val * 28.3495
    },
    g: {
      kg: (val) => val / 1000,
      lb: (val) => val / 453.592,
      oz: (val) => val / 28.3495
    }
  },
  distance: {
    km: {
      mi: (val) => val * 0.621371,
      m: (val) => val * 1000,
      ft: (val) => val * 3280.84
    },
    mi: {
      km: (val) => val / 0.621371,
      m: (val) => val * 1609.34,
      ft: (val) => val * 5280
    },
    m: {
      km: (val) => val / 1000,
      mi: (val) => val / 1609.34,
      ft: (val) => val * 3.28084
    },
    ft: {
      km: (val) => val / 3280.84,
      mi: (val) => val / 5280,
      m: (val) => val / 3.28084
    }
  }
};

const UNIT_LABELS = {
  temperature: {
    celsius: "Celsius (°C)",
    fahrenheit: "Fahrenheit (°F)",
    kelvin: "Kelvin (K)"
  },
  weight: {
    kg: "Kilograms (kg)",
    lb: "Pounds (lb)",
    oz: "Ounces (oz)",
    g: "Grams (g)"
  },
  distance: {
    km: "Kilometers (km)",
    mi: "Miles (mi)",
    m: "Meters (m)",
    ft: "Feet (ft)"
  }
};

export default function UnitConverter() {
  const navigate = useNavigate();
  const [category, setCategory] = useState("temperature");
  const [fromUnit, setFromUnit] = useState("celsius");
  const [toUnit, setToUnit] = useState("fahrenheit");
  const [value, setValue] = useState("");

  const handleCategoryChange = (newCategory) => {
    setCategory(newCategory);
    const units = Object.keys(CONVERSIONS[newCategory]);
    setFromUnit(units[0]);
    setToUnit(units[1]);
    setValue("");
  };

  const convert = () => {
    const numValue = parseFloat(value);
    if (isNaN(numValue)) return 0;
    if (fromUnit === toUnit) return numValue;
    
    const converter = CONVERSIONS[category][fromUnit][toUnit];
    return converter ? converter(numValue) : 0;
  };

  const result = convert();

  const swapUnits = () => {
    const temp = fromUnit;
    setFromUnit(toUnit);
    setToUnit(temp);
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
          <h1 className="text-2xl font-bold text-gray-900">Unit Converter</h1>
          <p className="text-sm text-gray-500">Convert measurements easily</p>
        </div>
      </div>

      {/* Category Tabs */}
      <Tabs value={category} onValueChange={handleCategoryChange}>
        <TabsList className="grid w-full grid-cols-3 bg-white shadow-md p-1 h-auto">
          <TabsTrigger value="temperature" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-red-500 data-[state=active]:text-white py-3">
            🌡️ Temp
          </TabsTrigger>
          <TabsTrigger value="weight" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white py-3">
            ⚖️ Weight
          </TabsTrigger>
          <TabsTrigger value="distance" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white py-3">
            📏 Distance
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Converter */}
      <Card className="bg-white rounded-2xl p-6 shadow-md space-y-6">
        {/* From */}
        <div>
          <Label className="text-sm font-medium mb-2 block">From</Label>
          <Select value={fromUnit} onValueChange={setFromUnit}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.keys(CONVERSIONS[category]).map((unit) => (
                <SelectItem key={unit} value={unit}>
                  {UNIT_LABELS[category][unit]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            type="number"
            placeholder="Enter value"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="mt-3 h-14 text-2xl text-center font-semibold"
          />
        </div>

        {/* Swap Button */}
        <div className="flex justify-center">
          <Button
            variant="outline"
            size="icon"
            onClick={swapUnits}
            className="rounded-full w-12 h-12 border-2 hover:bg-blue-50 hover:border-blue-500"
          >
            <ArrowRightLeft className="w-5 h-5" />
          </Button>
        </div>

        {/* To */}
        <div>
          <Label className="text-sm font-medium mb-2 block">To</Label>
          <Select value={toUnit} onValueChange={setToUnit}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.keys(CONVERSIONS[category])
                .filter(unit => unit !== fromUnit)
                .map((unit) => (
                  <SelectItem key={unit} value={unit}>
                    {UNIT_LABELS[category][unit]}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
          <div className="mt-3 h-14 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <span className="text-2xl font-bold text-white">
              {value ? result.toFixed(2) : "0"}
            </span>
          </div>
        </div>
      </Card>

      {/* Quick Reference */}
      <Card className="bg-blue-50 rounded-2xl p-6 border border-blue-100">
        <h3 className="font-semibold text-gray-900 mb-3">Quick Reference</h3>
        <div className="space-y-2 text-sm text-gray-700">
          {category === "temperature" && (
            <>
              <p>• Water freezes: 0°C = 32°F</p>
              <p>• Room temp: 20°C = 68°F</p>
              <p>• Body temp: 37°C = 98.6°F</p>
              <p>• Water boils: 100°C = 212°F</p>
            </>
          )}
          {category === "weight" && (
            <>
              <p>• 1 kg = 2.2 lbs</p>
              <p>• 1 lb = 16 oz</p>
              <p>• Luggage limit (typical): 23 kg = 50 lbs</p>
            </>
          )}
          {category === "distance" && (
            <>
              <p>• 1 mile = 1.6 km</p>
              <p>• 1 km = 0.62 miles</p>
              <p>• Marathon: 42.2 km = 26.2 miles</p>
            </>
          )}
        </div>
      </Card>
    </div>
  );
}