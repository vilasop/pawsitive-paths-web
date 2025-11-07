import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Download, Printer, Calendar, MapPin, ExternalLink, User } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import DOMPurify from 'dompurify';

interface GovRule {
  id: string;
  title: string;
  summary: string | null;
  content: string | null;
  pdf_url: string | null;
  effective_date: string | null;
  jurisdiction: string | null;
  tags: string[] | null;
  published_at: string | null;
  source_url: string | null;
  created_at: string;
  updated_at: string;
}

export default function GovRuleDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [rule, setRule] = useState<GovRule | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchRule();
    }
  }, [id]);

  const fetchRule = async () => {
    try {
      const { data, error } = await supabase
        .from('gov_rules')
        .select('*')
        .eq('id', id)
        .eq('published', true)
        .single();

      if (error) throw error;
      setRule(data);
    } catch (error: any) {
      console.error('Error fetching rule:', error);
      toast({
        title: 'Error',
        description: 'Failed to load rule details',
        variant: 'destructive',
      });
      navigate('/rules');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading rule...</p>
        </div>
      </div>
    );
  }

  if (!rule) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="text-center py-12">
            <p className="text-muted-foreground">Rule not found</p>
            <Link to="/rules">
              <Button className="mt-4">Back to Rules</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6 print:hidden">
          <Link to="/rules">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Rules
            </Button>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-wrap gap-2 mb-4">
              {rule.tags?.map((tag) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
            <CardTitle className="text-3xl mb-4">{rule.title}</CardTitle>
            {rule.summary && (
              <p className="text-muted-foreground text-lg">{rule.summary}</p>
            )}
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              {rule.effective_date && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Effective Date:</span>
                  <span className="font-medium">
                    {new Date(rule.effective_date).toLocaleDateString()}
                  </span>
                </div>
              )}
              {rule.jurisdiction && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Jurisdiction:</span>
                  <span className="font-medium">{rule.jurisdiction}</span>
                </div>
              )}
              {rule.published_at && (
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Published:</span>
                  <span className="font-medium">
                    {new Date(rule.published_at).toLocaleDateString()}
                  </span>
                </div>
              )}
              {rule.source_url && (
                <div className="flex items-center gap-2">
                  <ExternalLink className="h-4 w-4 text-muted-foreground" />
                  <a
                    href={rule.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline font-medium"
                  >
                    Official Source
                  </a>
                </div>
              )}
            </div>

            <Separator />

            {rule.content && (
              <div
                className="prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(rule.content) }}
              />
            )}

            {rule.pdf_url && (
              <>
                <Separator />
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Attached Document</h3>
                  <div className="aspect-[8.5/11] border rounded-lg overflow-hidden bg-muted">
                    <iframe
                      src={rule.pdf_url}
                      className="w-full h-full"
                      title="Government Rule Document"
                    />
                  </div>
                </div>
              </>
            )}

            <Separator />

            <div className="flex flex-wrap gap-4 print:hidden">
              {rule.pdf_url && (
                <Button onClick={() => window.open(rule.pdf_url!, '_blank')}>
                  <Download className="mr-2 h-4 w-4" />
                  Download PDF
                </Button>
              )}
              <Button variant="outline" onClick={handlePrint}>
                <Printer className="mr-2 h-4 w-4" />
                Print
              </Button>
            </div>

            <div className="text-xs text-muted-foreground">
              Last updated: {new Date(rule.updated_at).toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
