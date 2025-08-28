import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Heart, Stethoscope } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { AnimalDetailModal } from "@/components/AnimalDetailModal";
import { useNavigate } from "react-router-dom";

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

const RescuedAnimals = () => {
  const [animals, setAnimals] = useState<RescuedAnimal[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAnimal, setSelectedAnimal] = useState<RescuedAnimal | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchAnimals();
  }, []);

  const fetchAnimals = async () => {
    try {
      const { data, error } = await supabase
        .from("rescued_animals")
        .select("*")
        .order("rescue_date", { ascending: false });

      if (error) throw error;
      setAnimals(data || []);
    } catch (error) {
      console.error("Error fetching animals:", error);
      toast({
        title: "Error",
        description: "Failed to load rescued animals.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

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

  const handleAdoptClick = (animal: RescuedAnimal) => {
    // Navigate to adopt page with pre-filled data
    navigate("/adopt", { state: { prefilledAnimal: animal } });
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-muted animate-pulse rounded-lg h-96" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-primary mb-4">Rescued Animals</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Meet our beautiful rescued animals who have found new hope through love and care. 
          Each one has a unique story and is looking for their forever home.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {animals.map((animal) => (
          <Card 
            key={animal.id} 
            className="overflow-hidden hover:shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer group"
          >
            <div className="relative overflow-hidden">
              <img
                src={animal.image_url}
                alt={animal.name}
                className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-110"
              />
              <div className="absolute top-2 right-2">
                {getStatusBadge(animal.current_status)}
              </div>
            </div>
            
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{animal.name}</span>
                <span className="text-sm font-normal text-muted-foreground">
                  {animal.species}
                </span>
              </CardTitle>
            </CardHeader>
            
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="w-4 h-4" />
                <span>Rescued: {new Date(animal.rescue_date).toLocaleDateString()}</span>
              </div>
              
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Stethoscope className="w-4 h-4" />
                <span>{animal.health_status}</span>
              </div>
              
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Heart className="w-4 h-4" />
                <span>{animal.current_status}</span>
              </div>

              <div className="flex gap-2 pt-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setSelectedAnimal(animal)}
                  className="flex-1"
                >
                  Read Story
                </Button>
                
                {animal.current_status === "Available" && (
                  <Button 
                    size="sm" 
                    onClick={() => handleAdoptClick(animal)}
                    className="flex-1"
                  >
                    Adopt Me!
                  </Button>
                )}
                
                {animal.current_status === "Adopted" && (
                  <Button 
                    size="sm" 
                    disabled 
                    className="flex-1"
                  >
                    Already Adopted
                  </Button>
                )}
                
                {animal.current_status === "Under Care" && (
                  <Button 
                    size="sm" 
                    variant="secondary" 
                    disabled 
                    className="flex-1"
                  >
                    Available Soon
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {animals.length === 0 && (
        <div className="text-center py-12">
          <p className="text-lg text-muted-foreground">No rescued animals found.</p>
        </div>
      )}

      {selectedAnimal && (
        <AnimalDetailModal
          animal={selectedAnimal}
          isOpen={!!selectedAnimal}
          onClose={() => setSelectedAnimal(null)}
          onAdopt={handleAdoptClick}
        />
      )}
    </div>
  );
};

export default RescuedAnimals;