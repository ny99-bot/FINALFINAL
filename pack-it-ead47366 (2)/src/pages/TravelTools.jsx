import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Calculator, Plug, Scale, DollarSign, Droplet, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

const tools = [
  {
    name: "Tip Calculator",
    description: "Calculate tips for different countries",
    icon: Calculator,
    path: "TipCalculator",
    color: "from-blue-500 to-cyan-500"
  },
  {
    name: "Currency Converter",
    description: "Convert currencies with custom rates",
    icon: DollarSign,
    path: "CurrencyConverter",
    color: "from-green-500 to-emerald-500"
  },
  {
    name: "Plug Guide",
    description: "Find plug types and voltages worldwide",
    icon: Plug,
    path: "PlugGuide",
    color: "from-purple-500 to-pink-500"
  },
  {
    name: "Unit Converter",
    description: "Convert weights, temperatures & distances",
    icon: Scale,
    path: "UnitConverter",
    color: "from-orange-500 to-red-500"
  },
  {
    name: "Liquid Checker",
    description: "Check carry-on liquid allowances",
    icon: Droplet,
    path: "LiquidChecker",
    color: "from-cyan-500 to-blue-500"
  },
  {
    name: "Emergency Info",
    description: "Store important emergency contacts",
    icon: AlertCircle,
    path: "EmergencyInfo",
    color: "from-red-500 to-orange-500"
  }
];

export default function TravelTools() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-500 via-blue-500 to-purple-500 rounded-3xl p-8 text-white shadow-xl">
        <h1 className="text-3xl font-bold mb-2">Travel Tools</h1>
        <p className="text-white/80">Helpful utilities for your journey</p>
      </div>

      {/* Tools Grid */}
      <div className="grid gap-4">
        {tools.map((tool, index) => {
          const Icon = tool.icon;
          return (
            <motion.div
              key={tool.path}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link to={createPageUrl(tool.path)}>
                <div className="bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-blue-200">
                  <div className="flex items-start gap-4">
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${tool.color} flex items-center justify-center shadow-lg flex-shrink-0`}>
                      <Icon className="w-7 h-7 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-1">{tool.name}</h3>
                      <p className="text-gray-600 text-sm">{tool.description}</p>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>

      {/* Info Card */}
      <div className="bg-blue-50 rounded-2xl p-6 border border-blue-100">
        <p className="text-sm text-gray-700">
          <strong>💡 Pro Tip:</strong> All tools work completely offline. Your data never leaves your device!
        </p>
      </div>
    </div>
  );
}