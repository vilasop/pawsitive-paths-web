-- Create storage bucket for government rules PDFs
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'gov_rules_docs',
  'gov_rules_docs',
  true,
  10485760,
  ARRAY['application/pdf']
);

-- Create storage policies for gov_rules_docs bucket
CREATE POLICY "Public can view published rule documents"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'gov_rules_docs');

CREATE POLICY "Admins can upload rule documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'gov_rules_docs' AND
  is_admin(auth.uid())
);

CREATE POLICY "Admins can update rule documents"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'gov_rules_docs' AND
  is_admin(auth.uid())
);

CREATE POLICY "Admins can delete rule documents"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'gov_rules_docs' AND
  is_admin(auth.uid())
);

-- Create gov_rules table
CREATE TABLE public.gov_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  summary text,
  content text,
  pdf_url text,
  effective_date date,
  jurisdiction text,
  tags text[],
  published boolean DEFAULT false,
  published_at timestamp with time zone,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL,
  source_url text
);

-- Enable RLS on gov_rules
ALTER TABLE public.gov_rules ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Public can view published rules
CREATE POLICY "gov_rules_public_select"
ON public.gov_rules
FOR SELECT
TO public
USING (published = true);

-- RLS Policy: Admins can do everything
CREATE POLICY "gov_rules_admin_full"
ON public.gov_rules
FOR ALL
TO authenticated
USING (is_admin(auth.uid()))
WITH CHECK (is_admin(auth.uid()));

-- Create trigger to update updated_at
CREATE TRIGGER update_gov_rules_updated_at
BEFORE UPDATE ON public.gov_rules
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for gov_rules
ALTER TABLE public.gov_rules REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.gov_rules;