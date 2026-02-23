
-- 1. Profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL PRIMARY KEY,
  username TEXT,
  first_name TEXT,
  last_name TEXT,
  bio TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- 2. User roles table
CREATE TABLE public.user_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  role TEXT NOT NULL DEFAULT 'user',
  division TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "User roles are viewable by authenticated users" ON public.user_roles FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Only admins can insert user roles" ON public.user_roles FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Only admins can update user roles" ON public.user_roles FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Only admins can delete user roles" ON public.user_roles FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

-- 3. Events table
CREATE TABLE public.events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  game TEXT NOT NULL,
  division TEXT,
  event_date TEXT NOT NULL,
  event_time TEXT NOT NULL,
  is_recurring BOOLEAN DEFAULT false,
  recurrence_day INTEGER,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Events are viewable by everyone" ON public.events FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create events" ON public.events FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Event creators and admins can update" ON public.events FOR UPDATE USING (
  auth.uid() = created_by OR EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Event creators and admins can delete" ON public.events FOR DELETE USING (
  auth.uid() = created_by OR EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

-- 4. Team members table
CREATE TABLE public.team_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  division TEXT NOT NULL,
  team_name TEXT NOT NULL DEFAULT '',
  username TEXT NOT NULL,
  team_number INTEGER NOT NULL DEFAULT 1,
  is_captain BOOLEAN NOT NULL DEFAULT false,
  discord TEXT,
  twitch TEXT,
  twitter TEXT,
  youtube TEXT,
  instagram TEXT,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Team members are viewable by everyone" ON public.team_members FOR SELECT USING (true);
CREATE POLICY "Admins and division heads can insert team members" ON public.team_members FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'division_head'))
);
CREATE POLICY "Admins and division heads can update team members" ON public.team_members FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'division_head'))
);
CREATE POLICY "Admins and division heads can delete team members" ON public.team_members FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'division_head'))
);

-- 5. Division heads table
CREATE TABLE public.division_heads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  division TEXT NOT NULL,
  display_name TEXT NOT NULL,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.division_heads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Division heads are viewable by everyone" ON public.division_heads FOR SELECT USING (true);
CREATE POLICY "Only admins can manage division heads" ON public.division_heads FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Only admins can update division heads" ON public.division_heads FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Only admins can delete division heads" ON public.division_heads FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

-- 6. Team settings table
CREATE TABLE public.team_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  division TEXT NOT NULL,
  team1_name TEXT DEFAULT 'Team 1',
  team2_name TEXT DEFAULT 'Team 2',
  team1_max_players INTEGER DEFAULT 5,
  team2_max_players INTEGER DEFAULT 5,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.team_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Team settings are viewable by everyone" ON public.team_settings FOR SELECT USING (true);
CREATE POLICY "Admins and division heads can insert team settings" ON public.team_settings FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'division_head'))
);
CREATE POLICY "Admins and division heads can update team settings" ON public.team_settings FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'division_head'))
);
CREATE POLICY "Admins and division heads can delete team settings" ON public.team_settings FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'division_head'))
);
