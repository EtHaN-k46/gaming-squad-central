
-- Create an enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'division_head', 'user');

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (user_id, role)
);

-- Create events table for calendar
CREATE TABLE public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  game TEXT NOT NULL,
  event_date DATE NOT NULL,
  event_time TIME NOT NULL,
  created_by UUID REFERENCES auth.users(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on both tables
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check user roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- RLS policies for user_roles
CREATE POLICY "Users can view their own roles" ON public.user_roles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles" ON public.user_roles
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- RLS policies for events
CREATE POLICY "Everyone can view events" ON public.events
  FOR SELECT USING (true);

CREATE POLICY "Admins and division heads can create events" ON public.events
  FOR INSERT WITH CHECK (
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'division_head')
  );

CREATE POLICY "Admins and division heads can update events" ON public.events
  FOR UPDATE USING (
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'division_head')
  );

CREATE POLICY "Admins and division heads can delete events" ON public.events
  FOR DELETE USING (
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'division_head')
  );
