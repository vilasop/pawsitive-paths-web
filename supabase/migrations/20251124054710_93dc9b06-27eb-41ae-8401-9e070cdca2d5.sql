-- Create animal_health_checks table
CREATE TABLE IF NOT EXISTS public.animal_health_checks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  animal_id UUID NOT NULL REFERENCES public.adopt_animals(id) ON DELETE CASCADE,
  adopter_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  check_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  check_type TEXT NOT NULL CHECK (check_type IN ('Home Visit','Clinic Visit','Self Report','Remote Followup','Other')),
  animal_type TEXT,
  animal_age INTEGER,
  weight_kg NUMERIC(6,2),
  health_status TEXT NOT NULL CHECK (health_status IN ('Excellent','Good','Fair','Poor','Critical')),
  vaccinations_up_to_date BOOLEAN DEFAULT false,
  vaccinations_notes TEXT,
  next_appointment TIMESTAMPTZ,
  veterinarian TEXT,
  notes TEXT,
  photos TEXT[],
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  visibility TEXT DEFAULT 'public' CHECK (visibility IN ('public','adopter-only','private'))
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_health_checks_animal_id ON public.animal_health_checks(animal_id);
CREATE INDEX IF NOT EXISTS idx_health_checks_check_date ON public.animal_health_checks(check_date DESC);
CREATE INDEX IF NOT EXISTS idx_health_checks_created_at ON public.animal_health_checks(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_health_checks_visibility ON public.animal_health_checks(visibility);

-- Create health_appointments table for appointment workflow
CREATE TABLE IF NOT EXISTS public.health_appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  health_check_id UUID REFERENCES public.animal_health_checks(id) ON DELETE CASCADE,
  animal_id UUID NOT NULL REFERENCES public.adopt_animals(id) ON DELETE CASCADE,
  adopter_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  proposed_time TIMESTAMPTZ NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','confirmed','declined','rescheduled','completed','cancelled')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_appointments_animal_id ON public.health_appointments(animal_id);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON public.health_appointments(status);

-- Create storage bucket for health check photos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'animal_health_photos',
  'animal_health_photos',
  false,
  5242880,
  ARRAY['image/jpeg','image/jpg','image/png','image/webp','image/heic']
)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS
ALTER TABLE public.animal_health_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.health_appointments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for animal_health_checks
-- Public can view only public visibility checks
CREATE POLICY "healthchecks_public_select"
ON public.animal_health_checks
FOR SELECT
TO public
USING (visibility = 'public');

-- Authenticated adopters can view their own checks or public ones
CREATE POLICY "healthchecks_adopter_select"
ON public.animal_health_checks
FOR SELECT
TO authenticated
USING (
  visibility = 'public' 
  OR (visibility = 'adopter-only' AND adopter_id = auth.uid())
  OR is_admin(auth.uid())
);

-- Admins have full access
CREATE POLICY "healthchecks_admin_all"
ON public.animal_health_checks
FOR ALL
TO authenticated
USING (is_admin(auth.uid()))
WITH CHECK (is_admin(auth.uid()));

-- Allow authenticated users to insert (staff/admin or self-report)
CREATE POLICY "healthchecks_insert"
ON public.animal_health_checks
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Storage policies for animal_health_photos
CREATE POLICY "health_photos_admin_insert"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'animal_health_photos'
  AND is_admin(auth.uid())
);

CREATE POLICY "health_photos_admin_update"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'animal_health_photos'
  AND is_admin(auth.uid())
);

CREATE POLICY "health_photos_admin_delete"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'animal_health_photos'
  AND is_admin(auth.uid())
);

CREATE POLICY "health_photos_public_select"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'animal_health_photos');

-- RLS for health_appointments
CREATE POLICY "appointments_admin_all"
ON public.health_appointments
FOR ALL
TO authenticated
USING (is_admin(auth.uid()))
WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "appointments_adopter_select"
ON public.health_appointments
FOR SELECT
TO authenticated
USING (adopter_id = auth.uid() OR is_admin(auth.uid()));

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_health_check_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER health_checks_updated_at
BEFORE UPDATE ON public.animal_health_checks
FOR EACH ROW
EXECUTE FUNCTION public.update_health_check_updated_at();

CREATE TRIGGER appointments_updated_at
BEFORE UPDATE ON public.health_appointments
FOR EACH ROW
EXECUTE FUNCTION public.update_health_check_updated_at();