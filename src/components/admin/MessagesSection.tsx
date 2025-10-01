import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Eye, Search, Mail, Phone } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Message {
  id: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  created_at: string;
  read_status: boolean;
}

export default function MessagesSection() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [filteredMessages, setFilteredMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    loadMessages();
  }, []);

  useEffect(() => {
    const filtered = messages.filter(message =>
      message.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.phone.includes(searchTerm) ||
      message.message.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredMessages(filtered);
  }, [messages, searchTerm]);

  const loadMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setMessages(data || []);
      setFilteredMessages(data || []);
    } catch (error) {
      console.error('Error loading messages:', error);
      toast({
        title: "Error",
        description: "Failed to load messages",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (messageId: string) => {
    try {
      const { error } = await supabase
        .from('contacts')
        .update({ read_status: true })
        .eq('id', messageId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Message marked as read"
      });

      loadMessages();
    } catch (error) {
      console.error('Error marking message as read:', error);
      toast({
        title: "Error",
        description: "Failed to mark message as read",
        variant: "destructive"
      });
    }
  };

  const handleContactResponse = async (message: Message, method: 'email' | 'phone') => {
    // Mark as read when responding
    if (!message.read_status) {
      await handleMarkAsRead(message.id);
    }

    if (method === 'email') {
      window.open(`mailto:${message.email}?subject=Re: Your message to Animal Shelter&body=Dear ${message.name},%0D%0A%0D%0AThank you for contacting us.%0D%0A%0D%0ABest regards,%0D%0AAnimal Shelter Team`);
    } else {
      window.open(`tel:${message.phone}`);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading messages...</div>;
  }

  const todayMessages = messages.filter(m => {
    const today = new Date().toDateString();
    const messageDate = new Date(m.created_at).toDateString();
    return today === messageDate;
  });

  const thisWeekMessages = messages.filter(m => {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return new Date(m.created_at) >= weekAgo;
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Contact Messages</h2>
        <p className="text-muted-foreground">View and respond to contact inquiries</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Messages</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{messages.length}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayMessages.length}</div>
            <p className="text-xs text-muted-foreground">New messages</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Week</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{thisWeekMessages.length}</div>
            <p className="text-xs text-muted-foreground">Past 7 days</p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search messages..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      {/* Messages Table */}
      <Card>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Message Preview</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMessages.map((message) => (
                <TableRow key={message.id}>
                  <TableCell className="font-medium">{message.name}</TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div className="flex items-center">
                        <Mail className="w-3 h-3 mr-1" />
                        {message.email}
                      </div>
                      <div className="flex items-center text-muted-foreground">
                        <Phone className="w-3 h-3 mr-1" />
                        {message.phone}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="max-w-xs truncate text-sm text-muted-foreground">
                      {message.message}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={message.read_status ? "default" : "secondary"}>
                      {message.read_status ? "Read" : "Unread"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>{new Date(message.created_at).toLocaleDateString()}</div>
                      <div className="text-muted-foreground">
                        {new Date(message.created_at).toLocaleTimeString()}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={async () => {
                          if (!message.read_status) {
                            await handleMarkAsRead(message.id);
                          }
                          setSelectedMessage(message);
                          setIsViewDialogOpen(true);
                        }}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => handleContactResponse(message, 'email')}
                      >
                        <Mail className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleContactResponse(message, 'phone')}
                      >
                        <Phone className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredMessages.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              {searchTerm ? 'No messages found matching your search' : 'No messages found'}
            </div>
          )}
        </CardContent>
      </Card>

      {/* View Message Details Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Message Details</DialogTitle>
          </DialogHeader>
          {selectedMessage && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <strong>Name:</strong>
                  <p>{selectedMessage.name}</p>
                </div>
                <div>
                  <strong>Date:</strong>
                  <p>{new Date(selectedMessage.created_at).toLocaleString()}</p>
                </div>
                <div>
                  <strong>Email:</strong>
                  <p>{selectedMessage.email}</p>
                </div>
                <div>
                  <strong>Phone:</strong>
                  <p>{selectedMessage.phone}</p>
                </div>
              </div>
              <div>
                <strong>Message:</strong>
                <div className="mt-2 p-3 bg-muted rounded-md">
                  <p className="text-sm whitespace-pre-wrap">{selectedMessage.message}</p>
                </div>
              </div>
              <div className="flex space-x-2 pt-4">
                <Button
                  className="flex-1"
                  onClick={() => {
                    handleContactResponse(selectedMessage, 'email');
                    setIsViewDialogOpen(false);
                  }}
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Reply via Email
                </Button>
                <Button
                  variant="secondary"
                  className="flex-1"
                  onClick={() => {
                    handleContactResponse(selectedMessage, 'phone');
                    setIsViewDialogOpen(false);
                  }}
                >
                  <Phone className="w-4 h-4 mr-2" />
                  Call
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}