-- Create rescued_animals table
CREATE TABLE public.rescued_animals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  species TEXT NOT NULL,
  age INTEGER NOT NULL,
  breed TEXT NOT NULL,
  image_url TEXT NOT NULL,
  rescue_story TEXT NOT NULL,
  health_status TEXT NOT NULL,
  current_status TEXT NOT NULL DEFAULT 'Under Care',
  rescue_date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.rescued_animals ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view rescued animals" 
ON public.rescued_animals 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can insert rescued animals" 
ON public.rescued_animals 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can update rescued animals" 
ON public.rescued_animals 
FOR UPDATE 
USING (true);

-- Insert sample data
INSERT INTO public.rescued_animals (name, species, age, breed, image_url, rescue_story, health_status, current_status, rescue_date) VALUES
('Buddy', 'Dog', 3, 'Golden Retriever', 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=400', 'Buddy was found abandoned on the highway during a thunderstorm. He was malnourished and scared, but with love and care, he has transformed into a playful and loving companion ready for his forever home.', 'Excellent - Fully Vaccinated', 'Available', '2024-01-15'),
('Luna', 'Cat', 2, 'Persian', 'https://images.unsplash.com/photo-1574144611937-0df059b5ef3e?w=400', 'Luna was rescued from a hoarding situation where she lived with 30+ other cats. Despite her traumatic past, she has learned to trust humans again and loves gentle pets and quiet companionship.', 'Good - Minor Dental Work Completed', 'Available', '2024-02-03'),
('Max', 'Dog', 5, 'German Shepherd', 'https://images.unsplash.com/photo-1551717743-49959800b1f6?w=400', 'Max served as a police dog before retiring due to a leg injury. He''s incredibly well-trained, loyal, and looking for a quiet home where he can enjoy his golden years with a loving family.', 'Good - Arthritis Management', 'Adopted', '2023-11-20'),
('Whiskers', 'Cat', 1, 'Tabby', 'https://images.unsplash.com/photo-1596854407944-bf87f6fdd49e?w=400', 'Whiskers was found as a tiny kitten in a storm drain. She was bottle-fed by our volunteers and has grown into a playful, curious cat who loves climbing and exploring every corner of her environment.', 'Excellent - All Vaccines Current', 'Under Care', '2024-03-10');