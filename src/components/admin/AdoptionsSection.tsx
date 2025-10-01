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
  full_name: string;
  email: string;
  contact_number: string;
  pet_id?: string;
  has_pet?: boolean;
  reason?: string;
  aadhar: string;
  submitted_at: string;
  status: string;
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
        supabase.from('adoptions').select('*').order('submitted_at', { ascending: false }),
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

  const getAnimalName = (petId?: string) => {
    if (!petId) return 'Not specified';
    const animal = animals.find(a => a.id === petId);
    return animal ? `${animal.name} (${animal.species})` : 'Unknown';
  };

  const handleApproveAdoption = async (adoptionId: string, petId?: string) => {
    if (!petId) {
      toast({
        title: "Error",
        description: "Cannot approve adoption without animal selection",
        variant: "destructive"
      });
      return;
    }

    try {
      // Update adoption status
      const { error: adoptionError } = await supabase
        .from('adoptions')
        .update({ status: 'approved' })
        .eq('id', adoptionId);

      if (adoptionError) throw adoptionError;

      // Update animal status to adopted
      const { error: animalError } = await supabase
        .from('rescued_animals')
        .update({ current_status: 'Adopted' })
        .eq('id', petId);

      if (animalError) throw animalError;

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
      // Update adoption status to rejected
      const { error } = await supabase
        .from('adoptions')
        .update({ status: 'rejected' })
        .eq('id', adoptionId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Adoption request rejected"
      });

      loadData();
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
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {adoptions.map((adoption) => (
                <TableRow key={adoption.id}>
                  <TableCell className="font-medium">{adoption.full_name}</TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>{adoption.email}</div>
                      <div className="text-muted-foreground">{adoption.contact_number}</div>
                    </div>
                  </TableCell>
                  <TableCell>{getAnimalName(adoption.pet_id)}</TableCell>
                  <TableCell>
                    <Badge variant={
                      adoption.status === 'approved' ? 'default' :
                      adoption.status === 'rejected' ? 'destructive' :
                      'secondary'
                    }>
                      {adoption.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{new Date(adoption.submitted_at).toLocaleDateString()}</TableCell>
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
                        onClick={() => handleApproveAdoption(adoption.id, adoption.pet_id)}
                        disabled={!adoption.pet_id || adoption.status !== 'pending'}
                      >
                        <Check className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleRejectAdoption(adoption.id)}
                        disabled={adoption.status !== 'pending'}
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
                  <p>{selectedAdoption.full_name}</p>
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
                  <p>{selectedAdoption.aadhar || 'Not provided'}</p>
                </div>
                <div>
                  <strong>Animal:</strong>
                  <p>{getAnimalName(selectedAdoption.pet_id)}</p>
                </div>
                <div>
                  <strong>Already has pets:</strong>
                  <p>
                    <Badge variant={selectedAdoption.has_pet ? "secondary" : "outline"}>
                      {selectedAdoption.has_pet ? "Yes" : "No"}
                    </Badge>
                  </p>
                </div>
                <div className="col-span-2">
                  <strong>Application Date:</strong>
                  <p>{new Date(selectedAdoption.submitted_at).toLocaleString()}</p>
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
                    handleApproveAdoption(selectedAdoption.id, selectedAdoption.pet_id);
                    setIsViewDialogOpen(false);
                  }}
                  disabled={!selectedAdoption.pet_id}
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