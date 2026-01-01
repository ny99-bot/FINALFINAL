import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ArrowLeft, ArrowRightLeft, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const CURRENCIES = [
  { code: "USD", name: "US Dollar", symbol: "$" },
  { code: "EUR", name: "Euro", symbol: "€" },
  { code: "GBP", name: "British Pound", symbol: "£" },
  { code: "JPY", name: "Japanese Yen", symbol: "¥" },
  { code: "CNY", name: "Chinese Yuan", symbol: "¥" },
  { code: "INR", name: "Indian Rupee", symbol: "₹" },
  { code: "AUD", name: "Australian Dollar", symbol: "A$" },
  { code: "CAD", name: "Canadian Dollar", symbol: "C$" },
  { code: "CHF", name: "Swiss Franc", symbol: "Fr" },
  { code: "MXN", name: "Mexican Peso", symbol: "Mex$" },
  { code: "BRL", name: "Brazilian Real", symbol: "R$" },
  { code: "ZAR", name: "South African Rand", symbol: "R" },
  { code: "KRW", name: "South Korean Won", symbol: "₩" },
  { code: "SGD", name: "Singapore Dollar", symbol: "S$" },
  { code: "THB", name: "Thai Baht", symbol: "฿" }
];

export default function CurrencyConverter() {
  const navigate = useNavigate();
  const [fromCurrency, setFromCurrency] = useState("USD");
  const [toCurrency, setToCurrency] = useState("EUR");
  const [amount, setAmount] = useState("");
  const [rate, setRate] = useState("0.92");

  const convert = () => {
    const numAmount = parseFloat(amount) || 0;
    const numRate = parseFloat(rate) || 0;
    return numAmount * numRate;
  };

  const swapCurrencies = () => {
    const temp = fromCurrency;
    setFromCurrency(toCurrency);
    setToCurrency(temp);
    if (rate) {
      setRate((1 / parseFloat(rate)).toFixed(6));
    }
  };

  const fromSymbol = CURRENCIES.find(c => c.code === fromCurrency)?.symbol || "";
  const toSymbol = CURRENCIES.find(c => c.code === toCurrency)?.symbol || "";

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
          <h1 className="text-2xl font-bold text-gray-900">Currency Converter</h1>
          <p className="text-sm text-gray-500">Offline converter with custom rates</p>
        </div>
      </div>

      {/* Info Card */}
      <Card className="bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl p-6 text-white shadow-xl">
        <div className="flex items-start gap-3">
          <DollarSign className="w-6 h-6 flex-shrink-0 mt-1" />
          <div>
            <h3 className="font-semibold mb-2">Enter Your Own Rate</h3>
            <p className="text-sm text-white/90">
              This works offline! Look up the current exchange rate online, enter it below, 
              and use it anytime during your trip.
            </p>
          </div>
        </div>
      </Card>

      {/* Converter */}
      <Card className="bg-white rounded-2xl p-6 shadow-md space-y-6">
        {/* From Currency */}
        <div>
          <Label className="text-sm font-medium mb-2 block">From</Label>
          <Select value={fromCurrency} onValueChange={setFromCurrency}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CURRENCIES.map((currency) => (
                <SelectItem key={currency.code} value={currency.code}>
                  {currency.symbol} {currency.code} - {currency.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="relative mt-3">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl text-gray-400">
              {fromSymbol}
            </span>
            <Input
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="pl-12 h-14 text-2xl text-center font-semibold"
            />
          </div>
        </div>

        {/* Exchange Rate */}
        <div className="border-t border-b border-gray-200 py-4">
          <Label className="text-sm font-medium mb-2 block">Exchange Rate</Label>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600 whitespace-nowrap">1 {fromCurrency} =</span>
            <Input
              type="number"
              step="0.000001"
              placeholder="0.00"
              value={rate}
              onChange={(e) => setRate(e.target.value)}
              className="flex-1 h-10 text-center font-semibold"
            />
            <span className="text-sm text-gray-600 whitespace-nowrap">{toCurrency}</span>
          </div>
          <p className="text-xs text-gray-500 mt-2 text-center">
            Look up rates on Google or XE.com before your trip
          </p>
        </div>

        {/* Swap Button */}
        <div className="flex justify-center -my-2">
          <Button
            variant="outline"
            size="icon"
            onClick={swapCurrencies}
            className="rounded-full w-12 h-12 border-2 hover:bg-blue-50 hover:border-blue-500"
          >
            <ArrowRightLeft className="w-5 h-5" />
          </Button>
        </div>

        {/* To Currency */}
        <div>
          <Label className="text-sm font-medium mb-2 block">To</Label>
          <Select value={toCurrency} onValueChange={setToCurrency}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CURRENCIES.filter(c => c.code !== fromCurrency).map((currency) => (
                <SelectItem key={currency.code} value={currency.code}>
                  {currency.symbol} {currency.code} - {currency.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="mt-3 h-14 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center relative">
            <span className="absolute left-4 text-2xl text-white/80">
              {toSymbol}
            </span>
            <span className="text-2xl font-bold text-white">
              {amount && rate ? convert().toFixed(2) : "0.00"}
            </span>
          </div>
        </div>
      </Card>

      {/* Quick Reference */}
      <Card className="bg-blue-50 rounded-2xl p-6 border border-blue-100">
        <h3 className="font-semibold text-gray-900 mb-3">💡 How to Use</h3>
        <div className="space-y-2 text-sm text-gray-700">
          <p>1. Look up the current exchange rate online (e.g., "1 USD to EUR")</p>
          <p>2. Enter that rate in the middle field</p>
          <p>3. Enter any amount to convert instantly</p>
          <p>4. Works offline once you've set the rate!</p>
        </div>
      </Card>
    </div>
  );
}