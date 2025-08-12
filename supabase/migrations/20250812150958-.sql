-- Fix RLS policies to protect user personal information

-- Drop the existing overly permissive policy for profiles
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;

-- Create a more secure policy that only allows authenticated users to view profiles
-- This maintains functionality while protecting personal information
CREATE POLICY "Authenticated users can view profiles" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (true);

-- Also fix the team_members table which exposes social media handles
DROP POLICY IF EXISTS "Everyone can view team members" ON public.team_members;

-- Allow authenticated users to view team members (since this is needed for the app functionality)
CREATE POLICY "Authenticated users can view team members" 
ON public.team_members 
FOR SELECT 
TO authenticated
USING (true);

-- Fix the function search path security issues
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  INSERT INTO public.profiles (id, username, first_name, last_name)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'username',
    NEW.raw_user_meta_data->>'first_name',
    NEW.raw_user_meta_data->>'last_name'
  );
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$function$;