import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Heart, CheckCircle, AlertCircle } from "lucide-react";
import { validators, errorMessages } from "@/lib/validators";
import adoptSuccessImage from "@/assets/adopt-success.jpg";

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
  const [applicationId, setApplicationId] = useState<string>("");
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

    if (!validators.required(formData.full_name)) {
      newErrors.full_name = errorMessages.required;
    } else if (!validators.name(formData.full_name)) {
      newErrors.full_name = errorMessages.name;
    }

    if (!validators.required(formData.contact_number)) {
      newErrors.contact_number = errorMessages.required;
    } else if (!validators.phone(formData.contact_number)) {
      newErrors.contact_number = errorMessages.phone;
    }

    if (!validators.required(formData.aadhar)) {
      newErrors.aadhar = errorMessages.required;
    } else if (!validators.aadhar(formData.aadhar)) {
      newErrors.aadhar = errorMessages.aadhar;
    }

    if (!validators.required(formData.email)) {
      newErrors.email = errorMessages.required;
    } else if (!validators.email(formData.email)) {
      newErrors.email = errorMessages.email;
    }

    if (!formData.has_pet) {
      newErrors.has_pet = "Please select an option";
    }

    if (!validators.required(formData.reason)) {
      newErrors.reason = "Please explain why you want to adopt";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors in the form before submitting.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Sanitize and prepare data
      const sanitizedData = {
        pet_id: String(petId),
        full_name: formData.full_name.trim().replace(/\s+/g, ' '),
        contact_number: formData.contact_number.trim(),
        aadhar: formData.aadhar.trim(),
        email: formData.email.toLowerCase().trim(),
        has_pet: formData.has_pet === "yes",
        reason: formData.reason.trim(),
        status: 'pending'
      };

      // Server-side validation
      if (!validators.name(sanitizedData.full_name)) {
        throw new Error("Invalid name format");
      }
      if (!validators.phone(sanitizedData.contact_number)) {
        throw new Error("Invalid phone number format");
      }
      if (!validators.aadhar(sanitizedData.aadhar)) {
        throw new Error("Invalid Aadhar number format");
      }
      if (!validators.email(sanitizedData.email)) {
        throw new Error("Invalid email format");
      }

      const { data, error } = await supabase
        .from('adoptions')
        .insert(sanitizedData)
        .select('id')
        .single();

      if (error) {
        console.error('Supabase error details:', error);
        
        // Provide specific error messages
        if (error.code === '23514') {
          throw new Error("Please check your input: " + (error.message || "Invalid data format"));
        } else if (error.code === 'PGRST301') {
          throw new Error("Permission error: Please contact admin");
        } else if (error.message?.includes('violates')) {
          throw new Error("Data validation failed: Please ensure all fields are filled correctly");
        } else {
          throw new Error(error.message || "Database error occurred");
        }
      }

      setApplicationId(data?.id?.substring(0, 8).toUpperCase() || "");
      setShowConfirmation(true);
      
      toast({
        title: "🎉 Success!",
        description: "Adoption application submitted successfully!",
      });
    } catch (error: any) {
      console.error('Error submitting adoption application:', error);
      
      const errorMessage = error.message || "Failed to submit adoption application. Please try again.";
      
      toast({
        title: "❌ Submission Failed",
        description: errorMessage,
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
        <DialogContent className="max-w-2xl">
          <div className="text-center">
            <div className="relative w-full h-48 mb-6 rounded-lg overflow-hidden">
              <img 
                src={adoptSuccessImage} 
                alt="Adoption Success" 
                className="w-full h-full object-cover"
              />
            </div>
            <CheckCircle className="mx-auto h-16 w-16 text-green-500 mb-4" />
            <h2 className="text-3xl font-bold text-foreground mb-2">
              🎉 Application Submitted!
            </h2>
            {applicationId && (
              <p className="text-sm text-muted-foreground mb-4">
                Application ID: <span className="font-mono font-bold">{applicationId}</span>
              </p>
            )}
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Thank you for your interest in adopting <strong>{petName}</strong>. Our admin team will review your application and contact you within 2-3 business days to finalize the adoption process.
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
                pattern="^[A-Za-z ]{2,100}$"
                maxLength={100}
                title="Name must contain only letters and spaces (2-100 characters)"
              />
              {errors.full_name && <p className="text-sm text-red-500">{errors.full_name}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="contact_number">Contact Number *</Label>
              <Input
                id="contact_number"
                type="tel"
                inputMode="numeric"
                pattern="[0-9]{10}"
                maxLength={10}
                value={formData.contact_number}
                onChange={(e) => handleInputChange("contact_number", e.target.value.replace(/\D/g, "").slice(0, 10))}
                placeholder="10-digit mobile number"
                className={errors.contact_number ? "border-red-500" : ""}
                title="Contact number must be exactly 10 digits"
              />
              {errors.contact_number && <p className="text-sm text-red-500">{errors.contact_number}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="aadhar">Aadhaar Number *</Label>
              <Input
                id="aadhar"
                type="text"
                inputMode="numeric"
                pattern="[0-9]{12}"
                maxLength={12}
                value={formData.aadhar}
                onChange={(e) => handleInputChange("aadhar", e.target.value.replace(/\D/g, "").slice(0, 12))}
                placeholder="12-digit Aadhaar number"
                className={errors.aadhar ? "border-red-500" : ""}
                title="Aadhaar number must be exactly 12 digits"
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