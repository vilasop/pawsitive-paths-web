-- Drop existing adoptions table and recreate with correct schema
DROP TABLE IF EXISTS public.adoptions;

-- Create adoptions table with correct schema
CREATE TABLE public.adoptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  contact_number text NOT NULL,
  aadhar varchar(12) NOT NULL,
  email text NOT NULL,
  has_pet boolean,
  reason text,
  pet_id uuid REFERENCES public.rescued_animals(id),
  submitted_at timestamp with time zone DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.adoptions ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow insert for all users" 
ON public.adoptions
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Allow select for all users"
ON public.adoptions 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage adoptions"
ON public.adoptions
FOR ALL
USING (public.is_admin(auth.uid()));