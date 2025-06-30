
-- Add division field to events table and support for recurring events
ALTER TABLE public.events ADD COLUMN division TEXT;
ALTER TABLE public.events ADD COLUMN is_recurring BOOLEAN DEFAULT FALSE;
ALTER TABLE public.events ADD COLUMN recurrence_day INTEGER; -- 0 = Sunday, 1 = Monday, etc.

-- Create table for team members
CREATE TABLE public.team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  division TEXT NOT NULL,
  team_name TEXT NOT NULL,
  username TEXT NOT NULL,
  discord TEXT,
  twitch TEXT,
  twitter TEXT,
  youtube TEXT,
  instagram TEXT,
  created_by UUID REFERENCES auth.users(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on team_members
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

-- RLS policies for team_members
CREATE POLICY "Everyone can view team members" ON public.team_members
  FOR SELECT USING (true);

CREATE POLICY "Admins and division heads can manage team members" ON public.team_members
  FOR ALL USING (
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'division_head')
  );

-- Update user_roles to include division information
ALTER TABLE public.user_roles ADD COLUMN division TEXT;
