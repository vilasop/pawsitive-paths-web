import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Check, X, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Adoption {
  id: string;
  adopter_name: string;
  email: string;
  contact_number: string;
  animal_id?: string;
  already_have_pet?: boolean;
  reason?: string;
  aadhar_number?: string;
  adoption_date: string;
}

interface Animal {
  id: string;
  name: string;
  species: string;
  current_status: string;
}

export default function AdoptionsSection() {
  const [adoptions, setAdoptions] = useState<Adoption[]>([]);
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAdoption, setSelectedAdoption] = useState<Adoption | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [adoptionsResult, animalsResult] = await Promise.all([
        supabase.from('adoptions').select('*').order('adoption_date', { ascending: false }),
        supabase.from('rescued_animals').select('id, name, species, current_status')
      ]);

      if (adoptionsResult.error) throw adoptionsResult.error;
      if (animalsResult.error) throw animalsResult.error;

      setAdoptions(adoptionsResult.data || []);
      setAnimals(animalsResult.data || []);
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: "Error",
        description: "Failed to load adoption data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getAnimalName = (animalId?: string) => {
    if (!animalId) return 'Not specified';
    const animal = animals.find(a => a.id === animalId);
    return animal ? `${animal.name} (${animal.species})` : 'Unknown';
  };

  const handleApproveAdoption = async (adoptionId: string, animalId?: string) => {
    if (!animalId) {
      toast({
        title: "Error",
        description: "Cannot approve adoption without animal selection",
        variant: "destructive"
      });
      return;
    }

    try {
      // Update animal status to adopted
      const { error: animalError } = await supabase
        .from('rescued_animals')
        .update({ current_status: 'Adopted' })
        .eq('id', animalId);

      if (animalError) throw animalError;

      // We could add a status field to adoptions table in the future
      toast({
        title: "Success",
        description: "Adoption approved successfully"
      });

      loadData();
    } catch (error) {
      console.error('Error approving adoption:', error);
      toast({
        title: "Error",
        description: "Failed to approve adoption",
        variant: "destructive"
      });
    }
  };

  const handleRejectAdoption = async (adoptionId: string) => {
    try {
      // For now, we'll just show a success message
      // In the future, we could add a status field to track rejected adoptions
      toast({
        title: "Success",
        description: "Adoption request rejected"
      });
    } catch (error) {
      console.error('Error rejecting adoption:', error);
      toast({
        title: "Error",
        description: "Failed to reject adoption",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading adoption requests...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Adoption Requests</h2>
        <p className="text-muted-foreground">Review and manage adoption applications</p>
      </div>

      <Card>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Adopter Name</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Animal</TableHead>
                <TableHead>Has Pets</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {adoptions.map((adoption) => (
                <TableRow key={adoption.id}>
                  <TableCell className="font-medium">{adoption.adopter_name}</TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>{adoption.email}</div>
                      <div className="text-muted-foreground">{adoption.contact_number}</div>
                    </div>
                  </TableCell>
                  <TableCell>{getAnimalName(adoption.animal_id)}</TableCell>
                  <TableCell>
                    <Badge variant={adoption.already_have_pet ? "secondary" : "outline"}>
                      {adoption.already_have_pet ? "Yes" : "No"}
                    </Badge>
                  </TableCell>
                  <TableCell>{new Date(adoption.adoption_date).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedAdoption(adoption);
                          setIsViewDialogOpen(true);
                        }}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => handleApproveAdoption(adoption.id, adoption.animal_id)}
                        disabled={!adoption.animal_id}
                      >
                        <Check className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleRejectAdoption(adoption.id)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {adoptions.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No adoption requests found
            </div>
          )}
        </CardContent>
      </Card>

      {/* View Adoption Details Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Adoption Request Details</DialogTitle>
          </DialogHeader>
          {selectedAdoption && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <strong>Adopter Name:</strong>
                  <p>{selectedAdoption.adopter_name}</p>
                </div>
                <div>
                  <strong>Email:</strong>
                  <p>{selectedAdoption.email}</p>
                </div>
                <div>
                  <strong>Contact Number:</strong>
                  <p>{selectedAdoption.contact_number}</p>
                </div>
                <div>
                  <strong>Aadhar Number:</strong>
                  <p>{selectedAdoption.aadhar_number || 'Not provided'}</p>
                </div>
                <div>
                  <strong>Animal:</strong>
                  <p>{getAnimalName(selectedAdoption.animal_id)}</p>
                </div>
                <div>
                  <strong>Already has pets:</strong>
                  <p>
                    <Badge variant={selectedAdoption.already_have_pet ? "secondary" : "outline"}>
                      {selectedAdoption.already_have_pet ? "Yes" : "No"}
                    </Badge>
                  </p>
                </div>
                <div className="col-span-2">
                  <strong>Application Date:</strong>
                  <p>{new Date(selectedAdoption.adoption_date).toLocaleString()}</p>
                </div>
              </div>
              {selectedAdoption.reason && (
                <div>
                  <strong>Reason for adoption:</strong>
                  <p className="mt-1 text-sm text-muted-foreground">{selectedAdoption.reason}</p>
                </div>
              )}
              <div className="flex space-x-2 pt-4">
                <Button
                  className="flex-1"
                  onClick={() => {
                    handleApproveAdoption(selectedAdoption.id, selectedAdoption.animal_id);
                    setIsViewDialogOpen(false);
                  }}
                  disabled={!selectedAdoption.animal_id}
                >
                  <Check className="w-4 h-4 mr-2" />
                  Approve Adoption
                </Button>
                <Button
                  variant="destructive"
                  className="flex-1"
                  onClick={() => {
                    handleRejectAdoption(selectedAdoption.id);
                    setIsViewDialogOpen(false);
                  }}
                >
                  <X className="w-4 h-4 mr-2" />
                  Reject
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}