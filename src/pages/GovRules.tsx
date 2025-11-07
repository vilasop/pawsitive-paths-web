import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Download, FileText, Calendar, MapPin } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface GovRule {
  id: string;
  title: string;
  summary: string | null;
  effective_date: string | null;
  jurisdiction: string | null;
  tags: string[] | null;
  pdf_url: string | null;
  updated_at: string;
}

export default function GovRules() {
  const [rules, setRules] = useState<GovRule[]>([]);
  const [filteredRules, setFilteredRules] = useState<GovRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [jurisdictionFilter, setJurisdictionFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('date-desc');

  useEffect(() => {
    fetchRules();

    const channel = supabase
      .channel('gov-rules-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'gov_rules' }, () => {
        fetchRules();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    filterAndSortRules();
  }, [rules, searchQuery, jurisdictionFilter, sortBy]);

  const fetchRules = async () => {
    try {
      const { data, error } = await supabase
        .from('gov_rules')
        .select('*')
        .eq('published', true)
        .order('effective_date', { ascending: false });

      if (error) throw error;
      setRules(data || []);
    } catch (error: any) {
      console.error('Error fetching rules:', error);
      toast({
        title: 'Error',
        description: 'Failed to load government rules',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortRules = () => {
    let filtered = [...rules];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (rule) =>
          rule.title.toLowerCase().includes(query) ||
          rule.summary?.toLowerCase().includes(query) ||
          rule.tags?.some((tag) => tag.toLowerCase().includes(query)) ||
          rule.jurisdiction?.toLowerCase().includes(query)
      );
    }

    if (jurisdictionFilter !== 'all') {
      filtered = filtered.filter((rule) => rule.jurisdiction === jurisdictionFilter);
    }

    filtered.sort((a, b) => {
      if (sortBy === 'date-desc') {
        return new Date(b.effective_date || 0).getTime() - new Date(a.effective_date || 0).getTime();
      } else if (sortBy === 'date-asc') {
        return new Date(a.effective_date || 0).getTime() - new Date(b.effective_date || 0).getTime();
      } else if (sortBy === 'title-asc') {
        return a.title.localeCompare(b.title);
      } else {
        return b.title.localeCompare(a.title);
      }
    });

    setFilteredRules(filtered);
  };

  const jurisdictions = Array.from(new Set(rules.map((r) => r.jurisdiction).filter(Boolean)));

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading rules...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">Government Rules & Guidelines</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Official regulations and guidelines for animal shelters, welfare, and care
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>

        <div className="mb-8 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search rules by title, tags, or jurisdiction..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={jurisdictionFilter} onValueChange={setJurisdictionFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Jurisdiction" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Jurisdictions</SelectItem>
                {jurisdictions.map((j) => (
                  <SelectItem key={j} value={j || 'none'}>
                    {j}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date-desc">Newest First</SelectItem>
                <SelectItem value="date-asc">Oldest First</SelectItem>
                <SelectItem value="title-asc">Title A-Z</SelectItem>
                <SelectItem value="title-desc">Title Z-A</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {filteredRules.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No rules found matching your criteria</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRules.map((rule) => (
              <Card key={rule.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="line-clamp-2">{rule.title}</CardTitle>
                  {rule.summary && (
                    <CardDescription className="line-clamp-3">{rule.summary}</CardDescription>
                  )}
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {rule.tags?.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    {rule.effective_date && (
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>Effective: {new Date(rule.effective_date).toLocaleDateString()}</span>
                      </div>
                    )}
                    {rule.jurisdiction && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        <span>{rule.jurisdiction}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Link to={`/rules/${rule.id}`} className="flex-1">
                      <Button variant="default" className="w-full">
                        Read More
                      </Button>
                    </Link>
                    {rule.pdf_url && (
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => window.open(rule.pdf_url!, '_blank')}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
