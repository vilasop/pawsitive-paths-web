-- Create donations table
CREATE TABLE public.donations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  payment_status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create volunteers table
CREATE TABLE public.volunteers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  age INTEGER NOT NULL,
  address TEXT NOT NULL,
  experience_with_animals BOOLEAN NOT NULL,
  why_volunteer TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create contacts table
CREATE TABLE public.contacts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create lost_found table
CREATE TABLE public.lost_found (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  pet_name TEXT NOT NULL,
  species TEXT NOT NULL,
  description TEXT NOT NULL,
  last_seen_location TEXT NOT NULL,
  date_lost DATE NOT NULL,
  finder_name TEXT NOT NULL,
  finder_contact TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'lost',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.volunteers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lost_found ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (like adoptions table)
CREATE POLICY "Anyone can submit donations" ON public.donations
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can view donations" ON public.donations
  FOR SELECT USING (true);

CREATE POLICY "Anyone can submit volunteer applications" ON public.volunteers
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can view volunteer applications" ON public.volunteers
  FOR SELECT USING (true);

CREATE POLICY "Anyone can submit contact messages" ON public.contacts
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can view contact messages" ON public.contacts
  FOR SELECT USING (true);

CREATE POLICY "Anyone can submit lost/found reports" ON public.lost_found
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can view lost/found reports" ON public.lost_found
  FOR SELECT USING (true);