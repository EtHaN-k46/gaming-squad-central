-- Add length constraints to profiles table for security
-- These constraints enforce maximum lengths at the database level as a defense in depth measure

-- Add CHECK constraints for field lengths
ALTER TABLE public.profiles
ADD CONSTRAINT profiles_username_length CHECK (char_length(username) <= 30),
ADD CONSTRAINT profiles_first_name_length CHECK (char_length(first_name) <= 64),
ADD CONSTRAINT profiles_last_name_length CHECK (char_length(last_name) <= 64),
ADD CONSTRAINT profiles_bio_length CHECK (char_length(bio) <= 2000),
ADD CONSTRAINT profiles_avatar_url_length CHECK (char_length(avatar_url) <= 500);

-- Add constraint to ensure username follows allowed pattern (alphanumeric, underscore, hyphen, dot)
-- This prevents special characters that could be used in XSS attacks
ALTER TABLE public.profiles
ADD CONSTRAINT profiles_username_pattern CHECK (
  username IS NULL OR username ~ '^[a-zA-Z0-9_.-]{3,30}$'
);

-- Add constraint for avatar_url to only allow https URLs (or empty)
ALTER TABLE public.profiles
ADD CONSTRAINT profiles_avatar_url_protocol CHECK (
  avatar_url IS NULL OR 
  avatar_url = '' OR 
  avatar_url ~ '^https://[a-zA-Z0-9][a-zA-Z0-9.-]*\.[a-zA-Z]{2,}(/.*)?$'
);

-- Create a function to sanitize text by stripping HTML tags
-- This is used as a trigger to sanitize data on insert/update
CREATE OR REPLACE FUNCTION public.sanitize_profile_text()
RETURNS TRIGGER AS $$
BEGIN
  -- Strip HTML tags from bio (plain text only)
  IF NEW.bio IS NOT NULL THEN
    NEW.bio := regexp_replace(NEW.bio, '<[^>]*>', '', 'g');
    NEW.bio := regexp_replace(NEW.bio, 'javascript:', '', 'gi');
    NEW.bio := regexp_replace(NEW.bio, 'vbscript:', '', 'gi');
    NEW.bio := regexp_replace(NEW.bio, 'on\w+\s*=', '', 'gi');
  END IF;
  
  -- Sanitize first_name and last_name
  IF NEW.first_name IS NOT NULL THEN
    NEW.first_name := regexp_replace(NEW.first_name, '<[^>]*>', '', 'g');
  END IF;
  
  IF NEW.last_name IS NOT NULL THEN
    NEW.last_name := regexp_replace(NEW.last_name, '<[^>]*>', '', 'g');
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for automatic sanitization on insert/update
CREATE TRIGGER sanitize_profile_on_change
BEFORE INSERT OR UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.sanitize_profile_text();

-- Create a function to sanitize existing data (one-time cleanup)
-- This can be called manually to clean up existing data
CREATE OR REPLACE FUNCTION public.sanitize_existing_profiles()
RETURNS INTEGER AS $$
DECLARE
  updated_count INTEGER;
BEGIN
  -- Update all profiles to trigger sanitization
  WITH updated AS (
    UPDATE public.profiles
    SET 
      bio = CASE 
        WHEN bio IS NOT NULL THEN 
          regexp_replace(
            regexp_replace(
              regexp_replace(bio, '<[^>]*>', '', 'g'),
              'javascript:', '', 'gi'
            ),
            'on\w+\s*=', '', 'gi'
          )
        ELSE bio
      END,
      first_name = CASE 
        WHEN first_name IS NOT NULL THEN regexp_replace(first_name, '<[^>]*>', '', 'g')
        ELSE first_name
      END,
      last_name = CASE 
        WHEN last_name IS NOT NULL THEN regexp_replace(last_name, '<[^>]*>', '', 'g')
        ELSE last_name
      END,
      updated_at = now()
    WHERE 
      bio ~ '<[^>]*>' OR 
      bio ~* 'javascript:' OR 
      bio ~* 'on\w+\s*=' OR
      first_name ~ '<[^>]*>' OR
      last_name ~ '<[^>]*>'
    RETURNING id
  )
  SELECT count(*) INTO updated_count FROM updated;
  
  RETURN updated_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;