import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Heart, CheckCircle } from "lucide-react";

interface AdoptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  petId: string | number;
  petName: string;
}

interface FormData {
  full_name: string;
  contact_number: string;
  aadhar: string;
  email: string;
  has_pet: string;
  reason: string;
}

const AdoptionModal = ({ isOpen, onClose, petId, petName }: AdoptionModalProps) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    full_name: "",
    contact_number: "",
    aadhar: "",
    email: "",
    has_pet: "",
    reason: ""
  });

  const [errors, setErrors] = useState<Partial<FormData>>({});

  const validateForm = (): boolean => {
    const newErrors: Partial<FormData> = {};

    if (!formData.full_name.trim()) {
      newErrors.full_name = "Full name is required";
    }

    if (!formData.contact_number) {
      newErrors.contact_number = "Contact number is required";
    } else if (!/^\d{10}$/.test(formData.contact_number)) {
      newErrors.contact_number = "Contact number must be exactly 10 digits";
    }

    if (!formData.aadhar) {
      newErrors.aadhar = "Aadhaar number is required";
    } else if (!/^\d{12}$/.test(formData.aadhar)) {
      newErrors.aadhar = "Aadhaar number must be exactly 12 digits";
    }

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/^[A-Za-z0-9._%-]+@[A-Za-z0-9.-]+\.[A-Za-z]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.has_pet) {
      newErrors.has_pet = "Please select an option";
    }

    if (!formData.reason.trim()) {
      newErrors.reason = "Please explain why you want to adopt";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('adoptions')
        .insert({
          pet_id: String(petId),
          full_name: formData.full_name.trim(),
          contact_number: formData.contact_number,
          aadhar: formData.aadhar,
          email: formData.email.toLowerCase().trim(),
          has_pet: formData.has_pet === "yes",
          reason: formData.reason.trim()
        });

      if (error) throw error;

      setShowConfirmation(true);
      toast({
        title: "Success",
        description: "Adoption application submitted successfully!",
      });
    } catch (error) {
      console.error('Error submitting adoption application:', error);
      toast({
        title: "Error",
        description: "Failed to submit adoption application. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const resetAndClose = () => {
    setFormData({
      full_name: "",
      contact_number: "",
      aadhar: "",
      email: "",
      has_pet: "",
      reason: ""
    });
    setErrors({});
    setShowConfirmation(false);
    onClose();
  };

  if (showConfirmation) {
    return (
      <Dialog open={isOpen} onOpenChange={resetAndClose}>
        <DialogContent className="max-w-md">
          <div className="text-center py-6">
            <CheckCircle className="mx-auto h-16 w-16 text-green-500 mb-4" />
            <h2 className="text-2xl font-bold text-foreground mb-2">
              Application Submitted!
            </h2>
            <p className="text-muted-foreground mb-6">
              Thank you for your interest in adopting {petName}. Our team will contact you within 2-3 business days to finalize the adoption process.
            </p>
            <Button onClick={resetAndClose} className="bg-green-600 hover:bg-green-700">
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Heart className="h-6 w-6 text-green-600" />
            Adopt {petName}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="full_name">Full Name *</Label>
              <Input
                id="full_name"
                value={formData.full_name}
                onChange={(e) => handleInputChange("full_name", e.target.value)}
                placeholder="Enter your full name"
                className={errors.full_name ? "border-red-500" : ""}
              />
              {errors.full_name && <p className="text-sm text-red-500">{errors.full_name}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="contact_number">Contact Number *</Label>
              <Input
                id="contact_number"
                value={formData.contact_number}
                onChange={(e) => handleInputChange("contact_number", e.target.value.replace(/\D/g, "").slice(0, 10))}
                placeholder="10-digit mobile number"
                className={errors.contact_number ? "border-red-500" : ""}
              />
              {errors.contact_number && <p className="text-sm text-red-500">{errors.contact_number}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="aadhar">Aadhaar Number *</Label>
              <Input
                id="aadhar"
                value={formData.aadhar}
                onChange={(e) => handleInputChange("aadhar", e.target.value.replace(/\D/g, "").slice(0, 12))}
                placeholder="12-digit Aadhaar number"
                className={errors.aadhar ? "border-red-500" : ""}
              />
              {errors.aadhar && <p className="text-sm text-red-500">{errors.aadhar}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email ID *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                placeholder="your.email@example.com"
                className={errors.email ? "border-red-500" : ""}
              />
              {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
            </div>
          </div>

          <div className="space-y-3">
            <Label>Do you already have a pet? *</Label>
            <RadioGroup
              value={formData.has_pet}
              onValueChange={(value) => handleInputChange("has_pet", value)}
              className="flex gap-6"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="yes" id="pet-yes" />
                <Label htmlFor="pet-yes">Yes</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="no" id="pet-no" />
                <Label htmlFor="pet-no">No</Label>
              </div>
            </RadioGroup>
            {errors.has_pet && <p className="text-sm text-red-500">{errors.has_pet}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason">Why do you want to adopt {petName}? *</Label>
            <Textarea
              id="reason"
              value={formData.reason}
              onChange={(e) => handleInputChange("reason", e.target.value)}
              placeholder="Tell us about your living situation, experience with pets, and why you'd like to adopt this animal..."
              rows={4}
              className={errors.reason ? "border-red-500" : ""}
            />
            {errors.reason && <p className="text-sm text-red-500">{errors.reason}</p>}
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              {isSubmitting ? "Submitting..." : "Submit Application"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AdoptionModal;