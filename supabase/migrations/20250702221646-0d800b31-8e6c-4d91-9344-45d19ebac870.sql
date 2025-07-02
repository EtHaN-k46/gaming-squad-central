
-- Add custom team names to team_settings table
ALTER TABLE public.team_settings 
ADD COLUMN team1_name TEXT DEFAULT 'Team 1',
ADD COLUMN team2_name TEXT DEFAULT 'Team 2';

-- Create division_heads table for managing division heads
CREATE TABLE public.division_heads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  division TEXT NOT NULL,
  display_name TEXT NOT NULL,
  created_by UUID REFERENCES auth.users(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, division)
);

-- Enable RLS on division_heads
ALTER TABLE public.division_heads ENABLE ROW LEVEL SECURITY;

-- RLS policies for division_heads
CREATE POLICY "Everyone can view division heads" ON public.division_heads
  FOR SELECT USING (true);

CREATE POLICY "Only admins can manage division heads" ON public.division_heads
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Update team_members table to use custom team names
ALTER TABLE public.team_members 
ADD COLUMN custom_team_name TEXT;
