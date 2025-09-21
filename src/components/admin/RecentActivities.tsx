import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

interface Activity {
  id: string;
  type: 'adoption' | 'donation' | 'volunteer' | 'contact' | 'animal';
  title: string;
  time: string;
  details?: string;
}

export default function RecentActivities() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRecentActivities();
  }, []);

  const loadRecentActivities = async () => {
    try {
      const [
        adoptionsResult,
        donationsResult,
        volunteersResult,
        contactsResult,
        animalsResult
      ] = await Promise.all([
        supabase.from('adoptions').select('id, full_name, submitted_at').order('submitted_at', { ascending: false }).limit(3),
        supabase.from('donations').select('id, name, amount, created_at').order('created_at', { ascending: false }).limit(3),
        supabase.from('volunteers').select('id, name, created_at').order('created_at', { ascending: false }).limit(3),
        supabase.from('contacts').select('id, name, created_at').order('created_at', { ascending: false }).limit(3),
        supabase.from('rescued_animals').select('id, name, created_at').order('created_at', { ascending: false }).limit(3)
      ]);

      const activities: Activity[] = [];

      // Add adoption activities
      if (adoptionsResult.data) {
        adoptionsResult.data.forEach(adoption => {
          activities.push({
            id: `adoption-${adoption.id}`,
            type: 'adoption',
            title: 'New adoption request',
            time: new Date(adoption.submitted_at).toISOString(),
            details: `from ${adoption.full_name}`
          });
        });
      }

      // Add donation activities
      if (donationsResult.data) {
        donationsResult.data.forEach(donation => {
          activities.push({
            id: `donation-${donation.id}`,
            type: 'donation',
            title: 'Donation received',
            time: donation.created_at,
            details: `₹${Number(donation.amount).toLocaleString()} from ${donation.name}`
          });
        });
      }

      // Add volunteer activities
      if (volunteersResult.data) {
        volunteersResult.data.forEach(volunteer => {
          activities.push({
            id: `volunteer-${volunteer.id}`,
            type: 'volunteer',
            title: 'New volunteer application',
            time: volunteer.created_at,
            details: `from ${volunteer.name}`
          });
        });
      }

      // Add contact activities
      if (contactsResult.data) {
        contactsResult.data.forEach(contact => {
          activities.push({
            id: `contact-${contact.id}`,
            type: 'contact',
            title: 'New contact message',
            time: contact.created_at,
            details: `from ${contact.name}`
          });
        });
      }

      // Add animal activities
      if (animalsResult.data) {
        animalsResult.data.forEach(animal => {
          activities.push({
            id: `animal-${animal.id}`,
            type: 'animal',
            title: 'New animal added',
            time: animal.created_at,
            details: animal.name
          });
        });
      }

      // Sort by time and take the most recent 6
      activities.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
      setActivities(activities.slice(0, 6));

    } catch (error) {
      console.error('Error loading recent activities:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'adoption': return 'bg-green-500';
      case 'donation': return 'bg-blue-500';
      case 'volunteer': return 'bg-orange-500';
      case 'contact': return 'bg-purple-500';
      case 'animal': return 'bg-pink-500';
      default: return 'bg-gray-500';
    }
  };

  const getTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Activities</CardTitle>
          <CardDescription>Latest updates from your shelter</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">Loading activities...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activities</CardTitle>
        <CardDescription>Latest updates from your shelter</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.length > 0 ? (
            activities.map((activity) => (
              <div key={activity.id} className="flex items-center space-x-4">
                <div className={`w-2 h-2 rounded-full ${getActivityColor(activity.type)}`}></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{activity.title}</p>
                  {activity.details && (
                    <p className="text-xs text-muted-foreground">{activity.details}</p>
                  )}
                  <p className="text-xs text-muted-foreground">{getTimeAgo(activity.time)}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-4 text-muted-foreground">
              No recent activities
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}