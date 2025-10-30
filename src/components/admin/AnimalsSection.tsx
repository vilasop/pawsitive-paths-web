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
import { Plus, Edit, Eye, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

interface Animal {
  id: string;
  name: string;
  species: string;
  breed?: string | null;
  age?: number | null;
  gender?: string | null;
  rescue_date: string;
  rescue_story?: string | null;
  description?: string | null;
  health_status?: string | null;
  current_status: string;
  image_url?: string | null;
  created_at: string;
  source: 'adopt' | 'rescued' | 'both';
  adopt_id?: string;
  rescued_id?: string;
}

export default function AnimalsSection() {
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedAnimal, setSelectedAnimal] = useState<Animal | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [deleteAnimalId, setDeleteAnimalId] = useState<string | null>(null);
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

    // Set up real-time subscriptions for both tables
    const adoptChannel = supabase
      .channel('adopt-animals-admin-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'adopt_animals'
        },
        () => {
          loadAnimals();
        }
      )
      .subscribe();

    const rescuedChannel = supabase
      .channel('rescued-animals-admin-changes')
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
      supabase.removeChannel(adoptChannel);
      supabase.removeChannel(rescuedChannel);
    };
  }, []);

  const loadAnimals = async () => {
    try {
      // Fetch from both tables
      const [adoptResult, rescuedResult] = await Promise.all([
        supabase.from('adopt_animals').select('*').order('created_at', { ascending: false }),
        supabase.from('rescued_animals').select('*').order('created_at', { ascending: false })
      ]);

      if (adoptResult.error) {
        console.error('Error loading adopt animals:', adoptResult.error);
        toast({
          title: "Error loading adopt animals",
          description: adoptResult.error.message,
          variant: "destructive"
        });
      }

      if (rescuedResult.error) {
        console.error('Error loading rescued animals:', rescuedResult.error);
        toast({
          title: "Error loading rescued animals",
          description: rescuedResult.error.message,
          variant: "destructive"
        });
      }

      const adoptAnimals = adoptResult.data || [];
      const rescuedAnimals = rescuedResult.data || [];

      // Create a map to merge animals that exist in both tables
      const animalMap = new Map<string, Animal>();

      // Add adopt animals
      adoptAnimals.forEach(animal => {
        animalMap.set(animal.name.toLowerCase(), {
          ...animal,
          rescue_story: animal.description,
          source: 'adopt' as const,
          adopt_id: animal.id,
        });
      });

      // Add or merge rescued animals
      rescuedAnimals.forEach(animal => {
        const existing = animalMap.get(animal.name.toLowerCase());
        if (existing) {
          // Animal exists in both tables
          animalMap.set(animal.name.toLowerCase(), {
            ...existing,
            ...animal,
            source: 'both' as const,
            rescued_id: animal.id,
            adopt_id: existing.adopt_id,
          });
        } else {
          animalMap.set(animal.name.toLowerCase(), {
            ...animal,
            source: 'rescued' as const,
            rescued_id: animal.id,
          });
        }
      });

      setAnimals(Array.from(animalMap.values()));
    } catch (error: any) {
      console.error('Unexpected error loading animals:', error);
      toast({
        title: "Error",
        description: error?.message || "Failed to load animals",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Test Supabase connectivity on demand
  const testSupabaseConnection = async () => {
    try {
      const { error } = await supabase.from('rescued_animals').select('id').limit(1);
      if (error) {
        console.error('Supabase connection test failed:', error);
        toast({
          title: 'Supabase connection failed',
          description: error.message,
          variant: 'destructive',
        });
        return false;
      }
      return true;
    } catch (err: any) {
      console.error('Supabase connection exception:', err);
      toast({
        title: 'Supabase connection failed',
        description: String(err?.message || err),
        variant: 'destructive',
      });
      return false;
    }
  };

  useEffect(() => { testSupabaseConnection(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Build payloads per-table to match schema
      const adoptData = {
        name: formData.name,
        species: formData.species,
        breed: formData.breed || null,
        age: formData.age ? parseInt(formData.age) : null,
        gender: formData.gender || null,
        rescue_date: formData.rescue_date || new Date().toISOString().split('T')[0],
        health_status: formData.health_status || null,
        current_status: formData.current_status,
        image_url: formData.image_url || null,
        description: formData.rescue_story || null,
      } as const;

      const rescuedData = {
        name: formData.name,
        species: formData.species,
        breed: formData.breed || null,
        age: formData.age ? parseInt(formData.age) : null,
        rescue_date: formData.rescue_date || new Date().toISOString().split('T')[0],
        rescue_story: formData.rescue_story || null,
        health_status: formData.health_status || null,
        current_status: formData.current_status,
        image_url: formData.image_url || null,
      } as const;

      // Execute inserts sequentially to surface precise errors
      let firstError: { table: string; message: string } | null = null;

      if (formData.addTo === 'adopt' || formData.addTo === 'both') {
        const { error } = await supabase.from('adopt_animals').insert([adoptData]);
        if (error && !firstError) {
          console.error('Add Animal (adopt_animals) error:', error);
          firstError = { table: 'adopt_animals', message: error.message };
        }
      }

      if (formData.addTo === 'rescued' || formData.addTo === 'both') {
        const { error } = await supabase.from('rescued_animals').insert([rescuedData]);
        if (error && !firstError) {
          console.error('Add Animal (rescued_animals) error:', error);
          firstError = { table: 'rescued_animals', message: error.message };
        }
      }

      if (firstError) {
        toast({
          title: 'Failed to add animal',
          description: `${firstError.table}: ${firstError.message}`,
          variant: 'destructive',
        });
        return;
      }

      toast({
        title: 'Success',
        description: '✅ Animal added successfully!',
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
        addTo: 'rescued',
      });
      setIsAddDialogOpen(false);
      loadAnimals();
    } catch (error: any) {
      console.error('Unexpected error adding animal:', error);
      toast({
        title: 'Failed to add animal',
        description: String(error?.message || error),
        variant: 'destructive',
      });
    }
  };

  const handleEditAnimal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAnimal) return;

    try {
      const updateData = {
        name: formData.name,
        species: formData.species,
        breed: formData.breed || null,
        age: formData.age ? parseInt(formData.age) : null,
        gender: formData.gender || null,
        rescue_date: formData.rescue_date,
        health_status: formData.health_status || null,
        current_status: formData.current_status,
        image_url: formData.image_url || null,
      };

      const adoptUpdateData = {
        ...updateData,
        description: formData.rescue_story || null,
      };

      const rescuedUpdateData = {
        ...updateData,
        rescue_story: formData.rescue_story || null,
      };

      let hasError = false;
      let errorMessage = '';

      // Update based on source
      if (selectedAnimal.source === 'adopt' || selectedAnimal.source === 'both') {
        const { error } = await supabase
          .from('adopt_animals')
          .update(adoptUpdateData)
          .eq('id', selectedAnimal.adopt_id!);

        if (error) {
          hasError = true;
          errorMessage = `adopt_animals: ${error.message}`;
          console.error('Error updating adopt animal:', error);
        }
      }

      if (selectedAnimal.source === 'rescued' || selectedAnimal.source === 'both') {
        const { error } = await supabase
          .from('rescued_animals')
          .update(rescuedUpdateData)
          .eq('id', selectedAnimal.rescued_id!);

        if (error) {
          hasError = true;
          errorMessage = errorMessage ? `${errorMessage}, rescued_animals: ${error.message}` : `rescued_animals: ${error.message}`;
          console.error('Error updating rescued animal:', error);
        }
      }

      if (hasError) {
        toast({
          title: "Error updating animal",
          description: errorMessage,
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Success",
        description: "✅ Animal updated successfully!"
      });

      setIsEditDialogOpen(false);
      setSelectedAnimal(null);
      loadAnimals();
    } catch (error: any) {
      console.error('Unexpected error updating animal:', error);
      toast({
        title: "Error",
        description: error?.message || "Failed to update animal",
        variant: "destructive"
      });
    }
  };

  const handleDeleteAnimal = async () => {
    if (!deleteAnimalId) return;

    const animal = animals.find(a => a.id === deleteAnimalId);
    if (!animal) return;

    try {
      let hasError = false;
      let errorMessage = '';

      // Delete from both tables if needed
      if (animal.source === 'adopt' || animal.source === 'both') {
        const { error } = await supabase
          .from('adopt_animals')
          .delete()
          .eq('id', animal.adopt_id!);

        if (error) {
          hasError = true;
          errorMessage = `adopt_animals: ${error.message}`;
          console.error('Error deleting from adopt_animals:', error);
        }
      }

      if (animal.source === 'rescued' || animal.source === 'both') {
        const { error } = await supabase
          .from('rescued_animals')
          .delete()
          .eq('id', animal.rescued_id!);

        if (error) {
          hasError = true;
          errorMessage = errorMessage ? `${errorMessage}, rescued_animals: ${error.message}` : `rescued_animals: ${error.message}`;
          console.error('Error deleting from rescued_animals:', error);
        }
      }

      if (hasError) {
        toast({
          title: "Error deleting animal",
          description: errorMessage,
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Success",
        description: "✅ Animal deleted successfully!"
      });

      setDeleteAnimalId(null);
      loadAnimals();
    } catch (error: any) {
      console.error('Unexpected error deleting animal:', error);
      toast({
        title: "Error",
        description: error?.message || "Failed to delete animal",
        variant: "destructive"
      });
    }
  };

  const updateAnimalStatus = async (animal: Animal, newStatus: string) => {
    try {
      let hasError = false;
      let errorMessage = '';

      if (animal.source === 'adopt' || animal.source === 'both') {
        const { error } = await supabase
          .from('adopt_animals')
          .update({ current_status: newStatus })
          .eq('id', animal.adopt_id!);

        if (error) {
          hasError = true;
          errorMessage = `adopt_animals: ${error.message}`;
        }
      }

      if (animal.source === 'rescued' || animal.source === 'both') {
        const { error } = await supabase
          .from('rescued_animals')
          .update({ current_status: newStatus })
          .eq('id', animal.rescued_id!);

        if (error) {
          hasError = true;
          errorMessage = errorMessage ? `${errorMessage}, rescued_animals: ${error.message}` : `rescued_animals: ${error.message}`;
        }
      }

      if (hasError) {
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Success",
        description: "Animal status updated"
      });
      loadAnimals();
    } catch (error: any) {
      console.error('Error updating animal status:', error);
      toast({
        title: "Error",
        description: error?.message || "Failed to update animal status",
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

  const getSourceBadge = (source: 'adopt' | 'rescued' | 'both') => {
    switch (source) {
      case 'adopt': return { text: 'Adopt Page', variant: 'default' as const };
      case 'rescued': return { text: 'Rescued Page', variant: 'secondary' as const };
      case 'both': return { text: 'Both Pages', variant: 'outline' as const };
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
                <TableHead>Location</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Rescue Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {animals.map((animal) => {
                const sourceBadge = getSourceBadge(animal.source);
                return (
                  <TableRow key={animal.id}>
                    <TableCell className="font-medium">{animal.name}</TableCell>
                    <TableCell>{animal.species}</TableCell>
                    <TableCell>{animal.age || 'Unknown'}</TableCell>
                    <TableCell>
                      <Badge variant={sourceBadge.variant}>{sourceBadge.text}</Badge>
                    </TableCell>
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
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedAnimal(animal);
                            setFormData({
                              name: animal.name,
                              species: animal.species,
                              breed: animal.breed || '',
                              age: animal.age?.toString() || '',
                              gender: animal.gender || '',
                              rescue_date: animal.rescue_date,
                              rescue_story: animal.rescue_story || animal.description || '',
                              health_status: animal.health_status || '',
                              current_status: animal.current_status,
                              image_url: animal.image_url || '',
                              addTo: animal.source === 'both' ? 'both' : animal.source === 'adopt' ? 'adopt' : 'rescued'
                            });
                            setIsEditDialogOpen(true);
                          }}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setDeleteAnimalId(animal.id)}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                        <Select
                          value={animal.current_status}
                          onValueChange={(value) => updateAnimalStatus(animal, value)}
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
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Animal Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Animal</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditAnimal} className="space-y-4">
            <div>
              <Label htmlFor="edit-name">Name</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="edit-species">Species</Label>
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
              <Label htmlFor="edit-breed">Breed (Optional)</Label>
              <Input
                id="edit-breed"
                value={formData.breed}
                onChange={(e) => setFormData({ ...formData, breed: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="edit-age">Age (Optional)</Label>
              <Input
                id="edit-age"
                type="number"
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="edit-gender">Gender</Label>
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
              <Label htmlFor="edit-rescue_date">Rescue Date</Label>
              <Input
                id="edit-rescue_date"
                type="date"
                value={formData.rescue_date}
                onChange={(e) => setFormData({ ...formData, rescue_date: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="edit-health_status">Health Status</Label>
              <Input
                id="edit-health_status"
                value={formData.health_status}
                onChange={(e) => setFormData({ ...formData, health_status: e.target.value })}
                placeholder="e.g., Healthy, Under treatment"
              />
            </div>
            <div>
              <Label htmlFor="edit-rescue_story">Story/Description (Optional)</Label>
              <Textarea
                id="edit-rescue_story"
                value={formData.rescue_story}
                onChange={(e) => setFormData({ ...formData, rescue_story: e.target.value })}
                placeholder="Tell the story..."
              />
            </div>
            <div>
              <Label htmlFor="edit-image_url">Image URL (Optional)</Label>
              <Input
                id="edit-image_url"
                value={formData.image_url}
                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                placeholder="https://example.com/image.jpg"
              />
            </div>
            <div>
              <Label htmlFor="edit-current_status">Current Status</Label>
              <Select value={formData.current_status} onValueChange={(value) => setFormData({ ...formData, current_status: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Available">Available</SelectItem>
                  <SelectItem value="Adopted">Adopted</SelectItem>
                  <SelectItem value="Under Care">Under Care</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" className="w-full">Update Animal</Button>
          </form>
        </DialogContent>
      </Dialog>

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
                  <Label className="font-semibold">Gender</Label>
                  <p>{selectedAnimal.gender || 'Unknown'}</p>
                </div>
                <div>
                  <Label className="font-semibold">Location</Label>
                  <p>
                    <Badge variant={getSourceBadge(selectedAnimal.source).variant}>
                      {getSourceBadge(selectedAnimal.source).text}
                    </Badge>
                  </p>
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
              {(selectedAnimal.rescue_story || selectedAnimal.description) && (
                <div>
                  <Label className="font-semibold">Story/Description</Label>
                  <p className="mt-1 text-sm text-muted-foreground">{selectedAnimal.rescue_story || selectedAnimal.description}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteAnimalId} onOpenChange={(open) => !open && setDeleteAnimalId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this animal from the database. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteAnimal} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}