-- Create adopt_animals table for animals listed for adoption
CREATE TABLE IF NOT EXISTS public.adopt_animals (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  species text NOT NULL,
  breed text,
  age integer,
  gender text,
  health_status text,
  description text,
  image_url text,
  rescue_date date NOT NULL DEFAULT CURRENT_DATE,
  current_status text DEFAULT 'Available',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.adopt_animals ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for adopt_animals
CREATE POLICY "Anyone can view adopt animals" 
ON public.adopt_animals 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage adopt animals" 
ON public.adopt_animals 
FOR ALL 
USING (is_admin(auth.uid()));

-- Create lost_found_submissions table for user submissions
CREATE TABLE IF NOT EXISTS public.lost_found_submissions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  pet_name text NOT NULL,
  species text NOT NULL,
  description text NOT NULL,
  last_seen_location text NOT NULL,
  date_lost date NOT NULL,
  contact_number text NOT NULL,
  photo_url text,
  status text NOT NULL DEFAULT 'Pending',
  submitted_at timestamp with time zone NOT NULL DEFAULT now(),
  reviewed_at timestamp with time zone,
  reviewed_by uuid REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.lost_found_submissions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for lost_found_submissions
CREATE POLICY "Anyone can submit lost/found reports" 
ON public.lost_found_submissions 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can view submissions" 
ON public.lost_found_submissions 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage submissions" 
ON public.lost_found_submissions 
FOR ALL 
USING (is_admin(auth.uid()));

-- Create found_animals table for approved submissions
CREATE TABLE IF NOT EXISTS public.found_animals (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  pet_name text NOT NULL,
  species text NOT NULL,
  description text NOT NULL,
  last_seen_location text NOT NULL,
  date_found date NOT NULL,
  contact_number text NOT NULL,
  photo_url text,
  finder_name text,
  status text NOT NULL DEFAULT 'Found',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  original_submission_id uuid REFERENCES public.lost_found_submissions(id)
);

-- Enable RLS
ALTER TABLE public.found_animals ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for found_animals
CREATE POLICY "Anyone can view found animals" 
ON public.found_animals 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage found animals" 
ON public.found_animals 
FOR ALL 
USING (is_admin(auth.uid()));

-- Add triggers for updated_at
CREATE TRIGGER update_adopt_animals_updated_at
BEFORE UPDATE ON public.adopt_animals
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for new tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.adopt_animals;
ALTER PUBLICATION supabase_realtime ADD TABLE public.lost_found_submissions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.found_animals;