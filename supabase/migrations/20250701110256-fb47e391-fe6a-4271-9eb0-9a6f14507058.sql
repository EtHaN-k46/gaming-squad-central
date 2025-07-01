
-- Add team assignment fields to team_members table
ALTER TABLE public.team_members 
ADD COLUMN team_number INTEGER DEFAULT 1 CHECK (team_number IN (1, 2)),
ADD COLUMN is_captain BOOLEAN DEFAULT FALSE;

-- Create team_settings table for division heads to manage team sizes
CREATE TABLE public.team_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  division TEXT NOT NULL UNIQUE,
  team1_max_players INTEGER DEFAULT 5 CHECK (team1_max_players > 0),
  team2_max_players INTEGER DEFAULT 5 CHECK (team2_max_players > 0),
  created_by UUID REFERENCES auth.users(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on team_settings
ALTER TABLE public.team_settings ENABLE ROW LEVEL SECURITY;

-- RLS policies for team_settings
CREATE POLICY "Everyone can view team settings" ON public.team_settings
  FOR SELECT USING (true);

CREATE POLICY "Division heads can manage their team settings" ON public.team_settings
  FOR ALL USING (
    public.has_role(auth.uid(), 'admin') OR 
    (public.has_role(auth.uid(), 'division_head') AND 
     division IN (
       SELECT ur.division 
       FROM public.user_roles ur 
       WHERE ur.user_id = auth.uid() AND ur.role = 'division_head'
     ))
  );

-- Add profile selection for division heads
ALTER TABLE public.profiles 
ADD COLUMN preferred_division TEXT,
ADD COLUMN is_division_head BOOLEAN DEFAULT FALSE;
