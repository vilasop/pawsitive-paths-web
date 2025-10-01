-- Add status columns for adoptions, volunteers, and read_status for contacts

-- Add status to adoptions table
ALTER TABLE public.adoptions 
ADD COLUMN IF NOT EXISTS status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected'));

-- Add status to volunteers table
ALTER TABLE public.volunteers 
ADD COLUMN IF NOT EXISTS status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected'));

-- Add read_status to contacts table
ALTER TABLE public.contacts 
ADD COLUMN IF NOT EXISTS read_status boolean DEFAULT false;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_adoptions_status ON public.adoptions(status);
CREATE INDEX IF NOT EXISTS idx_volunteers_status ON public.volunteers(status);
CREATE INDEX IF NOT EXISTS idx_contacts_read_status ON public.contacts(read_status);