import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Camera, X, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PhotoGallery({ trip }) {
  const [uploading, setUploading] = useState(false);
  const queryClient = useQueryClient();

  const updateTripMutation = useMutation({
    mutationFn: (data) => base44.entities.Trip.update(trip.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trip', trip.id] });
    }
  });

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    
    const currentPhotos = trip.photos || [];
    if (currentPhotos.length < 4) {
      updateTripMutation.mutate({
        photos: [...currentPhotos, file_url]
      });
    }
    setUploading(false);
  };

  const handleRemovePhoto = (indexToRemove) => {
    const currentPhotos = trip.photos || [];
    updateTripMutation.mutate({
      photos: currentPhotos.filter((_, index) => index !== indexToRemove)
    });
  };

  const photos = trip.photos || [];

  return (
    <div className="bg-white rounded-2xl p-6 shadow-md">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Camera className="w-5 h-5 text-purple-500" />
          <span className="font-semibold text-gray-900">Photo Memories</span>
        </div>
        {photos.length < 4 && (
          <label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
              disabled={uploading}
            />
            <Button
              size="sm"
              className="bg-purple-500 hover:bg-purple-600 text-white"
              disabled={uploading}
              asChild
            >
              <span>
                {uploading ? (
                  <>Uploading...</>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-1" />
                    Add Photo
                  </>
                )}
              </span>
            </Button>
          </label>
        )}
      </div>

      {photos.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <Camera className="w-12 h-12 mx-auto mb-2 opacity-30" />
          <p className="text-sm">No photos yet</p>
          <p className="text-xs mt-1">Add up to 4 photos</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {photos.map((photoUrl, index) => (
            <div
              key={index}
              className="relative aspect-square rounded-xl overflow-hidden group bg-gray-100"
            >
              <img
                src={photoUrl}
                alt={`Memory ${index + 1}`}
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => handleRemovePhoto(index)}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
      {photos.length > 0 && photos.length < 4 && (
        <p className="text-xs text-gray-500 mt-3 text-center">
          {4 - photos.length} more photo{4 - photos.length !== 1 ? 's' : ''} can be added
        </p>
      )}
    </div>
  );
}