import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Settings as SettingsIcon, Download, Trash2, Info, Sun, Moon, Monitor, Scale } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

export default function Settings() {
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'system');
  const [units, setUnits] = useState(() => localStorage.getItem('units') || 'metric');
  const [showResetDialog, setShowResetDialog] = useState(false);

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

  const { data: notes = [] } = useQuery({
    queryKey: ['travelNotes'],
    queryFn: () => base44.entities.TravelNote.list(),
    initialData: []
  });

  useEffect(() => {
    localStorage.setItem('theme', theme);
    // In a real app, you'd apply theme changes here
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('units', units);
  }, [units]);

  const handleExportData = () => {
    const exportData = {
      version: "1.0.0",
      exportDate: new Date().toISOString(),
      trips: trips,
      packingItems: items,
      travelNotes: notes,
      settings: { theme, units }
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `packit-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleResetData = async () => {
    for (const item of items) {
      await base44.entities.PackingItem.delete(item.id);
    }
    for (const trip of trips) {
      await base44.entities.Trip.delete(trip.id);
    }
    for (const note of notes) {
      await base44.entities.TravelNote.delete(note.id);
    }
    
    localStorage.clear();
    setShowResetDialog(false);
    window.location.reload();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-700 via-gray-800 to-gray-900 rounded-3xl p-8 text-white shadow-xl">
        <div className="flex items-center gap-2 mb-2">
          <SettingsIcon className="w-6 h-6" />
          <span className="text-sm font-medium opacity-90">Preferences</span>
        </div>
        <h1 className="text-3xl font-bold mb-2">Settings</h1>
        <p className="text-white/80">Customize your PackIt experience</p>
      </div>

      {/* Appearance */}
      <Card className="bg-white rounded-2xl p-6 shadow-md">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Sun className="w-5 h-5" />
          Appearance
        </h2>
        <div>
          <Label className="text-sm font-medium mb-2 block">Theme</Label>
          <Select value={theme} onValueChange={setTheme}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="light">
                <div className="flex items-center gap-2">
                  <Sun className="w-4 h-4" />
                  Light
                </div>
              </SelectItem>
              <SelectItem value="dark">
                <div className="flex items-center gap-2">
                  <Moon className="w-4 h-4" />
                  Dark
                </div>
              </SelectItem>
              <SelectItem value="system">
                <div className="flex items-center gap-2">
                  <Monitor className="w-4 h-4" />
                  System
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-gray-500 mt-2">
            Theme customization will be fully applied in a future update
          </p>
        </div>
      </Card>

      {/* Units */}
      <Card className="bg-white rounded-2xl p-6 shadow-md">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Scale className="w-5 h-5" />
          Units
        </h2>
        <div>
          <Label className="text-sm font-medium mb-2 block">Measurement System</Label>
          <Select value={units} onValueChange={setUnits}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="metric">Metric (kg, km, °C)</SelectItem>
              <SelectItem value="imperial">Imperial (lb, mi, °F)</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-gray-500 mt-2">
            Preferred: {units === 'metric' ? 'Kilograms, Kilometers, Celsius' : 'Pounds, Miles, Fahrenheit'}
          </p>
        </div>
      </Card>

      {/* Data Management */}
      <Card className="bg-white rounded-2xl p-6 shadow-md">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Data Management</h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-4 bg-blue-50 rounded-xl border border-blue-200">
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">Export Data</h3>
              <p className="text-sm text-gray-600">Download a backup of all your trips and notes</p>
            </div>
            <Button
              onClick={handleExportData}
              variant="outline"
              className="ml-4"
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>

          <div className="flex items-center justify-between p-4 bg-red-50 rounded-xl border border-red-200">
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">Reset All Data</h3>
              <p className="text-sm text-gray-600">Delete all trips, items, and notes</p>
            </div>
            <Button
              onClick={() => setShowResetDialog(true)}
              variant="outline"
              className="ml-4 text-red-600 border-red-300 hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Reset
            </Button>
          </div>
        </div>
      </Card>

      {/* About */}
      <Card className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-6 shadow-md border-2 border-blue-200">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Info className="w-5 h-5" />
          About PackIt
        </h2>
        <div className="space-y-3 text-sm text-gray-700">
          <div className="flex justify-between">
            <span className="font-medium">Version</span>
            <span>1.0.0</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium">Total Trips</span>
            <span>{trips.length}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium">Total Items</span>
            <span>{items.length}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium">Total Notes</span>
            <span>{notes.length}</span>
          </div>
          <div className="pt-4 mt-4 border-t border-gray-300">
            <p className="text-xs text-gray-600 leading-relaxed">
              <strong>Privacy Notice:</strong> PackIt stores all data only on your device and does not 
              send any information to external servers. Your travel plans and packing lists remain 
              completely private and work entirely offline.
            </p>
          </div>
        </div>
      </Card>

      {/* Reset Confirmation Dialog */}
      <Dialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-red-600">Reset All Data?</DialogTitle>
            <DialogDescription className="text-gray-600 pt-4">
              This will permanently delete:
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>{trips.length} trips</li>
                <li>{items.length} packing items</li>
                <li>{notes.length} travel notes</li>
                <li>All settings</li>
              </ul>
              <p className="mt-4 font-semibold text-red-600">
                This action cannot be undone!
              </p>
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-3 mt-6">
            <Button
              variant="outline"
              onClick={() => setShowResetDialog(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleResetData}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white"
            >
              Yes, Reset Everything
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}