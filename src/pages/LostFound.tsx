import { useState } from "react";
import { Search, Filter, MapPin, Calendar, Phone, Mail } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

interface FoundAnimal {
  id: number;
  type: string;
  breed: string;
  color: string;
  size: string;
  foundDate: string;
  foundLocation: string;
  description: string;
  image: string;
  contactPhone: string;
  status: string;
}

const LostFound = () => {
  const [activeTab, setActiveTab] = useState<"found" | "report">("found");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterLocation, setFilterLocation] = useState("");

  const [reportForm, setReportForm] = useState({
    petName: "",
    type: "",
    breed: "",
    color: "",
    size: "",
    lastSeenDate: "",
    lastSeenLocation: "",
    description: "",
    ownerName: "",
    ownerPhone: "",
    ownerEmail: "",
  });

  // Sample found animals data
  const foundAnimals: FoundAnimal[] = [
    {
      id: 1,
      type: "Dog",
      breed: "Golden Retriever Mix",
      color: "Golden/Brown",
      size: "Large",
      foundDate: "2024-03-10",
      foundLocation: "Central Park, near playground",
      description: "Friendly male dog, well-groomed, wearing a blue collar without tags. Appears to be house-trained.",
      image: "🐕",
      contactPhone: "+1 (555) 123-4567",
      status: "Available"
    },
    {
      id: 2,
      type: "Cat",
      breed: "Domestic Shorthair",
      color: "Black and White",
      size: "Medium",
      foundDate: "2024-03-08",
      foundLocation: "Downtown area, near library",
      description: "Shy female cat, black with white chest marking. Very thin, appears to have been lost for some time.",
      image: "🐱",
      contactPhone: "+1 (555) 123-4567",
      status: "In Care"
    },
    {
      id: 3,
      type: "Dog",
      breed: "Labrador Mix",
      color: "Chocolate Brown",
      size: "Medium",
      foundDate: "2024-03-12",
      foundLocation: "Riverside Park walking trail",
      description: "Energetic young dog, very friendly with people. No collar or identification found.",
      image: "🐶",
      contactPhone: "+1 (555) 123-4567",
      status: "Available"
    },
    {
      id: 4,
      type: "Cat",
      breed: "Persian Mix",
      color: "Orange Tabby",
      size: "Small",
      foundDate: "2024-03-11",
      foundLocation: "Residential area on Oak Street",
      description: "Long-haired orange cat, very affectionate. Appears to be well-cared for, likely belongs to someone.",
      image: "🐱",
      contactPhone: "+1 (555) 123-4567",
      status: "Available"
    }
  ];

  const filteredAnimals = foundAnimals.filter(animal => {
    const matchesSearch = animal.breed.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         animal.color.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         animal.foundLocation.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "all" || animal.type.toLowerCase() === filterType.toLowerCase();
    const matchesLocation = !filterLocation || animal.foundLocation.toLowerCase().includes(filterLocation.toLowerCase());
    
    return matchesSearch && matchesType && matchesLocation;
  });

  const handleReportFormChange = (field: string, value: string) => {
    setReportForm(prev => ({ ...prev, [field]: value }));
  };

  const handleReportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Thank you for reporting your lost pet. We'll contact you immediately if we find a match!");
    setReportForm({
      petName: "",
      type: "",
      breed: "",
      color: "",
      size: "",
      lastSeenDate: "",
      lastSeenLocation: "",
      description: "",
      ownerName: "",
      ownerPhone: "",
      ownerEmail: "",
    });
  };

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Lost & Found Pets
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Help reunite lost pets with their families. Browse found animals or report your missing pet.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex justify-center mb-8">
          <div className="bg-muted rounded-lg p-1">
            <Button
              variant={activeTab === "found" ? "default" : "ghost"}
              onClick={() => setActiveTab("found")}
              className="mr-1"
            >
              Found Pets
            </Button>
            <Button
              variant={activeTab === "report" ? "default" : "ghost"}
              onClick={() => setActiveTab("report")}
            >
              Report Lost Pet
            </Button>
          </div>
        </div>

        {/* Found Pets Tab */}
        {activeTab === "found" && (
          <div>
            {/* Search and Filters */}
            <Card className="mb-8">
              <CardContent className="p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <Filter className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-semibold">Search Found Pets</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by breed, color, or location..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  
                  <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Animal Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="dog">Dogs</SelectItem>
                      <SelectItem value="cat">Cats</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Input
                    placeholder="Filter by area/location..."
                    value={filterLocation}
                    onChange={(e) => setFilterLocation(e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Results */}
            <div className="mb-6">
              <p className="text-muted-foreground">
                Showing {filteredAnimals.length} of {foundAnimals.length} found animals
              </p>
            </div>

            {/* Found Animals Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAnimals.map((animal) => (
                <Card key={animal.id} className="animal-card">
                  <div className="text-6xl text-center py-6 bg-muted/30">
                    {animal.image}
                  </div>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-xl font-bold text-foreground">
                        {animal.type} Found
                      </h3>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        animal.status === 'Available' 
                          ? 'bg-primary/10 text-primary' 
                          : 'bg-secondary/10 text-secondary'
                      }`}>
                        {animal.status}
                      </span>
                    </div>
                    
                    <div className="space-y-2 mb-4">
                      <p className="text-muted-foreground text-sm">
                        <span className="font-medium">Breed:</span> {animal.breed}
                      </p>
                      <p className="text-muted-foreground text-sm">
                        <span className="font-medium">Color:</span> {animal.color}
                      </p>
                      <p className="text-muted-foreground text-sm">
                        <span className="font-medium">Size:</span> {animal.size}
                      </p>
                      <div className="flex items-center space-x-2 text-muted-foreground text-sm">
                        <Calendar className="h-3 w-3" />
                        <span>Found: {animal.foundDate}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-muted-foreground text-sm">
                        <MapPin className="h-3 w-3" />
                        <span>{animal.foundLocation}</span>
                      </div>
                    </div>

                    <p className="text-muted-foreground text-sm mb-4">
                      {animal.description}
                    </p>

                    <div className="flex space-x-2">
                      <Button className="flex-1 hero-button-primary text-sm">
                        <Phone className="h-3 w-3 mr-1" />
                        Call Shelter
                      </Button>
                      <Button variant="outline" className="flex-1 text-sm">
                        <Mail className="h-3 w-3 mr-1" />
                        Email
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredAnimals.length === 0 && (
              <div className="text-center py-12">
                <p className="text-xl text-muted-foreground mb-4">
                  No animals match your search criteria.
                </p>
                <Button
                  onClick={() => {
                    setSearchTerm("");
                    setFilterType("all");
                    setFilterLocation("");
                  }}
                  variant="outline"
                >
                  Clear Filters
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Report Lost Pet Tab */}
        {activeTab === "report" && (
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl text-center">Report Your Lost Pet</CardTitle>
              <p className="text-muted-foreground text-center">
                Please provide as much detail as possible to help us find your pet.
              </p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleReportSubmit} className="space-y-6">
                {/* Pet Information */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Pet Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="petName">Pet's Name *</Label>
                      <Input
                        id="petName"
                        value={reportForm.petName}
                        onChange={(e) => handleReportFormChange('petName', e.target.value)}
                        className="form-input"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="type">Animal Type *</Label>
                      <Select value={reportForm.type} onValueChange={(value) => handleReportFormChange('type', value)} required>
                        <SelectTrigger className="form-input">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="dog">Dog</SelectItem>
                          <SelectItem value="cat">Cat</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="breed">Breed *</Label>
                      <Input
                        id="breed"
                        value={reportForm.breed}
                        onChange={(e) => handleReportFormChange('breed', e.target.value)}
                        className="form-input"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="color">Color/Markings *</Label>
                      <Input
                        id="color"
                        value={reportForm.color}
                        onChange={(e) => handleReportFormChange('color', e.target.value)}
                        className="form-input"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="size">Size *</Label>
                      <Select value={reportForm.size} onValueChange={(value) => handleReportFormChange('size', value)} required>
                        <SelectTrigger className="form-input">
                          <SelectValue placeholder="Select size" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="small">Small</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="large">Large</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="lastSeenDate">Last Seen Date *</Label>
                      <Input
                        id="lastSeenDate"
                        type="date"
                        value={reportForm.lastSeenDate}
                        onChange={(e) => handleReportFormChange('lastSeenDate', e.target.value)}
                        className="form-input"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <Label htmlFor="lastSeenLocation">Last Seen Location *</Label>
                    <Input
                      id="lastSeenLocation"
                      value={reportForm.lastSeenLocation}
                      onChange={(e) => handleReportFormChange('lastSeenLocation', e.target.value)}
                      className="form-input"
                      placeholder="Street address, park name, or area description"
                      required
                    />
                  </div>
                  
                  <div className="mt-4">
                    <Label htmlFor="description">Detailed Description *</Label>
                    <Textarea
                      id="description"
                      value={reportForm.description}
                      onChange={(e) => handleReportFormChange('description', e.target.value)}
                      className="form-input"
                      rows={4}
                      placeholder="Include any distinguishing features, personality traits, medical conditions, collar/tags, etc."
                      required
                    />
                  </div>
                </div>

                {/* Owner Information */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Your Contact Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="ownerName">Your Name *</Label>
                      <Input
                        id="ownerName"
                        value={reportForm.ownerName}
                        onChange={(e) => handleReportFormChange('ownerName', e.target.value)}
                        className="form-input"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="ownerPhone">Phone Number *</Label>
                      <Input
                        id="ownerPhone"
                        type="tel"
                        value={reportForm.ownerPhone}
                        onChange={(e) => handleReportFormChange('ownerPhone', e.target.value)}
                        className="form-input"
                        required
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label htmlFor="ownerEmail">Email Address *</Label>
                      <Input
                        id="ownerEmail"
                        type="email"
                        value={reportForm.ownerEmail}
                        onChange={(e) => handleReportFormChange('ownerEmail', e.target.value)}
                        className="form-input"
                        required
                      />
                    </div>
                  </div>
                </div>

                <Button type="submit" className="w-full hero-button-primary">
                  <Search className="h-4 w-4 mr-2" />
                  Report Lost Pet
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Tips Section */}
        <Card className="mt-12">
          <CardContent className="p-8">
            <h2 className="text-2xl font-bold text-center mb-8">Tips for Finding Lost Pets</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="text-4xl mb-4">🔍</div>
                <h3 className="font-semibold mb-2">Search Immediately</h3>
                <p className="text-muted-foreground text-sm">
                  Start searching as soon as possible. Most pets are found within the first few hours.
                </p>
              </div>
              <div className="text-center">
                <div className="text-4xl mb-4">📢</div>
                <h3 className="font-semibold mb-2">Spread the Word</h3>
                <p className="text-muted-foreground text-sm">
                  Post on social media, contact local shelters, and put up flyers in your neighborhood.
                </p>
              </div>
              <div className="text-center">
                <div className="text-4xl mb-4">🏠</div>
                <h3 className="font-semibold mb-2">Check Home Base</h3>
                <p className="text-muted-foreground text-sm">
                  Leave familiar items like food, water, and clothing outside your home.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LostFound;