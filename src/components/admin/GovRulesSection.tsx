import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAdmin } from '@/hooks/useAdmin';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Plus, Edit, Trash2, Eye, Upload, CheckCircle, XCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface GovRule {
  id: string;
  title: string;
  summary: string | null;
  content: string | null;
  pdf_url: string | null;
  effective_date: string | null;
  jurisdiction: string | null;
  tags: string[] | null;
  published: boolean;
  published_at: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  source_url: string | null;
}

export default function GovRulesSection() {
  const { user } = useAdmin();
  const [rules, setRules] = useState<GovRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [deleteRuleId, setDeleteRuleId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    summary: '',
    content: '',
    effective_date: '',
    jurisdiction: '',
    tags: '',
    published: false,
    source_url: '',
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [currentRule, setCurrentRule] = useState<GovRule | null>(null);

  useEffect(() => {
    loadRules();

    const channel = supabase
      .channel('gov-rules-admin-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'gov_rules' }, () => {
        loadRules();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadRules = async () => {
    try {
      const { data, error } = await supabase
        .from('gov_rules')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRules(data || []);
    } catch (error: any) {
      console.error('Error loading rules:', error);
      toast({
        title: 'Error',
        description: `Failed to load rules: ${error.message}`,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (rule?: GovRule) => {
    if (rule) {
      setIsEditMode(true);
      setCurrentRule(rule);
      setFormData({
        title: rule.title,
        summary: rule.summary || '',
        content: rule.content || '',
        effective_date: rule.effective_date || '',
        jurisdiction: rule.jurisdiction || '',
        tags: rule.tags?.join(', ') || '',
        published: rule.published,
        source_url: rule.source_url || '',
      });
    } else {
      setIsEditMode(false);
      setCurrentRule(null);
      setFormData({
        title: '',
        summary: '',
        content: '',
        effective_date: '',
        jurisdiction: '',
        tags: '',
        published: false,
        source_url: '',
      });
      setSelectedFile(null);
    }
    setIsDialogOpen(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        toast({
          title: 'Invalid File Type',
          description: 'Please upload a PDF file',
          variant: 'destructive',
        });
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: 'File Too Large',
          description: 'PDF must be less than 10MB',
          variant: 'destructive',
        });
        return;
      }
      setSelectedFile(file);
    }
  };

  const uploadPDF = async (): Promise<string | null> => {
    if (!selectedFile) return null;

    try {
      setUploading(true);
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('gov_rules_docs')
        .upload(filePath, selectedFile);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('gov_rules_docs').getPublicUrl(filePath);

      return data.publicUrl;
    } catch (error: any) {
      console.error('Error uploading PDF:', error);
      toast({
        title: 'Upload Failed',
        description: error.message,
        variant: 'destructive',
      });
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Title is required',
        variant: 'destructive',
      });
      return;
    }

    try {
      let pdfUrl = currentRule?.pdf_url || null;

      if (selectedFile) {
        pdfUrl = await uploadPDF();
        if (!pdfUrl) return;
      }

      const tagsArray = formData.tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

      const ruleData = {
        title: formData.title,
        summary: formData.summary || null,
        content: formData.content || null,
        pdf_url: pdfUrl,
        effective_date: formData.effective_date || null,
        jurisdiction: formData.jurisdiction || null,
        tags: tagsArray.length > 0 ? tagsArray : null,
        published: formData.published,
        published_at: formData.published && !currentRule?.published ? new Date().toISOString() : currentRule?.published_at,
        source_url: formData.source_url || null,
        created_by: user?.id || null,
      };

      let error;

      if (isEditMode && currentRule) {
        const { error: updateError } = await supabase
          .from('gov_rules')
          .update(ruleData)
          .eq('id', currentRule.id);
        error = updateError;
      } else {
        const { error: insertError } = await supabase.from('gov_rules').insert([ruleData]);
        error = insertError;
      }

      if (error) throw error;

      toast({
        title: 'Success',
        description: `Rule ${isEditMode ? 'updated' : 'created'} successfully`,
      });

      setIsDialogOpen(false);
      loadRules();
    } catch (error: any) {
      console.error('Error saving rule:', error);
      toast({
        title: 'Error',
        description: `Failed to save rule: ${error.message}`,
        variant: 'destructive',
      });
    }
  };

  const handleTogglePublish = async (rule: GovRule) => {
    try {
      const { error } = await supabase
        .from('gov_rules')
        .update({
          published: !rule.published,
          published_at: !rule.published ? new Date().toISOString() : rule.published_at,
        })
        .eq('id', rule.id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: `Rule ${!rule.published ? 'published' : 'unpublished'} successfully`,
      });
    } catch (error: any) {
      console.error('Error toggling publish:', error);
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async () => {
    if (!deleteRuleId) return;

    try {
      const { error } = await supabase.from('gov_rules').delete().eq('id', deleteRuleId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Rule deleted successfully',
      });

      setDeleteRuleId(null);
    } catch (error: any) {
      console.error('Error deleting rule:', error);
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Government Rules Management</CardTitle>
              <CardDescription>Manage government rules and guidelines</CardDescription>
            </div>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="w-4 h-4 mr-2" />
              Add Rule
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Jurisdiction</TableHead>
                <TableHead>Effective Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rules.map((rule) => (
                <TableRow key={rule.id}>
                  <TableCell className="font-medium">{rule.title}</TableCell>
                  <TableCell>{rule.jurisdiction || 'N/A'}</TableCell>
                  <TableCell>
                    {rule.effective_date
                      ? new Date(rule.effective_date).toLocaleDateString()
                      : 'N/A'}
                  </TableCell>
                  <TableCell>
                    <Badge variant={rule.published ? 'default' : 'secondary'}>
                      {rule.published ? 'Published' : 'Draft'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleTogglePublish(rule)}
                        title={rule.published ? 'Unpublish' : 'Publish'}
                      >
                        {rule.published ? (
                          <XCircle className="h-4 w-4" />
                        ) : (
                          <CheckCircle className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleOpenDialog(rule)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteRuleId(rule.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isEditMode ? 'Edit' : 'Add'} Government Rule</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="summary">Summary (max 200 chars)</Label>
              <Textarea
                id="summary"
                value={formData.summary}
                onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                maxLength={200}
                rows={2}
              />
            </div>
            <div>
              <Label htmlFor="content">Full Content (HTML)</Label>
              <Textarea
                id="content"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                rows={6}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="effective_date">Effective Date</Label>
                <Input
                  id="effective_date"
                  type="date"
                  value={formData.effective_date}
                  onChange={(e) =>
                    setFormData({ ...formData, effective_date: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="jurisdiction">Jurisdiction</Label>
                <Select
                  value={formData.jurisdiction}
                  onValueChange={(value) =>
                    setFormData({ ...formData, jurisdiction: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="National">National</SelectItem>
                    <SelectItem value="State">State</SelectItem>
                    <SelectItem value="Municipal">Municipal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="tags">Tags (comma-separated)</Label>
              <Input
                id="tags"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                placeholder="welfare, hygiene, licensing"
              />
            </div>
            <div>
              <Label htmlFor="source_url">Official Source URL</Label>
              <Input
                id="source_url"
                type="url"
                value={formData.source_url}
                onChange={(e) => setFormData({ ...formData, source_url: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="pdf">Upload PDF (max 10MB)</Label>
              <Input
                id="pdf"
                type="file"
                accept="application/pdf"
                onChange={handleFileChange}
              />
              {currentRule?.pdf_url && !selectedFile && (
                <p className="text-sm text-muted-foreground mt-1">
                  Current file: <a href={currentRule.pdf_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">View PDF</a>
                </p>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="published"
                checked={formData.published}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, published: checked })
                }
              />
              <Label htmlFor="published">Publish immediately</Label>
            </div>
            <div className="flex justify-end gap-4">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={uploading}>
                {uploading ? 'Uploading...' : isEditMode ? 'Update' : 'Create'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteRuleId} onOpenChange={() => setDeleteRuleId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Rule</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this rule? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
