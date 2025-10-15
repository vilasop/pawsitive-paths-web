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
import AnimalsSection from '@/components/admin/AnimalsSection';
import AdoptionsSection from '@/components/admin/AdoptionsSection';
import DonationsSection from '@/components/admin/DonationsSection';
import VolunteersSection from '@/components/admin/VolunteersSection';
import MessagesSection from '@/components/admin/MessagesSection';
import RecentActivities from '@/components/admin/RecentActivities';
import SettingsDialog from '@/components/admin/SettingsDialog';
import LostFoundManagement from '@/components/admin/LostFoundManagement';

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
  const [activeTab, setActiveTab] = useState('overview');
  const [settingsOpen, setSettingsOpen] = useState(false);
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
        supabase.from('volunteers').select('id, status'),
        supabase.from('contacts').select('id, read_status'),
        supabase.from('adoptions').select('id, status')
      ]);

      const animals = animalsResult.data || [];
      const donations = donationsResult.data || [];
      const volunteers = volunteersResult.data || [];
      const contacts = contactsResult.data || [];
      const adoptions = adoptionsResult.data || [];
      
      setStats({
        totalAnimals: animals.length,
        availableAnimals: animals.filter(a => a.current_status === 'Available').length,
        adoptedAnimals: animals.filter(a => a.current_status === 'Adopted').length,
        totalDonations: donations.reduce((sum, d) => sum + Number(d.amount), 0),
        totalVolunteers: volunteers.filter(v => v.status === 'approved').length,
        pendingMessages: contacts.filter(c => !c.read_status).length,
        pendingAdoptions: adoptions.filter(a => a.status === 'pending').length,
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

  const handleQuickAction = (action: string, tabValue?: string) => {
    switch (action) {
      case 'add-animal':
        setActiveTab('animals');
        setTimeout(() => {
          const tabsElement = document.querySelector('[data-tabs-root]');
          if (tabsElement) {
            tabsElement.scrollIntoView({ behavior: 'smooth' });
          }
        }, 100);
        break;
      case 'view-messages':
        setActiveTab('messages');
        setTimeout(() => {
          const tabsElement = document.querySelector('[data-tabs-root]');
          if (tabsElement) {
            tabsElement.scrollIntoView({ behavior: 'smooth' });
          }
        }, 100);
        break;
      case 'generate-report':
        generateReport();
        break;
      case 'settings':
        setSettingsOpen(true);
        break;
    }
  };

  const generateReport = () => {
    const reportData = {
      totalAnimals: stats.totalAnimals,
      availableAnimals: stats.availableAnimals,
      adoptedAnimals: stats.adoptedAnimals,
      totalDonations: stats.totalDonations,
      totalVolunteers: stats.totalVolunteers,
      pendingAdoptions: stats.pendingAdoptions,
      pendingMessages: stats.pendingMessages,
      generatedAt: new Date().toISOString()
    };

    const csvContent = `Animal Shelter Report
Generated: ${new Date().toLocaleString()}

Statistics:
Total Animals,${stats.totalAnimals}
Available Animals,${stats.availableAnimals}
Adopted Animals,${stats.adoptedAnimals}
Total Donations,₹${stats.totalDonations.toLocaleString()}
Total Volunteers,${stats.totalVolunteers}
Pending Adoptions,${stats.pendingAdoptions}
Pending Messages,${stats.pendingMessages}
`;

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `animal-shelter-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
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
            <Button variant="outline" size="sm" onClick={() => setSettingsOpen(true)}>
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
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6" data-tabs-root>
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="animals">Animals</TabsTrigger>
            <TabsTrigger value="adoptions">Adoptions</TabsTrigger>
            <TabsTrigger value="lostfound">Lost & Found</TabsTrigger>
            <TabsTrigger value="donations">Donations</TabsTrigger>
            <TabsTrigger value="volunteers">Volunteers</TabsTrigger>
            <TabsTrigger value="messages">Messages</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <RecentActivities />

              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>Common administrative tasks</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4">
                  <Button 
                    className="h-20 flex flex-col items-center justify-center"
                    onClick={() => handleQuickAction('add-animal', 'animals')}
                  >
                    <Plus className="w-6 h-6 mb-2" />
                    Add Animal
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-20 flex flex-col items-center justify-center"
                    onClick={() => handleQuickAction('view-messages', 'messages')}
                  >
                    <Mail className="w-6 h-6 mb-2" />
                    View Messages
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-20 flex flex-col items-center justify-center"
                    onClick={() => handleQuickAction('generate-report')}
                  >
                    <FileText className="w-6 h-6 mb-2" />
                    Generate Report
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-20 flex flex-col items-center justify-center"
                    onClick={() => handleQuickAction('settings')}
                  >
                    <Settings className="w-6 h-6 mb-2" />
                    Settings
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="animals">
            <AnimalsSection />
          </TabsContent>

          <TabsContent value="adoptions">
            <AdoptionsSection />
          </TabsContent>

          <TabsContent value="lostfound">
            <LostFoundManagement />
          </TabsContent>

          <TabsContent value="donations">
            <DonationsSection />
          </TabsContent>

          <TabsContent value="volunteers">
            <VolunteersSection />
          </TabsContent>

          <TabsContent value="messages">
            <MessagesSection />
          </TabsContent>
        </Tabs>
      </div>

      {/* Settings Dialog */}
      {admin && (
        <SettingsDialog
          open={settingsOpen}
          onOpenChange={setSettingsOpen}
          adminName={admin.name}
          adminEmail={admin.email}
          adminId={admin.id}
        />
      )}
    </div>
  );
}