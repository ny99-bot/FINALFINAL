import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ArrowLeft, AlertCircle, Save, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";

export default function EmergencyInfo() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    passport_number: "",
    emergency_contact_name: "",
    emergency_contact_phone: "",
    embassy_address: "",
    travel_insurance: "",
    allergies: "",
    blood_type: "",
    additional_notes: ""
  });

  const { data: infoList = [], isLoading } = useQuery({
    queryKey: ['emergencyInfo'],
    queryFn: () => base44.entities.EmergencyInfo.list(),
    initialData: []
  });

  const info = infoList[0];

  React.useEffect(() => {
    if (info) {
      setFormData(info);
    }
  }, [info]);

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.EmergencyInfo.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['emergencyInfo'] });
      setIsEditing(false);
    }
  });

  const updateMutation = useMutation({
    mutationFn: (data) => base44.entities.EmergencyInfo.update(info.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['emergencyInfo'] });
      setIsEditing(false);
    }
  });

  const handleSave = () => {
    if (info) {
      updateMutation.mutate(formData);
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    if (info) {
      setFormData(info);
    }
    setIsEditing(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
      </div>
    );
  }

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
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">Emergency Info</h1>
          <p className="text-sm text-gray-500">Keep important details safe & accessible</p>
        </div>
        {!isEditing && info && (
          <Button
            onClick={handleEdit}
            className="bg-red-500 hover:bg-red-600 text-white"
          >
            <Edit className="w-4 h-4 mr-2" />
            Edit
          </Button>
        )}
      </div>

      {/* Alert */}
      <Card className="bg-gradient-to-br from-red-500 to-orange-500 rounded-2xl p-6 text-white shadow-xl">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-6 h-6 flex-shrink-0 mt-1" />
          <div>
            <h3 className="font-semibold mb-2">Critical Information</h3>
            <p className="text-sm text-white/90">
              This information stays on your device and can be accessed offline. 
              Keep it updated for emergencies during travel.
            </p>
          </div>
        </div>
      </Card>

      {/* Form */}
      <Card className="bg-white rounded-2xl p-6 shadow-md">
        <div className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="passport" className="text-sm font-medium">Passport Number</Label>
              <Input
                id="passport"
                placeholder="e.g., A12345678"
                value={formData.passport_number}
                onChange={(e) => setFormData({ ...formData, passport_number: e.target.value })}
                disabled={!isEditing}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="blood_type" className="text-sm font-medium">Blood Type</Label>
              <Input
                id="blood_type"
                placeholder="e.g., O+"
                value={formData.blood_type}
                onChange={(e) => setFormData({ ...formData, blood_type: e.target.value })}
                disabled={!isEditing}
                className="mt-1"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="emergency_name" className="text-sm font-medium">Emergency Contact Name</Label>
            <Input
              id="emergency_name"
              placeholder="Full name"
              value={formData.emergency_contact_name}
              onChange={(e) => setFormData({ ...formData, emergency_contact_name: e.target.value })}
              disabled={!isEditing}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="emergency_phone" className="text-sm font-medium">Emergency Contact Phone</Label>
            <Input
              id="emergency_phone"
              type="tel"
              placeholder="+1 555 123 4567"
              value={formData.emergency_contact_phone}
              onChange={(e) => setFormData({ ...formData, emergency_contact_phone: e.target.value })}
              disabled={!isEditing}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="embassy" className="text-sm font-medium">Local Embassy Address</Label>
            <Textarea
              id="embassy"
              placeholder="Embassy contact information..."
              value={formData.embassy_address}
              onChange={(e) => setFormData({ ...formData, embassy_address: e.target.value })}
              disabled={!isEditing}
              className="mt-1 h-20"
            />
          </div>

          <div>
            <Label htmlFor="insurance" className="text-sm font-medium">Travel Insurance Details</Label>
            <Textarea
              id="insurance"
              placeholder="Policy number, contact info..."
              value={formData.travel_insurance}
              onChange={(e) => setFormData({ ...formData, travel_insurance: e.target.value })}
              disabled={!isEditing}
              className="mt-1 h-20"
            />
          </div>

          <div>
            <Label htmlFor="allergies" className="text-sm font-medium">Medical Allergies / Conditions</Label>
            <Textarea
              id="allergies"
              placeholder="List any allergies or medical conditions..."
              value={formData.allergies}
              onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
              disabled={!isEditing}
              className="mt-1 h-20"
            />
          </div>

          <div>
            <Label htmlFor="additional" className="text-sm font-medium">Additional Notes</Label>
            <Textarea
              id="additional"
              placeholder="Any other important information..."
              value={formData.additional_notes}
              onChange={(e) => setFormData({ ...formData, additional_notes: e.target.value })}
              disabled={!isEditing}
              className="mt-1 h-24"
            />
          </div>

          {isEditing && (
            <div className="flex gap-3 pt-4 border-t">
              <Button
                variant="outline"
                onClick={handleCancel}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white"
              >
                <Save className="w-4 h-4 mr-2" />
                Save Information
              </Button>
            </div>
          )}

          {!isEditing && !info && (
            <Button
              onClick={() => setIsEditing(true)}
              className="w-full bg-red-500 hover:bg-red-600 text-white"
            >
              <Edit className="w-4 h-4 mr-2" />
              Add Emergency Information
            </Button>
          )}
        </div>
      </Card>

      {/* Tips */}
      <Card className="bg-blue-50 rounded-2xl p-6 border border-blue-100">
        <h3 className="font-semibold text-gray-900 mb-3">🛡️ Safety Tips</h3>
        <div className="space-y-2 text-sm text-gray-700">
          <p>• Keep a physical copy of important documents separate from originals</p>
          <p>• Save your embassy's 24/7 emergency number</p>
          <p>• Take a photo of your passport and email it to yourself</p>
          <p>• Register with your country's travel advisory service</p>
          <p>• Keep your emergency contacts updated</p>
        </div>
      </Card>
    </div>
  );
}