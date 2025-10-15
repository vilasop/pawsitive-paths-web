import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Check, X, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface LostFoundSubmission {
  id: string;
  pet_name: string;
  species: string;
  description: string;
  last_seen_location: string;
  date_lost: string;
  contact_number: string;
  photo_url: string | null;
  status: string;
  submitted_at: string;
}

export default function LostFoundManagement() {
  const [submissions, setSubmissions] = useState<LostFoundSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState<LostFoundSubmission | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadSubmissions();

    // Set up real-time subscription
    const channel = supabase
      .channel('lost-found-submissions-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'lost_found_submissions'
        },
        () => {
          loadSubmissions();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadSubmissions = async () => {
    try {
      const { data, error } = await supabase
        .from('lost_found_submissions')
        .select('*')
        .order('submitted_at', { ascending: false });

      if (error) throw error;
      setSubmissions(data || []);
    } catch (error) {
      console.error('Error loading submissions:', error);
      toast({
        title: "Error",
        description: "Failed to load submissions",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (submission: LostFoundSubmission) => {
    try {
      // Insert into found_animals table
      const { error: insertError } = await supabase
        .from('found_animals')
        .insert({
          pet_name: submission.pet_name,
          species: submission.species,
          description: submission.description,
          last_seen_location: submission.last_seen_location,
          date_found: submission.date_lost,
          contact_number: submission.contact_number,
          photo_url: submission.photo_url,
          finder_name: 'Shelter',
          status: 'Found',
          original_submission_id: submission.id
        });

      if (insertError) throw insertError;

      // Update submission status to Approved
      const { error: updateError } = await supabase
        .from('lost_found_submissions')
        .update({ 
          status: 'Approved',
          reviewed_at: new Date().toISOString()
        })
        .eq('id', submission.id);

      if (updateError) throw updateError;

      toast({
        title: "Success",
        description: "Submission approved and added to found animals"
      });
      loadSubmissions();
    } catch (error) {
      console.error('Error approving submission:', error);
      toast({
        title: "Error",
        description: "Failed to approve submission",
        variant: "destructive"
      });
    }
  };

  const handleReject = async (submissionId: string) => {
    try {
      const { error } = await supabase
        .from('lost_found_submissions')
        .update({ 
          status: 'Rejected',
          reviewed_at: new Date().toISOString()
        })
        .eq('id', submissionId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Submission rejected"
      });
      loadSubmissions();
    } catch (error) {
      console.error('Error rejecting submission:', error);
      toast({
        title: "Error",
        description: "Failed to reject submission",
        variant: "destructive"
      });
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'Pending': return 'default';
      case 'Approved': return 'secondary';
      case 'Rejected': return 'destructive';
      default: return 'outline';
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading submissions...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Lost & Found Management</h2>
        <p className="text-muted-foreground">Review and manage lost/found pet submissions</p>
      </div>

      <Card>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Pet Name</TableHead>
                <TableHead>Species</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Date Lost</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {submissions.map((submission) => (
                <TableRow key={submission.id}>
                  <TableCell className="font-medium">{submission.pet_name}</TableCell>
                  <TableCell>{submission.species}</TableCell>
                  <TableCell>{submission.last_seen_location}</TableCell>
                  <TableCell>{new Date(submission.date_lost).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(submission.status)}>
                      {submission.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{new Date(submission.submitted_at).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedSubmission(submission);
                          setIsViewDialogOpen(true);
                        }}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      {submission.status === 'Pending' && (
                        <>
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => handleApprove(submission)}
                          >
                            <Check className="w-4 h-4 mr-1" />
                            Approve
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleReject(submission.id)}
                          >
                            <X className="w-4 h-4 mr-1" />
                            Reject
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* View Submission Details Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Submission Details</DialogTitle>
          </DialogHeader>
          {selectedSubmission && (
            <div className="space-y-4">
              {selectedSubmission.photo_url && (
                <div className="text-center">
                  <img
                    src={selectedSubmission.photo_url}
                    alt={selectedSubmission.pet_name}
                    className="max-w-full h-48 object-cover rounded-lg mx-auto"
                  />
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="font-semibold">Pet Name</p>
                  <p>{selectedSubmission.pet_name}</p>
                </div>
                <div>
                  <p className="font-semibold">Species</p>
                  <p>{selectedSubmission.species}</p>
                </div>
                <div>
                  <p className="font-semibold">Date Lost</p>
                  <p>{new Date(selectedSubmission.date_lost).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="font-semibold">Status</p>
                  <Badge variant={getStatusBadgeVariant(selectedSubmission.status)}>
                    {selectedSubmission.status}
                  </Badge>
                </div>
                <div>
                  <p className="font-semibold">Contact Number</p>
                  <p>{selectedSubmission.contact_number}</p>
                </div>
                <div>
                  <p className="font-semibold">Last Seen Location</p>
                  <p>{selectedSubmission.last_seen_location}</p>
                </div>
              </div>
              <div>
                <p className="font-semibold">Description</p>
                <p className="mt-1 text-sm text-muted-foreground">{selectedSubmission.description}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}