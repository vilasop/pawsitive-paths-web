import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdmin } from '@/hooks/useAdmin';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  PawPrint, 
  Heart, 
  DollarSign, 
  Users, 
  Mail, 
  LogOut,
  Settings,
  Plus,
  FileText
} from 'lucide-react';

interface DashboardStats {
  totalAnimals: number;
  availableAnimals: number;
  adoptedAnimals: number;
  totalDonations: number;
  totalVolunteers: number;
  pendingMessages: number;
  pendingAdoptions: number;
}

export default function AdminDashboard() {
  const { admin, isAdmin, loading, signOut } = useAdmin();
  const [stats, setStats] = useState<DashboardStats>({
    totalAnimals: 0,
    availableAnimals: 0,
    adoptedAnimals: 0,
    totalDonations: 0,
    totalVolunteers: 0,
    pendingMessages: 0,
    pendingAdoptions: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !isAdmin) {
      navigate('/admin/login');
    }
  }, [isAdmin, loading, navigate]);

  useEffect(() => {
    if (isAdmin) {
      loadDashboardStats();
    }
  }, [isAdmin]);

  const loadDashboardStats = async () => {
    try {
      const [
        animalsResult,
        donationsResult,
        volunteersResult,
        contactsResult,
        adoptionsResult
      ] = await Promise.all([
        supabase.from('rescued_animals').select('current_status'),
        supabase.from('donations').select('amount'),
        supabase.from('volunteers').select('id'),
        supabase.from('contacts').select('id'),
        supabase.from('adoptions').select('id')
      ]);

      const animals = animalsResult.data || [];
      const donations = donationsResult.data || [];
      
      setStats({
        totalAnimals: animals.length,
        availableAnimals: animals.filter(a => a.current_status === 'Available').length,
        adoptedAnimals: animals.filter(a => a.current_status === 'Adopted').length,
        totalDonations: donations.reduce((sum, d) => sum + Number(d.amount), 0),
        totalVolunteers: volunteersResult.data?.length || 0,
        pendingMessages: contactsResult.data?.length || 0,
        pendingAdoptions: adoptionsResult.data?.length || 0,
      });
    } catch (error) {
      console.error('Error loading dashboard stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/admin/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (loading || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
            <p className="text-muted-foreground">Welcome back, {admin?.name}</p>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="sm">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
            <Button variant="outline" size="sm" onClick={handleSignOut}>
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Available Animals</CardTitle>
              <PawPrint className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.availableAnimals}</div>
              <p className="text-xs text-muted-foreground">
                {stats.totalAnimals} total animals
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Adopted Animals</CardTitle>
              <Heart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.adoptedAnimals}</div>
              <p className="text-xs text-muted-foreground">
                Successfully adopted
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Donations</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{stats.totalDonations.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                Collected so far
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Volunteers</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalVolunteers}</div>
              <p className="text-xs text-muted-foreground">
                Registered volunteers
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="animals">Animals</TabsTrigger>
            <TabsTrigger value="adoptions">Adoptions</TabsTrigger>
            <TabsTrigger value="donations">Donations</TabsTrigger>
            <TabsTrigger value="volunteers">Volunteers</TabsTrigger>
            <TabsTrigger value="messages">Messages</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activities</CardTitle>
                  <CardDescription>Latest updates from your shelter</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-4">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">New adoption request</p>
                        <p className="text-xs text-muted-foreground">2 hours ago</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Donation received</p>
                        <p className="text-xs text-muted-foreground">5 hours ago</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">New volunteer application</p>
                        <p className="text-xs text-muted-foreground">1 day ago</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>Common administrative tasks</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4">
                  <Button className="h-20 flex flex-col items-center justify-center">
                    <Plus className="w-6 h-6 mb-2" />
                    Add Animal
                  </Button>
                  <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
                    <Mail className="w-6 h-6 mb-2" />
                    View Messages
                  </Button>
                  <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
                    <FileText className="w-6 h-6 mb-2" />
                    Generate Report
                  </Button>
                  <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
                    <Settings className="w-6 h-6 mb-2" />
                    Settings
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="animals">
            <Card>
              <CardHeader>
                <CardTitle>Manage Animals</CardTitle>
                <CardDescription>Add, edit, and manage rescued animals</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Animal management interface coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="adoptions">
            <Card>
              <CardHeader>
                <CardTitle>Adoption Requests</CardTitle>
                <CardDescription>Review and manage adoption applications</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Adoption management interface coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="donations">
            <Card>
              <CardHeader>
                <CardTitle>Donation Management</CardTitle>
                <CardDescription>Track and manage donations</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Donation management interface coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="volunteers">
            <Card>
              <CardHeader>
                <CardTitle>Volunteer Applications</CardTitle>
                <CardDescription>Review and approve volunteer applications</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Volunteer management interface coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="messages">
            <Card>
              <CardHeader>
                <CardTitle>Contact Messages</CardTitle>
                <CardDescription>View and respond to contact inquiries</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Message management interface coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}