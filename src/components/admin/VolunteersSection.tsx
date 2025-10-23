import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Check, X, Eye, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Volunteer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  age: number;
  experience_with_animals: boolean;
  why_volunteer: string;
  created_at: string;
  status: string;
}

export default function VolunteersSection() {
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [filteredVolunteers, setFilteredVolunteers] = useState<Volunteer[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVolunteer, setSelectedVolunteer] = useState<Volunteer | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    loadVolunteers();

    // Set up real-time subscription
    const channel = supabase
      .channel('volunteers-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'volunteers'
        },
        () => {
          loadVolunteers();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    const filtered = volunteers.filter(volunteer =>
      volunteer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      volunteer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      volunteer.phone.includes(searchTerm)
    );
    setFilteredVolunteers(filtered);
  }, [volunteers, searchTerm]);

  const loadVolunteers = async () => {
    try {
      const { data, error } = await supabase
        .from('volunteers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setVolunteers(data || []);
      setFilteredVolunteers(data || []);
    } catch (error) {
      console.error('Error loading volunteers:', error);
      toast({
        title: "Error",
        description: "Failed to load volunteers",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApproveVolunteer = async (volunteerId: string) => {
    try {
      const { error } = await supabase
        .from('volunteers')
        .update({ status: 'approved' })
        .eq('id', volunteerId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Volunteer application approved"
      });

      loadVolunteers();
    } catch (error) {
      console.error('Error approving volunteer:', error);
      toast({
        title: "Error",
        description: "Failed to approve volunteer",
        variant: "destructive"
      });
    }
  };

  const handleRejectVolunteer = async (volunteerId: string) => {
    try {
      const { error } = await supabase
        .from('volunteers')
        .update({ status: 'rejected' })
        .eq('id', volunteerId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Volunteer application rejected"
      });

      loadVolunteers();
    } catch (error) {
      console.error('Error rejecting volunteer:', error);
      toast({
        title: "Error",
        description: "Failed to reject volunteer",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading volunteers...</div>;
  }

  const experiencedVolunteers = volunteers.filter(v => v.experience_with_animals);
  const newVolunteers = volunteers.filter(v => !v.experience_with_animals);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Volunteer Applications</h2>
        <p className="text-muted-foreground">Review and approve volunteer applications</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Volunteers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{volunteers.length}</div>
            <p className="text-xs text-muted-foreground">All applications</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">With Experience</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{experiencedVolunteers.length}</div>
            <p className="text-xs text-muted-foreground">Animal experience</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New to Animals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{newVolunteers.length}</div>
            <p className="text-xs text-muted-foreground">No prior experience</p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search volunteers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      {/* Volunteers Table */}
      <Card>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Age</TableHead>
                <TableHead>Experience</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Applied</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredVolunteers.map((volunteer) => (
                <TableRow key={volunteer.id}>
                  <TableCell className="font-medium">{volunteer.name}</TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>{volunteer.email}</div>
                      <div className="text-muted-foreground">{volunteer.phone}</div>
                    </div>
                  </TableCell>
                  <TableCell>{volunteer.age} years</TableCell>
                  <TableCell>
                    <Badge variant={volunteer.experience_with_animals ? "default" : "secondary"}>
                      {volunteer.experience_with_animals ? "Experienced" : "Beginner"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={
                      volunteer.status === 'approved' ? 'default' :
                      volunteer.status === 'rejected' ? 'destructive' :
                      'secondary'
                    }>
                      {volunteer.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>{new Date(volunteer.created_at).toLocaleDateString()}</div>
                      <div className="text-muted-foreground">
                        {new Date(volunteer.created_at).toLocaleTimeString()}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedVolunteer(volunteer);
                          setIsViewDialogOpen(true);
                        }}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => handleApproveVolunteer(volunteer.id)}
                        disabled={volunteer.status !== 'pending'}
                      >
                        <Check className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleRejectVolunteer(volunteer.id)}
                        disabled={volunteer.status !== 'pending'}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredVolunteers.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              {searchTerm ? 'No volunteers found matching your search' : 'No volunteer applications found'}
            </div>
          )}
        </CardContent>
      </Card>

      {/* View Volunteer Details Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Volunteer Application Details</DialogTitle>
          </DialogHeader>
          {selectedVolunteer && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <strong>Name:</strong>
                  <p>{selectedVolunteer.name}</p>
                </div>
                <div>
                  <strong>Age:</strong>
                  <p>{selectedVolunteer.age} years</p>
                </div>
                <div>
                  <strong>Email:</strong>
                  <p>{selectedVolunteer.email}</p>
                </div>
                <div>
                  <strong>Phone:</strong>
                  <p>{selectedVolunteer.phone}</p>
                </div>
                <div className="col-span-2">
                  <strong>Address:</strong>
                  <p>{selectedVolunteer.address}</p>
                </div>
                <div>
                  <strong>Experience with Animals:</strong>
                  <p>
                    <Badge variant={selectedVolunteer.experience_with_animals ? "default" : "secondary"}>
                      {selectedVolunteer.experience_with_animals ? "Yes" : "No"}
                    </Badge>
                  </p>
                </div>
                <div>
                  <strong>Application Date:</strong>
                  <p>{new Date(selectedVolunteer.created_at).toLocaleString()}</p>
                </div>
              </div>
              <div>
                <strong>Why do you want to volunteer?</strong>
                <p className="mt-1 text-sm text-muted-foreground whitespace-pre-wrap">
                  {selectedVolunteer.why_volunteer}
                </p>
              </div>
              <div className="flex space-x-2 pt-4">
                <Button
                  className="flex-1"
                  onClick={() => {
                    handleApproveVolunteer(selectedVolunteer.id);
                    setIsViewDialogOpen(false);
                  }}
                >
                  <Check className="w-4 h-4 mr-2" />
                  Approve Application
                </Button>
                <Button
                  variant="destructive"
                  className="flex-1"
                  onClick={() => {
                    handleRejectVolunteer(selectedVolunteer.id);
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