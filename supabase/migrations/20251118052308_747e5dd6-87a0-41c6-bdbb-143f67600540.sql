-- COMPREHENSIVE DATA CLEANUP AND CONSTRAINT ADDITION

-- Step 1: Clean invalid donations
DELETE FROM donations
WHERE 
  NOT (phone ~ '^[0-9]{10}$') OR
  NOT (name ~ '^[A-Za-z ]{2,100}$') OR
  NOT (email ~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$');

-- Step 2: Fix lost_found_submissions contact number
UPDATE lost_found_submissions
SET contact_number = regexp_replace(contact_number, '[^0-9]', '', 'g')
WHERE contact_number ~ '[^0-9]';

-- Step 3: Fix found_animals contact number
UPDATE found_animals
SET contact_number = regexp_replace(contact_number, '[^0-9]', '', 'g')
WHERE contact_number ~ '[^0-9]';

-- Step 4: Delete records that still can't be fixed
DELETE FROM found_animals WHERE length(contact_number) != 10;
DELETE FROM lost_found_submissions WHERE length(contact_number) != 10;

-- Step 5: Fix payment_status values
UPDATE donations
SET payment_status = CASE 
  WHEN payment_status = 'success' THEN 'completed'
  ELSE 'pending'
END
WHERE payment_status NOT IN ('pending', 'completed', 'failed');

-- Step 6: Add helper function
CREATE OR REPLACE FUNCTION is_valid_name(name_text text) 
RETURNS boolean 
LANGUAGE sql 
IMMUTABLE
AS $$
  SELECT name_text ~ '^[A-Za-z ]{2,100}$' AND length(trim(name_text)) >= 2;
$$;

-- Step 7: Add CHECK constraints

-- ADOPTIONS
ALTER TABLE adoptions
  DROP CONSTRAINT IF EXISTS adoptions_name_check,
  DROP CONSTRAINT IF EXISTS adoptions_contact_check,
  DROP CONSTRAINT IF EXISTS adoptions_aadhar_check,
  DROP CONSTRAINT IF EXISTS adoptions_email_check,
  DROP CONSTRAINT IF EXISTS adoptions_status_check;

ALTER TABLE adoptions
  ADD CONSTRAINT adoptions_name_check CHECK (full_name ~ '^[A-Za-z ]{2,100}$'),
  ADD CONSTRAINT adoptions_contact_check CHECK (contact_number ~ '^[0-9]{10}$'),
  ADD CONSTRAINT adoptions_aadhar_check CHECK (aadhar ~ '^[0-9]{12}$'),
  ADD CONSTRAINT adoptions_email_check CHECK (email ~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$'),
  ADD CONSTRAINT adoptions_status_check CHECK (status IN ('pending', 'approved', 'rejected'));

-- CONTACTS
ALTER TABLE contacts
  DROP CONSTRAINT IF EXISTS contacts_name_check,
  DROP CONSTRAINT IF EXISTS contacts_phone_check,
  DROP CONSTRAINT IF EXISTS contacts_email_check;

ALTER TABLE contacts
  ADD CONSTRAINT contacts_name_check CHECK (name ~ '^[A-Za-z ]{2,100}$'),
  ADD CONSTRAINT contacts_phone_check CHECK (phone = '' OR phone ~ '^[0-9]{10}$'),
  ADD CONSTRAINT contacts_email_check CHECK (email ~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$');

-- VOLUNTEERS
ALTER TABLE volunteers
  DROP CONSTRAINT IF EXISTS volunteers_name_check,
  DROP CONSTRAINT IF EXISTS volunteers_phone_check,
  DROP CONSTRAINT IF EXISTS volunteers_email_check,
  DROP CONSTRAINT IF EXISTS volunteers_age_check,
  DROP CONSTRAINT IF EXISTS volunteers_status_check;

ALTER TABLE volunteers
  ADD CONSTRAINT volunteers_name_check CHECK (name ~ '^[A-Za-z ]{2,100}$'),
  ADD CONSTRAINT volunteers_phone_check CHECK (phone ~ '^[0-9]{10}$'),
  ADD CONSTRAINT volunteers_email_check CHECK (email ~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$'),
  ADD CONSTRAINT volunteers_age_check CHECK (age > 0 AND age < 150),
  ADD CONSTRAINT volunteers_status_check CHECK (status IN ('pending', 'approved', 'rejected'));

-- DONATIONS
ALTER TABLE donations
  DROP CONSTRAINT IF EXISTS donations_name_check,
  DROP CONSTRAINT IF EXISTS donations_phone_check,
  DROP CONSTRAINT IF EXISTS donations_email_check,
  DROP CONSTRAINT IF EXISTS donations_amount_check,
  DROP CONSTRAINT IF EXISTS donations_status_check;

ALTER TABLE donations
  ADD CONSTRAINT donations_name_check CHECK (name ~ '^[A-Za-z ]{2,100}$'),
  ADD CONSTRAINT donations_phone_check CHECK (phone ~ '^[0-9]{10}$'),
  ADD CONSTRAINT donations_email_check CHECK (email ~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$'),
  ADD CONSTRAINT donations_amount_check CHECK (amount >= 0),
  ADD CONSTRAINT donations_status_check CHECK (payment_status IN ('pending', 'completed', 'failed'));

-- LOST_FOUND_SUBMISSIONS
ALTER TABLE lost_found_submissions
  DROP CONSTRAINT IF EXISTS lf_submissions_contact_check,
  DROP CONSTRAINT IF EXISTS lf_submissions_status_check;

ALTER TABLE lost_found_submissions
  ADD CONSTRAINT lf_submissions_contact_check CHECK (contact_number ~ '^[0-9]{10}$'),
  ADD CONSTRAINT lf_submissions_status_check CHECK (status IN ('Pending', 'Approved', 'Rejected', 'Reunited'));

-- FOUND_ANIMALS
ALTER TABLE found_animals
  DROP CONSTRAINT IF EXISTS found_animals_contact_check,
  DROP CONSTRAINT IF EXISTS found_animals_status_check;

ALTER TABLE found_animals
  ADD CONSTRAINT found_animals_contact_check CHECK (contact_number ~ '^[0-9]{10}$'),
  ADD CONSTRAINT found_animals_status_check CHECK (status IN ('Found', 'Reunited', 'Sheltered'));

-- Step 8: Create performance indexes
CREATE INDEX IF NOT EXISTS idx_adoptions_status ON adoptions(status);
CREATE INDEX IF NOT EXISTS idx_adoptions_created ON adoptions(submitted_at);
CREATE INDEX IF NOT EXISTS idx_contacts_created ON contacts(created_at);
CREATE INDEX IF NOT EXISTS idx_contacts_read_status ON contacts(read_status);
CREATE INDEX IF NOT EXISTS idx_volunteers_status ON volunteers(status);
CREATE INDEX IF NOT EXISTS idx_volunteers_created ON volunteers(created_at);
CREATE INDEX IF NOT EXISTS idx_donations_status ON donations(payment_status);
CREATE INDEX IF NOT EXISTS idx_donations_created ON donations(created_at);
CREATE INDEX IF NOT EXISTS idx_lf_submissions_status ON lost_found_submissions(status);