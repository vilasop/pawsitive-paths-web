import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Edit, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Animal {
  id: string;
  name: string;
  species: string;
  breed?: string;
  age?: number;
  rescue_date: string;
  rescue_story?: string;
  health_status?: string;
  current_status: string;
  image_url?: string;
  created_at: string;
}

export default function AnimalsSection() {
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedAnimal, setSelectedAnimal] = useState<Animal | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    species: '',
    breed: '',
    age: '',
    gender: '',
    rescue_date: '',
    rescue_story: '',
    health_status: '',
    current_status: 'Available',
    image_url: '',
    addTo: 'rescued' // New field: 'adopt', 'rescued', or 'both'
  });

  useEffect(() => {
    loadAnimals();

    // Set up real-time subscription
    const channel = supabase
      .channel('rescued-animals-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'rescued_animals'
        },
        () => {
          loadAnimals();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadAnimals = async () => {
    try {
      const { data, error } = await supabase
        .from('rescued_animals')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAnimals(data || []);
    } catch (error) {
      console.error('Error loading animals:', error);
      toast({
        title: "Error",
        description: "Failed to load animals",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const animalData = {
        name: formData.name,
        species: formData.species,
        breed: formData.breed,
        age: formData.age ? parseInt(formData.age) : null,
        gender: formData.gender,
        rescue_date: formData.rescue_date || new Date().toISOString().split('T')[0],
        rescue_story: formData.rescue_story,
        health_status: formData.health_status,
        current_status: formData.current_status,
        image_url: formData.image_url,
        description: formData.rescue_story
      };

      // Insert based on selection
      const insertPromises = [];
      
      if (formData.addTo === 'adopt' || formData.addTo === 'both') {
        insertPromises.push(
          supabase.from('adopt_animals').insert([animalData])
        );
      }
      
      if (formData.addTo === 'rescued' || formData.addTo === 'both') {
        insertPromises.push(
          supabase.from('rescued_animals').insert([animalData])
        );
      }

      const results = await Promise.all(insertPromises);
      const errors = results.filter(r => r.error);
      
      if (errors.length > 0) {
        throw errors[0].error;
      }

      const successMessage = formData.addTo === 'both' 
        ? "✅ Animal successfully added to both Adopt and Rescued sections"
        : formData.addTo === 'adopt'
        ? "✅ Animal successfully added to Adopt Page"
        : "✅ Animal successfully added to Rescued Animals Page";

      toast({
        title: "Success",
        description: successMessage
      });

      setFormData({
        name: '',
        species: '',
        breed: '',
        age: '',
        gender: '',
        rescue_date: '',
        rescue_story: '',
        health_status: '',
        current_status: 'Available',
        image_url: '',
        addTo: 'rescued'
      });
      setIsAddDialogOpen(false);
      loadAnimals();
    } catch (error) {
      console.error('Error adding animal:', error);
      toast({
        title: "Error",
        description: "Failed to add animal",
        variant: "destructive"
      });
    }
  };

  const updateAnimalStatus = async (animalId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('rescued_animals')
        .update({ current_status: newStatus })
        .eq('id', animalId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Animal status updated"
      });
      loadAnimals();
    } catch (error) {
      console.error('Error updating animal status:', error);
      toast({
        title: "Error",
        description: "Failed to update animal status",
        variant: "destructive"
      });
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'Available': return 'default';
      case 'Adopted': return 'secondary';
      case 'Under Care': return 'outline';
      default: return 'default';
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading animals...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Manage Animals</h2>
          <p className="text-muted-foreground">Add, edit, and manage rescued animals</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Animal
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Animal</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="species">Species</Label>
                <Select value={formData.species} onValueChange={(value) => setFormData({ ...formData, species: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select species" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Dog">Dog</SelectItem>
                    <SelectItem value="Cat">Cat</SelectItem>
                    <SelectItem value="Bird">Bird</SelectItem>
                    <SelectItem value="Rabbit">Rabbit</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="breed">Breed (Optional)</Label>
                <Input
                  id="breed"
                  value={formData.breed}
                  onChange={(e) => setFormData({ ...formData, breed: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="age">Age (Optional)</Label>
                <Input
                  id="age"
                  type="number"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="gender">Gender</Label>
                <Select value={formData.gender} onValueChange={(value) => setFormData({ ...formData, gender: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                    <SelectItem value="Unknown">Unknown</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="rescue_date">Rescue Date</Label>
                <Input
                  id="rescue_date"
                  type="date"
                  value={formData.rescue_date}
                  onChange={(e) => setFormData({ ...formData, rescue_date: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="health_status">Health Status</Label>
                <Input
                  id="health_status"
                  value={formData.health_status}
                  onChange={(e) => setFormData({ ...formData, health_status: e.target.value })}
                  placeholder="e.g., Healthy, Under treatment"
                />
              </div>
              <div>
                <Label htmlFor="rescue_story">Rescue Story (Optional)</Label>
                <Textarea
                  id="rescue_story"
                  value={formData.rescue_story}
                  onChange={(e) => setFormData({ ...formData, rescue_story: e.target.value })}
                  placeholder="Tell the story of how this animal was rescued..."
                />
              </div>
              <div>
                <Label htmlFor="image_url">Image URL (Optional)</Label>
                <Input
                  id="image_url"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  placeholder="https://example.com/image.jpg"
                />
              </div>
              <div>
                <Label htmlFor="addTo">Add to Page *</Label>
                <Select value={formData.addTo} onValueChange={(value) => setFormData({ ...formData, addTo: value })} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select where to add" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="adopt">Add to Adopt Page Only</SelectItem>
                    <SelectItem value="rescued">Add to Rescued Animals Page Only</SelectItem>
                    <SelectItem value="both">Add to Both Pages</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full">Add Animal</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Species</TableHead>
                <TableHead>Age</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Rescue Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {animals.map((animal) => (
                <TableRow key={animal.id}>
                  <TableCell className="font-medium">{animal.name}</TableCell>
                  <TableCell>{animal.species}</TableCell>
                  <TableCell>{animal.age || 'Unknown'}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(animal.current_status)}>
                      {animal.current_status}
                    </Badge>
                  </TableCell>
                  <TableCell>{new Date(animal.rescue_date).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedAnimal(animal);
                          setIsViewDialogOpen(true);
                        }}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Select
                        value={animal.current_status}
                        onValueChange={(value) => updateAnimalStatus(animal.id, value)}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Available">Available</SelectItem>
                          <SelectItem value="Adopted">Adopted</SelectItem>
                          <SelectItem value="Under Care">Under Care</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* View Animal Details Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Animal Details</DialogTitle>
          </DialogHeader>
          {selectedAnimal && (
            <div className="space-y-4">
              {selectedAnimal.image_url && (
                <div className="text-center">
                  <img
                    src={selectedAnimal.image_url}
                    alt={selectedAnimal.name}
                    className="max-w-full h-48 object-cover rounded-lg mx-auto"
                  />
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="font-semibold">Name</Label>
                  <p>{selectedAnimal.name}</p>
                </div>
                <div>
                  <Label className="font-semibold">Species</Label>
                  <p>{selectedAnimal.species}</p>
                </div>
                <div>
                  <Label className="font-semibold">Breed</Label>
                  <p>{selectedAnimal.breed || 'Unknown'}</p>
                </div>
                <div>
                  <Label className="font-semibold">Age</Label>
                  <p>{selectedAnimal.age || 'Unknown'}</p>
                </div>
                <div>
                  <Label className="font-semibold">Status</Label>
                  <p>
                    <Badge variant={getStatusBadgeVariant(selectedAnimal.current_status)}>
                      {selectedAnimal.current_status}
                    </Badge>
                  </p>
                </div>
                <div>
                  <Label className="font-semibold">Health Status</Label>
                  <p>{selectedAnimal.health_status || 'Not specified'}</p>
                </div>
              </div>
              {selectedAnimal.rescue_story && (
                <div>
                  <Label className="font-semibold">Rescue Story</Label>
                  <p className="mt-1 text-sm text-muted-foreground">{selectedAnimal.rescue_story}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}