import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ArrowLeft, Search, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

const PLUG_DATA = [
  { country: "USA", types: ["A", "B"], voltage: "120V", frequency: "60Hz" },
  { country: "Canada", types: ["A", "B"], voltage: "120V", frequency: "60Hz" },
  { country: "Mexico", types: ["A", "B"], voltage: "127V", frequency: "60Hz" },
  { country: "UK", types: ["G"], voltage: "230V", frequency: "50Hz" },
  { country: "Ireland", types: ["G"], voltage: "230V", frequency: "50Hz" },
  { country: "France", types: ["C", "E"], voltage: "230V", frequency: "50Hz" },
  { country: "Germany", types: ["C", "F"], voltage: "230V", frequency: "50Hz" },
  { country: "Italy", types: ["C", "F", "L"], voltage: "230V", frequency: "50Hz" },
  { country: "Spain", types: ["C", "F"], voltage: "230V", frequency: "50Hz" },
  { country: "Netherlands", types: ["C", "F"], voltage: "230V", frequency: "50Hz" },
  { country: "Belgium", types: ["C", "E"], voltage: "230V", frequency: "50Hz" },
  { country: "Switzerland", types: ["C", "J"], voltage: "230V", frequency: "50Hz" },
  { country: "Austria", types: ["C", "F"], voltage: "230V", frequency: "50Hz" },
  { country: "Greece", types: ["C", "F"], voltage: "230V", frequency: "50Hz" },
  { country: "Portugal", types: ["C", "F"], voltage: "230V", frequency: "50Hz" },
  { country: "Japan", types: ["A", "B"], voltage: "100V", frequency: "50/60Hz" },
  { country: "China", types: ["A", "C", "I"], voltage: "220V", frequency: "50Hz" },
  { country: "South Korea", types: ["C", "F"], voltage: "220V", frequency: "60Hz" },
  { country: "Thailand", types: ["A", "B", "C"], voltage: "220V", frequency: "50Hz" },
  { country: "Vietnam", types: ["A", "C"], voltage: "220V", frequency: "50Hz" },
  { country: "India", types: ["C", "D", "M"], voltage: "230V", frequency: "50Hz" },
  { country: "Australia", types: ["I"], voltage: "230V", frequency: "50Hz" },
  { country: "New Zealand", types: ["I"], voltage: "230V", frequency: "50Hz" },
  { country: "Brazil", types: ["C", "N"], voltage: "127/220V", frequency: "60Hz" },
  { country: "Argentina", types: ["C", "I"], voltage: "220V", frequency: "50Hz" },
  { country: "South Africa", types: ["C", "D", "M", "N"], voltage: "230V", frequency: "50Hz" },
  { country: "Egypt", types: ["C", "F"], voltage: "220V", frequency: "50Hz" },
  { country: "Turkey", types: ["C", "F"], voltage: "230V", frequency: "50Hz" },
  { country: "UAE", types: ["C", "D", "G"], voltage: "220V", frequency: "50Hz" },
  { country: "Singapore", types: ["G"], voltage: "230V", frequency: "50Hz" },
  { country: "Malaysia", types: ["G"], voltage: "240V", frequency: "50Hz" },
  { country: "Indonesia", types: ["C", "F"], voltage: "230V", frequency: "50Hz" },
  { country: "Philippines", types: ["A", "B", "C"], voltage: "220V", frequency: "60Hz" },
  { country: "Russia", types: ["C", "F"], voltage: "230V", frequency: "50Hz" },
  { country: "Poland", types: ["C", "E"], voltage: "230V", frequency: "50Hz" },
  { country: "Czech Republic", types: ["C", "E"], voltage: "230V", frequency: "50Hz" },
  { country: "Hungary", types: ["C", "F"], voltage: "230V", frequency: "50Hz" },
  { country: "Sweden", types: ["C", "F"], voltage: "230V", frequency: "50Hz" },
  { country: "Norway", types: ["C", "F"], voltage: "230V", frequency: "50Hz" },
  { country: "Denmark", types: ["C", "E", "F", "K"], voltage: "230V", frequency: "50Hz" },
  { country: "Finland", types: ["C", "F"], voltage: "230V", frequency: "50Hz" }
];

const PLUG_DESCRIPTIONS = {
  "A": "2 flat parallel pins (North American)",
  "B": "2 flat parallel pins + grounding pin",
  "C": "2 round pins (European)",
  "D": "3 round pins (Indian)",
  "E": "2 round pins + hole for ground (French)",
  "F": "2 round pins + clips (German)",
  "G": "3 rectangular pins (British)",
  "I": "3 flat pins (Australian/Chinese)",
  "J": "3 round pins (Swiss)",
  "K": "3 round pins (Danish)",
  "L": "3 round pins (Italian)",
  "M": "3 large round pins (South African)",
  "N": "3 round pins (Brazilian)"
};

export default function PlugGuide() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const filteredData = PLUG_DATA.filter(item =>
    item.country.toLowerCase().includes(search.toLowerCase())
  );

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
          <h1 className="text-2xl font-bold text-gray-900">Plug & Voltage Guide</h1>
          <p className="text-sm text-gray-500">Find plug types worldwide</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <Input
          type="text"
          placeholder="Search country..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 h-12 text-base"
        />
      </div>

      {/* Info Card */}
      <Card className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl p-6 text-white shadow-xl">
        <div className="flex items-start gap-3">
          <Zap className="w-6 h-6 flex-shrink-0 mt-1" />
          <div>
            <h3 className="font-semibold mb-2">Travel Adapter Tip</h3>
            <p className="text-sm text-white/90">
              Consider getting a universal travel adapter that works in multiple countries. 
              Always check if your devices support dual voltage (110-240V).
            </p>
          </div>
        </div>
      </Card>

      {/* Countries List */}
      <div className="space-y-3">
        {filteredData.map((item) => (
          <Card key={item.country} className="bg-white rounded-xl p-5 shadow-md border border-gray-100">
            <div className="flex justify-between items-start mb-3">
              <h3 className="text-lg font-bold text-gray-900">{item.country}</h3>
              <div className="flex gap-2">
                {item.types.map((type) => (
                  <span
                    key={type}
                    className="px-2 py-1 bg-blue-100 text-blue-700 rounded-md text-xs font-bold"
                  >
                    Type {type}
                  </span>
                ))}
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-gray-600">
                <Zap className="w-4 h-4" />
                <span className="font-medium">Voltage:</span>
                <span>{item.voltage}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <span className="font-medium">Frequency:</span>
                <span>{item.frequency}</span>
              </div>
              <div className="pt-2 border-t border-gray-100">
                {item.types.map((type) => (
                  <div key={type} className="text-xs text-gray-500 mb-1">
                    <strong>Type {type}:</strong> {PLUG_DESCRIPTIONS[type]}
                  </div>
                ))}
              </div>
            </div>
          </Card>
        ))}
        {filteredData.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No countries found matching "{search}"</p>
          </div>
        )}
      </div>
    </div>
  );
}