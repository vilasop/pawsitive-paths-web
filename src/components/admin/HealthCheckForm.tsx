import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Upload, X } from "lucide-react";
import { toast } from "sonner";

interface Animal {
  id: string;
  name: string;
  species: string;
  age: number | null;
}

interface HealthCheckFormProps {
  onClose: () => void;
  editingCheck?: any | null;
}

const HealthCheckForm = ({ onClose, editingCheck }: HealthCheckFormProps) => {
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    animal_id: editingCheck?.animal_id || "",
    check_date: editingCheck?.check_date ? new Date(editingCheck.check_date).toISOString().slice(0, 16) : new Date().toISOString().slice(0, 16),
    check_type: editingCheck?.check_type || "Clinic Visit",
    health_status: editingCheck?.health_status || "Good",
    weight_kg: editingCheck?.weight_kg || "",
    vaccinations_up_to_date: editingCheck?.vaccinations_up_to_date || false,
    vaccinations_notes: editingCheck?.vaccinations_notes || "",
    veterinarian: editingCheck?.veterinarian || "",
    next_appointment: editingCheck?.next_appointment ? new Date(editingCheck.next_appointment).toISOString().slice(0, 16) : "",
    notes: editingCheck?.notes || "",
    visibility: editingCheck?.visibility || "public",
  });
  const [photos, setPhotos] = useState<File[]>([]);
  const [existingPhotos, setExistingPhotos] = useState<string[]>(editingCheck?.photos || []);

  useEffect(() => {
    fetchAnimals();
  }, []);

  const fetchAnimals = async () => {
    try {
      const { data, error } = await supabase
        .from("adopt_animals")
        .select("id, name, species, age")
        .order("name");

      if (error) throw error;
      setAnimals(data || []);
    } catch (error: any) {
      console.error("Error fetching animals:", error);
      toast.error("Failed to load animals");
    }
  };

  const handlePhotoUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    const fileArray = Array.from(files);
    const validFiles = fileArray.filter(file => {
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} is too large (max 5MB)`);
        return false;
      }
      if (!['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type)) {
        toast.error(`${file.name} is not a valid image type`);
        return false;
      }
      return true;
    });

    if (photos.length + validFiles.length + existingPhotos.length > 5) {
      toast.error("Maximum 5 photos allowed");
      return;
    }

    setPhotos([...photos, ...validFiles]);
  };

  const uploadPhotos = async (): Promise<string[]> => {
    const uploadedUrls: string[] = [];

    for (const photo of photos) {
      const fileName = `${Date.now()}_${photo.name}`;
      const { data, error } = await supabase.storage
        .from("animal_health_photos")
        .upload(fileName, photo);

      if (error) {
        console.error("Upload error:", error);
        throw new Error(`Failed to upload ${photo.name}`);
      }

      const { data: { publicUrl } } = supabase.storage
        .from("animal_health_photos")
        .getPublicUrl(fileName);

      uploadedUrls.push(publicUrl);
    }

    return uploadedUrls;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.animal_id) {
      toast.error("Please select an animal");
      return;
    }

    try {
      setUploading(true);

      // Upload new photos
      const uploadedPhotoUrls = photos.length > 0 ? await uploadPhotos() : [];
      const allPhotoUrls = [...existingPhotos, ...uploadedPhotoUrls];

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();

      // Find selected animal to auto-fill type and age
      const selectedAnimal = animals.find(a => a.id === formData.animal_id);

      const checkData = {
        animal_id: formData.animal_id,
        check_date: new Date(formData.check_date).toISOString(),
        check_type: formData.check_type,
        animal_type: selectedAnimal?.species || null,
        animal_age: selectedAnimal?.age || null,
        health_status: formData.health_status,
        weight_kg: formData.weight_kg ? parseFloat(formData.weight_kg) : null,
        vaccinations_up_to_date: formData.vaccinations_up_to_date,
        vaccinations_notes: formData.vaccinations_notes || null,
        veterinarian: formData.veterinarian || null,
        next_appointment: formData.next_appointment ? new Date(formData.next_appointment).toISOString() : null,
        notes: formData.notes || null,
        photos: allPhotoUrls,
        visibility: formData.visibility,
        created_by: user?.id || null,
      };

      let result;
      if (editingCheck) {
        result = await supabase
          .from("animal_health_checks")
          .update(checkData)
          .eq("id", editingCheck.id);
      } else {
        result = await supabase
          .from("animal_health_checks")
          .insert([checkData]);
      }

      const { error } = result;
      if (error) throw error;

      toast.success(editingCheck ? "Health check updated successfully" : "Health check created successfully");
      onClose();
    } catch (error: any) {
      console.error("Error saving health check:", error);
      toast.error("Failed to save: " + error.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={onClose}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div>
          <h2 className="text-3xl font-bold">{editingCheck ? "Edit" : "Add"} Health Check</h2>
          <p className="text-muted-foreground">Record animal health status and schedule appointments</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="animal_id">Animal *</Label>
            <Select value={formData.animal_id} onValueChange={(value) => setFormData({...formData, animal_id: value})}>
              <SelectTrigger id="animal_id">
                <SelectValue placeholder="Select animal" />
              </SelectTrigger>
              <SelectContent>
                {animals.map((animal) => (
                  <SelectItem key={animal.id} value={animal.id}>
                    {animal.name} ({animal.species})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="check_date">Check Date *</Label>
            <Input
              id="check_date"
              type="datetime-local"
              value={formData.check_date}
              onChange={(e) => setFormData({...formData, check_date: e.target.value})}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="check_type">Check Type *</Label>
            <Select value={formData.check_type} onValueChange={(value) => setFormData({...formData, check_type: value})}>
              <SelectTrigger id="check_type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Home Visit">Home Visit</SelectItem>
                <SelectItem value="Clinic Visit">Clinic Visit</SelectItem>
                <SelectItem value="Self Report">Self Report</SelectItem>
                <SelectItem value="Remote Followup">Remote Followup</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="health_status">Health Status *</Label>
            <Select value={formData.health_status} onValueChange={(value) => setFormData({...formData, health_status: value})}>
              <SelectTrigger id="health_status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Excellent">Excellent</SelectItem>
                <SelectItem value="Good">Good</SelectItem>
                <SelectItem value="Fair">Fair</SelectItem>
                <SelectItem value="Poor">Poor</SelectItem>
                <SelectItem value="Critical">Critical</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="weight_kg">Weight (kg)</Label>
            <Input
              id="weight_kg"
              type="number"
              step="0.01"
              value={formData.weight_kg}
              onChange={(e) => setFormData({...formData, weight_kg: e.target.value})}
              placeholder="e.g., 25.5"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="veterinarian">Veterinarian</Label>
            <Input
              id="veterinarian"
              value={formData.veterinarian}
              onChange={(e) => setFormData({...formData, veterinarian: e.target.value})}
              placeholder="Dr. Name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="next_appointment">Next Appointment</Label>
            <Input
              id="next_appointment"
              type="datetime-local"
              value={formData.next_appointment}
              onChange={(e) => setFormData({...formData, next_appointment: e.target.value})}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="visibility">Visibility</Label>
            <Select value={formData.visibility} onValueChange={(value) => setFormData({...formData, visibility: value})}>
              <SelectTrigger id="visibility">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="public">Public</SelectItem>
                <SelectItem value="adopter-only">Adopter Only</SelectItem>
                <SelectItem value="private">Private</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <Switch
              id="vaccinations_up_to_date"
              checked={formData.vaccinations_up_to_date}
              onCheckedChange={(checked) => setFormData({...formData, vaccinations_up_to_date: checked})}
            />
            <Label htmlFor="vaccinations_up_to_date">Vaccinations Up to Date</Label>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="vaccinations_notes">Vaccination Notes</Label>
          <Textarea
            id="vaccinations_notes"
            value={formData.vaccinations_notes}
            onChange={(e) => setFormData({...formData, vaccinations_notes: e.target.value})}
            placeholder="Details about vaccinations..."
            rows={3}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes">General Notes</Label>
          <Textarea
            id="notes"
            value={formData.notes}
            onChange={(e) => setFormData({...formData, notes: e.target.value})}
            placeholder="Additional observations, treatment notes, etc..."
            rows={4}
          />
        </div>

        <div className="space-y-2">
          <Label>Photos (max 5, 5MB each)</Label>
          <div className="flex flex-wrap gap-4">
            {existingPhotos.map((url, idx) => (
              <div key={idx} className="relative">
                <img src={url} alt={`Photo ${idx + 1}`} className="w-24 h-24 object-cover rounded" />
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="absolute -top-2 -right-2 h-6 w-6 p-0"
                  onClick={() => setExistingPhotos(existingPhotos.filter((_, i) => i !== idx))}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
            {photos.map((file, idx) => (
              <div key={idx} className="relative">
                <img src={URL.createObjectURL(file)} alt={file.name} className="w-24 h-24 object-cover rounded" />
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="absolute -top-2 -right-2 h-6 w-6 p-0"
                  onClick={() => setPhotos(photos.filter((_, i) => i !== idx))}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
            {existingPhotos.length + photos.length < 5 && (
              <label className="w-24 h-24 border-2 border-dashed rounded flex items-center justify-center cursor-pointer hover:bg-muted">
                <Upload className="h-6 w-6 text-muted-foreground" />
                <input
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  multiple
                  className="hidden"
                  onChange={(e) => handlePhotoUpload(e.target.files)}
                />
              </label>
            )}
          </div>
        </div>

        <div className="flex gap-3">
          <Button type="submit" disabled={uploading}>
            {uploading ? "Saving..." : editingCheck ? "Update Health Check" : "Create Health Check"}
          </Button>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
};

export default HealthCheckForm;
