import { useState, useEffect } from "react";
import { Heart, Filter, Search, Calendar, MapPin } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import AdoptionModal from "@/components/AdoptionModal";
import { useLocation } from "react-router-dom";

interface Animal {
  id: number;
  name: string;
  breed: string;
  age: string;
  gender: string;
  size: string;
  description: string;
  image: string;
  personality: string[];
  medicalStatus: string;
  adoptionFee: number;
}

const Adopt = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedSize, setSelectedSize] = useState("all");
  const [selectedAge, setSelectedAge] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAnimal, setSelectedAnimal] = useState<Animal | null>(null);
  const location = useLocation();

  // Check for pre-filled animal data from rescued animals page
  useEffect(() => {
    if (location.state?.prefilledAnimal) {
      const prefilledAnimal = location.state.prefilledAnimal;
      // Convert rescued animal format to adopt page format
      const convertedAnimal: Animal = {
        id: parseInt(prefilledAnimal.id) || 999,
        name: prefilledAnimal.name,
        breed: prefilledAnimal.breed,
        age: `${prefilledAnimal.age} years`,
        gender: "Unknown",
        size: "Medium",
        description: prefilledAnimal.rescue_story,
        image: prefilledAnimal.species === "Dog" ? "🐕" : prefilledAnimal.species === "Cat" ? "🐱" : "🐾",
        personality: ["Rescued", "Loving"],
        medicalStatus: prefilledAnimal.health_status,
        adoptionFee: 200
      };
      setSelectedAnimal(convertedAnimal);
      setIsModalOpen(true);
    }
  }, [location.state]);

  const handleAdoptClick = (animal: Animal) => {
    setSelectedAnimal(animal);
    setIsModalOpen(true);
  };

  // Sample animals data
  const animals: Animal[] = [
    {
      id: 1,
      name: "Buddy",
      breed: "Golden Retriever Mix",
      age: "3 years",
      gender: "Male",
      size: "Large",
      description: "Buddy is a gentle giant who loves children and other dogs. He's fully house-trained and knows basic commands.",
      image: "🐕",
      personality: ["Friendly", "Gentle", "Playful"],
      medicalStatus: "Fully vaccinated, neutered",
      adoptionFee: 200
    },
    {
      id: 2,
      name: "Luna",
      breed: "Domestic Shorthair",
      age: "2 years",
      gender: "Female",
      size: "Medium",
      description: "Luna is a sweet, independent cat who enjoys sunny windowsills and gentle pets. She would do well in a quiet home.",
      image: "🐱",
      personality: ["Independent", "Calm", "Affectionate"],
      medicalStatus: "Fully vaccinated, spayed",
      adoptionFee: 150
    },
    {
      id: 3,
      name: "Max",
      breed: "Border Collie Mix",
      age: "5 years",
      gender: "Male",
      size: "Medium",
      description: "Max is an intelligent and active dog who needs an experienced owner. He loves learning new tricks and going on adventures.",
      image: "🐶",
      personality: ["Intelligent", "Active", "Loyal"],
      medicalStatus: "Fully vaccinated, neutered",
      adoptionFee: 175
    },
    {
      id: 4,
      name: "Whiskers",
      breed: "Maine Coon Mix",
      age: "4 years",
      gender: "Male",
      size: "Large",
      description: "Whiskers is a majestic cat with a laid-back personality. He gets along well with other cats and enjoys being the center of attention.",
      image: "🐱",
      personality: ["Laid-back", "Social", "Attention-seeking"],
      medicalStatus: "Fully vaccinated, neutered",
      adoptionFee: 175
    },
    {
      id: 5,
      name: "Bella",
      breed: "Labrador Mix",
      age: "1 year",
      gender: "Female",
      size: "Medium",
      description: "Bella is a young, energetic puppy who loves to play and learn. She would thrive in an active family with a yard.",
      image: "🐕",
      personality: ["Energetic", "Playful", "Smart"],
      medicalStatus: "Fully vaccinated, will be spayed",
      adoptionFee: 225
    },
    {
      id: 6,
      name: "Shadow",
      breed: "Domestic Longhair",
      age: "6 years",
      gender: "Female",
      size: "Medium",
      description: "Shadow is a senior cat looking for a quiet retirement home. She's very gentle and loves to cuddle.",
      image: "🐱",
      personality: ["Gentle", "Cuddly", "Quiet"],
      medicalStatus: "Fully vaccinated, spayed",
      adoptionFee: 100
    }
  ];

  const filteredAnimals = animals.filter(animal => {
    const matchesSearch = animal.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         animal.breed.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === "all" || 
                       (selectedType === "dog" && animal.image === "🐕" || animal.image === "🐶") ||
                       (selectedType === "cat" && animal.image === "🐱");
    const matchesSize = selectedSize === "all" || animal.size.toLowerCase() === selectedSize.toLowerCase();
    const matchesAge = selectedAge === "all" || 
                      (selectedAge === "young" && parseInt(animal.age) <= 2) ||
                      (selectedAge === "adult" && parseInt(animal.age) > 2 && parseInt(animal.age) <= 6) ||
                      (selectedAge === "senior" && parseInt(animal.age) > 6);
    
    return matchesSearch && matchesType && matchesSize && matchesAge;
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
                
                <Select value={selectedSize} onValueChange={setSelectedSize}>
                  <SelectTrigger>
                    <SelectValue placeholder="Size" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Sizes</SelectItem>
                    <SelectItem value="small">Small</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="large">Large</SelectItem>
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
            Showing {filteredAnimals.length} of {animals.length} available animals
          </p>
        </div>

        {/* Animals Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredAnimals.map((animal) => (
            <Card key={animal.id} className="animal-card overflow-hidden">
              <div className="text-8xl text-center py-8 bg-muted/30">
                {animal.image}
              </div>
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-2xl font-bold text-foreground">{animal.name}</h3>
                  <span className="text-sm px-3 py-1 rounded-full bg-primary/10 text-primary">
                    ${animal.adoptionFee}
                  </span>
                </div>
                
                <div className="space-y-2 mb-4">
                  <p className="text-muted-foreground">
                    <span className="font-medium">Breed:</span> {animal.breed}
                  </p>
                  <p className="text-muted-foreground">
                    <span className="font-medium">Age:</span> {animal.age} • {animal.gender} • {animal.size}
                  </p>
                  <p className="text-muted-foreground">
                    <span className="font-medium">Medical:</span> {animal.medicalStatus}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  {animal.personality.map((trait, index) => (
                    <span
                      key={index}
                      className="text-xs px-2 py-1 rounded-full bg-secondary/10 text-secondary"
                    >
                      {trait}
                    </span>
                  ))}
                </div>

                <p className="text-muted-foreground text-sm mb-6">
                  {animal.description}
                </p>

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

        {filteredAnimals.length === 0 && (
          <div className="text-center py-12">
            <p className="text-xl text-muted-foreground mb-4">
              No animals match your current filters.
            </p>
            <Button
              onClick={() => {
                setSearchTerm("");
                setSelectedType("all");
                setSelectedSize("all");
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