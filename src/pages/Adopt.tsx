import { useState, useEffect } from "react";
import { Heart, Filter, Search } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import AdoptionModal from "@/components/AdoptionModal";
import { useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Animal {
  id: string;
  name: string;
  breed: string | null;
  age: number | null;
  species: string;
  rescue_story: string | null;
  health_status: string | null;
  current_status: string | null;
  image_url: string | null;
  rescue_date: string;
}

const Adopt = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedAge, setSelectedAge] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAnimal, setSelectedAnimal] = useState<Animal | null>(null);
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    fetchAnimals();

    // Set up real-time subscription for animal updates
    const channel = supabase
      .channel('adopt-page-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'rescued_animals'
        },
        () => {
          fetchAnimals();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Check for pre-filled animal data from rescued animals page
  useEffect(() => {
    if (location.state?.prefilledAnimal && animals.length > 0) {
      const prefilledAnimal = animals.find(a => a.id === location.state.prefilledAnimal.id);
      if (prefilledAnimal) {
        setSelectedAnimal(prefilledAnimal);
        setIsModalOpen(true);
      }
    }
  }, [location.state, animals]);

  const fetchAnimals = async () => {
    try {
      const { data, error } = await supabase
        .from('rescued_animals')
        .select('*')
        .eq('current_status', 'Available')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAnimals(data || []);
    } catch (error: any) {
      console.error('Error fetching animals:', error);
      toast({
        title: "Error",
        description: "Failed to load animals. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAdoptClick = (animal: Animal) => {
    setSelectedAnimal(animal);
    setIsModalOpen(true);
  };

  const filteredAnimals = animals.filter(animal => {
    const matchesSearch = animal.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (animal.breed && animal.breed.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = selectedType === "all" || 
                       animal.species.toLowerCase() === selectedType.toLowerCase();
    const matchesAge = selectedAge === "all" || 
                      (selectedAge === "young" && animal.age !== null && animal.age <= 2) ||
                      (selectedAge === "adult" && animal.age !== null && animal.age > 2 && animal.age <= 6) ||
                      (selectedAge === "senior" && animal.age !== null && animal.age > 6);
    
    return matchesSearch && matchesType && matchesAge;
  });

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Find Your Perfect Companion
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Each of our animals is waiting for their forever home. Browse our available pets and find your new best friend.
          </p>
        </div>

        {/* Filters */}
        <div className="mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2 mb-4">
                <Filter className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold">Filter Animals</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name or breed..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Animal Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="dog">Dogs</SelectItem>
                    <SelectItem value="cat">Cats</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={selectedAge} onValueChange={setSelectedAge}>
                  <SelectTrigger>
                    <SelectValue placeholder="Age Group" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Ages</SelectItem>
                    <SelectItem value="young">Young (0-2 years)</SelectItem>
                    <SelectItem value="adult">Adult (3-6 years)</SelectItem>
                    <SelectItem value="senior">Senior (7+ years)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Results */}
        <div className="mb-6">
          <p className="text-muted-foreground">
            {loading ? "Loading animals..." : `Showing ${filteredAnimals.length} of ${animals.length} available animals`}
          </p>
        </div>

        {/* Animals Grid */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-xl text-muted-foreground">Loading animals...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredAnimals.map((animal) => (
              <Card key={animal.id} className="animal-card overflow-hidden">
                {animal.image_url ? (
                  <img 
                    src={animal.image_url} 
                    alt={animal.name}
                    className="w-full h-64 object-cover"
                  />
                ) : (
                  <div className="text-8xl text-center py-8 bg-muted/30">
                    {animal.species === "Dog" ? "🐕" : animal.species === "Cat" ? "🐱" : "🐾"}
                  </div>
                )}
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-2xl font-bold text-foreground">{animal.name}</h3>
                    <span className="text-sm px-3 py-1 rounded-full bg-primary/10 text-primary">
                      {animal.species}
                    </span>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    {animal.breed && (
                      <p className="text-muted-foreground">
                        <span className="font-medium">Breed:</span> {animal.breed}
                      </p>
                    )}
                    <p className="text-muted-foreground">
                      <span className="font-medium">Age:</span> {animal.age ? `${animal.age} years` : 'Unknown'}
                    </p>
                    {animal.health_status && (
                      <p className="text-muted-foreground">
                        <span className="font-medium">Health:</span> {animal.health_status}
                      </p>
                    )}
                  </div>

                  {animal.rescue_story && (
                    <p className="text-muted-foreground text-sm mb-6 line-clamp-3">
                      {animal.rescue_story}
                    </p>
                  )}

                  <Button 
                    className="w-full bg-green-600 hover:bg-green-700 text-white"
                    onClick={() => handleAdoptClick(animal)}
                  >
                    <Heart className="h-4 w-4 mr-2" />
                    Adopt {animal.name}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {filteredAnimals.length === 0 && (
          <div className="text-center py-12">
            <p className="text-xl text-muted-foreground mb-4">
              No animals match your current filters.
            </p>
            <Button
              onClick={() => {
                setSearchTerm("");
                setSelectedType("all");
                setSelectedAge("all");
              }}
              variant="outline"
            >
              Clear Filters
            </Button>
          </div>
        )}

        {/* Adoption Process Info */}
        <Card className="mt-12">
          <CardContent className="p-8">
            <h2 className="text-2xl font-bold text-foreground mb-6 text-center">
              Our Adoption Process
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-xl font-bold text-primary">1</span>
                </div>
                <h3 className="font-semibold mb-2">Visit & Meet</h3>
                <p className="text-muted-foreground text-sm">
                  Come visit our shelter and spend time with the animals to find your perfect match.
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-xl font-bold text-primary">2</span>
                </div>
                <h3 className="font-semibold mb-2">Application</h3>
                <p className="text-muted-foreground text-sm">
                  Fill out our adoption application and speak with our adoption counselors.
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-xl font-bold text-primary">3</span>
                </div>
                <h3 className="font-semibold mb-2">Take Home</h3>
                <p className="text-muted-foreground text-sm">
                  Once approved, complete the adoption and welcome your new family member home!
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Adoption Modal */}
        {selectedAnimal && (
          <AdoptionModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            petId={selectedAnimal.id}
            petName={selectedAnimal.name}
          />
        )}
      </div>
    </div>
  );
};

export default Adopt;