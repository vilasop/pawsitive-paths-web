-- Create adoptions table for storing adoption applications
CREATE TABLE public.adoptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  pet_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  contact_no TEXT NOT NULL CHECK (length(contact_no) = 10 AND contact_no ~ '^[0-9]+$'),
  aadhaar_no TEXT NOT NULL CHECK (length(aadhaar_no) = 12 AND aadhaar_no ~ '^[0-9]+$'),
  email TEXT NOT NULL CHECK (email ~ '^[A-Za-z0-9._%-]+@[A-Za-z0-9.-]+[.][A-Za-z]+$'),
  already_pet BOOLEAN NOT NULL,
  reason TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.adoptions ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anyone to insert adoption applications
CREATE POLICY "Anyone can submit adoption applications" 
ON public.adoptions 
FOR INSERT 
WITH CHECK (true);

-- Create policy to allow reading adoption applications (for admin purposes)
CREATE POLICY "Anyone can view adoption applications" 
ON public.adoptions 
FOR SELECT 
USING (true);