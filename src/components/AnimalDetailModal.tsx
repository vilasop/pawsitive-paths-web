import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Heart, Stethoscope, User } from "lucide-react";

interface RescuedAnimal {
  id: string;
  name: string;
  species: string;
  age: number;
  breed: string;
  image_url: string;
  rescue_story: string;
  health_status: string;
  current_status: string;
  rescue_date: string;
}

interface AnimalDetailModalProps {
  animal: RescuedAnimal;
  isOpen: boolean;
  onClose: () => void;
  onAdopt: (animal: RescuedAnimal) => void;
}

export const AnimalDetailModal = ({ animal, isOpen, onClose, onAdopt }: AnimalDetailModalProps) => {
  const getStatusBadge = (status: string) => {
    const variants = {
      Available: { variant: "default" as const, icon: "🟢", text: "Available" },
      Adopted: { variant: "secondary" as const, icon: "✅", text: "Adopted" },
      "Under Care": { variant: "outline" as const, icon: "🟡", text: "Under Care" },
    };
    
    const config = variants[status as keyof typeof variants] || variants["Under Care"];
    
    return (
      <Badge variant={config.variant} className="gap-1">
        <span>{config.icon}</span>
        {config.text}
      </Badge>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-primary">
            Meet {animal.name}
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Image Section */}
          <div className="space-y-4">
            <div className="relative">
              <img
                src={animal.image_url}
                alt={animal.name}
                className="w-full h-64 md:h-80 object-cover rounded-lg"
              />
              <div className="absolute top-4 right-4">
                {getStatusBadge(animal.current_status)}
              </div>
            </div>

            {/* Adoption Button */}
            <div className="w-full">
              {animal.current_status === "Available" && (
                <Button 
                  onClick={() => onAdopt(animal)}
                  className="w-full"
                  size="lg"
                >
                  <Heart className="w-4 h-4 mr-2" />
                  Adopt {animal.name}
                </Button>
              )}
              
              {animal.current_status === "Adopted" && (
                <Button 
                  disabled 
                  className="w-full"
                  size="lg"
                >
                  Already Adopted ✅
                </Button>
              )}
              
              {animal.current_status === "Under Care" && (
                <Button 
                  variant="secondary" 
                  disabled 
                  className="w-full"
                  size="lg"
                >
                  Available Soon 🟡
                </Button>
              )}
            </div>
          </div>

          {/* Details Section */}
          <div className="space-y-6">
            {/* Basic Info */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-primary">Basic Information</h3>
              
              <div className="flex items-center gap-2 text-muted-foreground">
                <User className="w-4 h-4" />
                <span><strong>Age:</strong> {animal.age} years old</span>
              </div>
              
              <div className="flex items-center gap-2 text-muted-foreground">
                <Heart className="w-4 h-4" />
                <span><strong>Breed:</strong> {animal.breed}</span>
              </div>
              
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="w-4 h-4" />
                <span><strong>Rescue Date:</strong> {new Date(animal.rescue_date).toLocaleDateString()}</span>
              </div>
              
              <div className="flex items-center gap-2 text-muted-foreground">
                <Stethoscope className="w-4 h-4" />
                <span><strong>Health Status:</strong> {animal.health_status}</span>
              </div>
            </div>

            {/* Rescue Story */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-primary">Rescue Story</h3>
              <p className="text-muted-foreground leading-relaxed">
                {animal.rescue_story}
              </p>
            </div>

            {/* Current Status */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-primary">Current Status</h3>
              <div className="flex items-center gap-2">
                {getStatusBadge(animal.current_status)}
                {animal.current_status === "Available" && (
                  <span className="text-sm text-muted-foreground">
                    Ready for adoption!
                  </span>
                )}
                {animal.current_status === "Adopted" && (
                  <span className="text-sm text-muted-foreground">
                    Found a loving forever home
                  </span>
                )}
                {animal.current_status === "Under Care" && (
                  <span className="text-sm text-muted-foreground">
                    Still receiving care and love
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};