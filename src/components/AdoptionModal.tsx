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
  petId: number;
  petName: string;
}

interface FormData {
  name: string;
  contact_no: string;
  aadhaar_no: string;
  email: string;
  already_pet: string;
  reason: string;
}

const AdoptionModal = ({ isOpen, onClose, petId, petName }: AdoptionModalProps) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: "",
    contact_no: "",
    aadhaar_no: "",
    email: "",
    already_pet: "",
    reason: ""
  });

  const [errors, setErrors] = useState<Partial<FormData>>({});

  const validateForm = (): boolean => {
    const newErrors: Partial<FormData> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Full name is required";
    }

    if (!formData.contact_no) {
      newErrors.contact_no = "Contact number is required";
    } else if (!/^\d{10}$/.test(formData.contact_no)) {
      newErrors.contact_no = "Contact number must be exactly 10 digits";
    }

    if (!formData.aadhaar_no) {
      newErrors.aadhaar_no = "Aadhaar number is required";
    } else if (!/^\d{12}$/.test(formData.aadhaar_no)) {
      newErrors.aadhaar_no = "Aadhaar number must be exactly 12 digits";
    }

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/^[A-Za-z0-9._%-]+@[A-Za-z0-9.-]+\.[A-Za-z]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.already_pet) {
      newErrors.already_pet = "Please select an option";
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
          pet_id: petId,
          name: formData.name.trim(),
          contact_no: formData.contact_no,
          aadhaar_no: formData.aadhaar_no,
          email: formData.email.toLowerCase().trim(),
          already_pet: formData.already_pet === "yes",
          reason: formData.reason.trim()
        });

      if (error) throw error;

      setShowConfirmation(true);
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
      name: "",
      contact_no: "",
      aadhaar_no: "",
      email: "",
      already_pet: "",
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
              Thank you for your interest in adopting {petName}. Our adoption team will review your application and contact you within 2-3 business days.
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
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="Enter your full name"
                className={errors.name ? "border-red-500" : ""}
              />
              {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="contact">Contact Number *</Label>
              <Input
                id="contact"
                value={formData.contact_no}
                onChange={(e) => handleInputChange("contact_no", e.target.value.replace(/\D/g, "").slice(0, 10))}
                placeholder="10-digit mobile number"
                className={errors.contact_no ? "border-red-500" : ""}
              />
              {errors.contact_no && <p className="text-sm text-red-500">{errors.contact_no}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="aadhaar">Aadhaar Number *</Label>
              <Input
                id="aadhaar"
                value={formData.aadhaar_no}
                onChange={(e) => handleInputChange("aadhaar_no", e.target.value.replace(/\D/g, "").slice(0, 12))}
                placeholder="12-digit Aadhaar number"
                className={errors.aadhaar_no ? "border-red-500" : ""}
              />
              {errors.aadhaar_no && <p className="text-sm text-red-500">{errors.aadhaar_no}</p>}
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
              value={formData.already_pet}
              onValueChange={(value) => handleInputChange("already_pet", value)}
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
            {errors.already_pet && <p className="text-sm text-red-500">{errors.already_pet}</p>}
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