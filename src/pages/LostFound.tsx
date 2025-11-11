import { useState, useEffect } from "react";
import { Search, Filter, MapPin, Calendar, Phone, Mail } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { validators, errorMessages } from "@/lib/validators";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

// Shelter contact information
const SHELTER_PHONE = "123-456-7890";
const SHELTER_EMAIL = "contact@pawshaven.org";

interface FoundAnimal {
  id: string;
  pet_name: string;
  species: string;
  description: string;
  last_seen_location: string;
  date_lost: string;
  finder_name: string;
  finder_contact: string;
  status: string;
}

const LostFound = () => {
  const { toast } = useToast();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState<"found" | "report">("found");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterLocation, setFilterLocation] = useState("");
  const [foundAnimals, setFoundAnimals] = useState<FoundAnimal[]>([]);
  const [loading, setLoading] = useState(true);

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

  // Fetch found animals from database (approved submissions only)
  const fetchFoundAnimals = async () => {
    try {
      const { data, error } = await supabase
        .from('found_animals')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Map to match FoundAnimal interface
      const mappedData = (data || []).map(animal => ({
        id: animal.id,
        pet_name: animal.pet_name,
        species: animal.species,
        description: animal.description,
        last_seen_location: animal.last_seen_location,
        date_lost: animal.date_found,
        finder_name: animal.finder_name || 'Shelter',
        finder_contact: animal.contact_number,
        status: animal.status
      }));
      
      setFoundAnimals(mappedData);
    } catch (error: any) {
      console.error('Error fetching found animals:', error);
      toast({
        title: "Error",
        description: "Failed to load found animals. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFoundAnimals();

    // Set up real-time subscription for found animals updates
    const channel = supabase
      .channel('found-animals-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'found_animals'
        },
        (payload) => {
          console.log('Found animals data changed:', payload);
          fetchFoundAnimals();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const filteredAnimals = foundAnimals.filter(animal => {
    const matchesSearch = animal.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         animal.last_seen_location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         animal.pet_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "all" || animal.species.toLowerCase() === filterType.toLowerCase();
    const matchesLocation = !filterLocation || animal.last_seen_location.toLowerCase().includes(filterLocation.toLowerCase());
    
    return matchesSearch && matchesType && matchesLocation;
  });

  const handleReportFormChange = (field: string, value: string) => {
    setReportForm(prev => ({ ...prev, [field]: value }));
  };

  const handleReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    const newErrors: Record<string, string> = {};
    if (!validators.required(reportForm.petName)) newErrors.petName = errorMessages.required;
    if (!validators.required(reportForm.type)) newErrors.type = errorMessages.required;
    if (!validators.email(reportForm.ownerEmail)) newErrors.ownerEmail = errorMessages.email;
    if (!validators.phone(reportForm.ownerPhone)) newErrors.ownerPhone = errorMessages.phone;
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast({
        title: "Validation Error",
        description: "Please fix the errors in the form and try again.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const { error } = await supabase
        .from('lost_found_submissions')
        .insert({
          pet_name: reportForm.petName,
          species: reportForm.type,
          description: `Breed: ${reportForm.breed}, Color: ${reportForm.color}, Size: ${reportForm.size}. ${reportForm.description}`,
          last_seen_location: reportForm.lastSeenLocation,
          date_lost: reportForm.lastSeenDate,
          contact_number: reportForm.ownerPhone,
          status: 'Pending'
        });

      if (error) {
        console.error("Lost/Found submission error:", error);
        toast({
          title: "Submission Failed",
          description: error.message || "There was a problem submitting your report. Please try again.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Report Submitted!",
        description: "Thank you for reporting your lost pet. Our team will review your submission and publish it soon!",
      });

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
      setErrors({});
    } catch (error) {
      console.error("Unexpected error:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    }
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
            {loading ? (
              <div className="text-center py-12">
                <p className="text-xl text-muted-foreground">Loading found animals...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredAnimals.map((animal) => (
                  <Card key={animal.id} className="animal-card">
                    <div className="text-6xl text-center py-6 bg-muted/30">
                      {animal.species.toLowerCase() === 'dog' ? '🐕' : animal.species.toLowerCase() === 'cat' ? '🐱' : '🐾'}
                    </div>
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="text-xl font-bold text-foreground">
                          {animal.pet_name}
                        </h3>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          animal.status === 'found' 
                            ? 'bg-green-500/10 text-green-600' 
                            : 'bg-amber-500/10 text-amber-600'
                        }`}>
                          {animal.status}
                        </span>
                      </div>
                      
                      <div className="space-y-2 mb-4">
                        <p className="text-muted-foreground text-sm">
                          <span className="font-medium">Species:</span> {animal.species}
                        </p>
                        <div className="flex items-center space-x-2 text-muted-foreground text-sm">
                          <Calendar className="h-3 w-3" />
                          <span>Date: {new Date(animal.date_lost).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-muted-foreground text-sm">
                          <MapPin className="h-3 w-3" />
                          <span>{animal.last_seen_location}</span>
                        </div>
                      </div>

                      <p className="text-muted-foreground text-sm mb-4">
                        {animal.description}
                      </p>

                      <div className="text-xs text-muted-foreground mb-4">
                        <p><span className="font-medium">Contact:</span> {animal.finder_name}</p>
                        <p>{animal.finder_contact}</p>
                      </div>

                      <div className="flex space-x-2">
                        <a 
                          href={`tel:${SHELTER_PHONE}`}
                          className="flex-1"
                        >
                          <Button className="w-full hero-button-primary text-sm">
                            <Phone className="h-3 w-3 mr-1" />
                            Call Shelter
                          </Button>
                        </a>
                        <a 
                          href={`mailto:${SHELTER_EMAIL}?subject=Inquiry about ${animal.pet_name}`}
                          className="flex-1"
                        >
                          <Button variant="outline" className="w-full text-sm">
                            <Mail className="h-3 w-3 mr-1" />
                            Email
                          </Button>
                        </a>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

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