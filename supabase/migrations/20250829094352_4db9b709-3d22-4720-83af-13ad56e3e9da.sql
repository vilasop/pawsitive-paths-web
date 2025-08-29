-- Create admins table for admin authentication
CREATE TABLE public.admins (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'admin',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;

-- Create policies for admins table
CREATE POLICY "Admins can view their own record" 
ON public.admins 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can update their own record" 
ON public.admins 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin(user_uuid UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admins 
    WHERE user_id = user_uuid
  );
$$;

-- Update RLS policies to allow admin access to all tables
CREATE POLICY "Admins can manage rescued animals" 
ON public.rescued_animals 
FOR ALL 
USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can manage adoptions" 
ON public.adoptions 
FOR ALL 
USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can manage donations" 
ON public.donations 
FOR ALL 
USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can manage volunteers" 
ON public.volunteers 
FOR ALL 
USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can manage lost found" 
ON public.lost_found 
FOR ALL 
USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can manage contacts" 
ON public.contacts 
FOR ALL 
USING (public.is_admin(auth.uid()));

-- Function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates on admins
CREATE TRIGGER update_admins_updated_at
BEFORE UPDATE ON public.admins
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();