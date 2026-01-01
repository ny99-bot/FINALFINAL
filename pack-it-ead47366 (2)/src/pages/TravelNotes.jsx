import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, Edit, StickyNote } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion, AnimatePresence } from "framer-motion";

const NOTE_COLORS = [
  { value: "yellow", label: "Yellow", bg: "bg-yellow-100", border: "border-yellow-300", text: "text-yellow-900" },
  { value: "blue", label: "Blue", bg: "bg-blue-100", border: "border-blue-300", text: "text-blue-900" },
  { value: "green", label: "Green", bg: "bg-green-100", border: "border-green-300", text: "text-green-900" },
  { value: "pink", label: "Pink", bg: "bg-pink-100", border: "border-pink-300", text: "text-pink-900" },
  { value: "purple", label: "Purple", bg: "bg-purple-100", border: "border-purple-300", text: "text-purple-900" }
];

export default function TravelNotes() {
  const [showDialog, setShowDialog] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    color: "yellow"
  });

  const queryClient = useQueryClient();

  const { data: notes = [], isLoading } = useQuery({
    queryKey: ['travelNotes'],
    queryFn: () => base44.entities.TravelNote.list('-created_date'),
    initialData: []
  });

  const createNoteMutation = useMutation({
    mutationFn: (noteData) => base44.entities.TravelNote.create(noteData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['travelNotes'] });
      resetForm();
    }
  });

  const updateNoteMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.TravelNote.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['travelNotes'] });
      resetForm();
    }
  });

  const deleteNoteMutation = useMutation({
    mutationFn: (id) => base44.entities.TravelNote.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['travelNotes'] });
    }
  });

  const resetForm = () => {
    setFormData({ title: "", content: "", color: "yellow" });
    setEditingNote(null);
    setShowDialog(false);
  };

  const handleSubmit = () => {
    if (editingNote) {
      updateNoteMutation.mutate({ id: editingNote.id, data: formData });
    } else {
      createNoteMutation.mutate(formData);
    }
  };

  const handleEdit = (note) => {
    setEditingNote(note);
    setFormData({
      title: note.title,
      content: note.content,
      color: note.color
    });
    setShowDialog(true);
  };

  const getColorClasses = (colorValue) => {
    return NOTE_COLORS.find(c => c.value === colorValue) || NOTE_COLORS[0];
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-yellow-400 via-orange-400 to-pink-400 rounded-3xl p-8 text-white shadow-xl">
        <div className="flex items-center gap-2 mb-2">
          <StickyNote className="w-6 h-6" />
          <span className="text-sm font-medium opacity-90">Quick reminders</span>
        </div>
        <h1 className="text-3xl font-bold mb-2">Travel Notes</h1>
        <p className="text-white/80 mb-6">Keep track of important travel reminders</p>
        <Button
          onClick={() => {
            setEditingNote(null);
            setFormData({ title: "", content: "", color: "yellow" });
            setShowDialog(true);
          }}
          className="bg-white text-orange-600 hover:bg-orange-50 font-semibold shadow-lg"
        >
          <Plus className="w-5 h-5 mr-2" />
          New Note
        </Button>
      </div>

      {/* Notes Grid */}
      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-2xl p-6 shadow-md animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      ) : notes.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-24 h-24 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <StickyNote className="w-12 h-12 text-yellow-500" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No notes yet</h3>
          <p className="text-gray-500 mb-6">Start jotting down travel reminders!</p>
          <Button
            onClick={() => setShowDialog(true)}
            className="bg-orange-500 hover:bg-orange-600 text-white"
          >
            <Plus className="w-5 h-5 mr-2" />
            Create Your First Note
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence>
            {notes.map((note, index) => {
              const colorClasses = getColorClasses(note.color);
              return (
                <motion.div
                  key={note.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: index * 0.05 }}
                  className={`${colorClasses.bg} ${colorClasses.border} border-2 rounded-2xl p-6 shadow-md hover:shadow-xl transition-all duration-300 relative`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <h3 className={`text-lg font-bold ${colorClasses.text} pr-8`}>{note.title}</h3>
                    <div className="flex gap-1 absolute top-4 right-4">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(note)}
                        className="h-8 w-8 hover:bg-black/10"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          if (confirm(`Delete note "${note.title}"?`)) {
                            deleteNoteMutation.mutate(note.id);
                          }
                        }}
                        className="h-8 w-8 hover:bg-black/10 text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <p className={`text-sm ${colorClasses.text} whitespace-pre-wrap`}>
                    {note.content}
                  </p>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Note Dialog */}
      <Dialog open={showDialog} onOpenChange={(open) => {
        if (!open) resetForm();
        setShowDialog(open);
      }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">
              {editingNote ? "Edit Note" : "New Note"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Label htmlFor="title" className="text-sm font-medium">Title</Label>
              <Input
                id="title"
                placeholder="e.g., Check passport expiry"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="content" className="text-sm font-medium">Content</Label>
              <Textarea
                id="content"
                placeholder="Add your note details..."
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                className="mt-1 h-32"
              />
            </div>
            <div>
              <Label htmlFor="color" className="text-sm font-medium">Color</Label>
              <Select
                value={formData.color}
                onValueChange={(value) => setFormData({ ...formData, color: value })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {NOTE_COLORS.map((color) => (
                    <SelectItem key={color.value} value={color.value}>
                      <div className="flex items-center gap-2">
                        <div className={`w-4 h-4 rounded ${color.bg} ${color.border} border`}></div>
                        {color.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex gap-3 mt-6">
            <Button
              variant="outline"
              onClick={resetForm}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!formData.title || !formData.content}
              className="flex-1 bg-orange-500 hover:bg-orange-600 text-white"
            >
              {editingNote ? "Save Changes" : "Create Note"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}