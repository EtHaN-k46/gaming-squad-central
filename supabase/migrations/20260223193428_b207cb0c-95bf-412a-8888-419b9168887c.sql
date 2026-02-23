
-- Training sessions table (created by leaders/admins)
CREATE TABLE public.training_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  division TEXT NOT NULL,
  session_date DATE NOT NULL,
  session_time TIME NOT NULL,
  created_by UUID NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.training_sessions ENABLE ROW LEVEL SECURITY;

-- Everyone can view training sessions
CREATE POLICY "Training sessions are viewable by authenticated users"
  ON public.training_sessions FOR SELECT USING (auth.uid() IS NOT NULL);

-- Only admins and division heads can create
CREATE POLICY "Leaders can create training sessions"
  ON public.training_sessions FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'division_head'))
  );

-- Only admins and division heads can update
CREATE POLICY "Leaders can update training sessions"
  ON public.training_sessions FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'division_head'))
  );

-- Only admins and division heads can delete
CREATE POLICY "Leaders can delete training sessions"
  ON public.training_sessions FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'division_head'))
  );

-- Training attendance table (members check in)
CREATE TABLE public.training_attendance (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES public.training_sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  checked_in_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  notes TEXT,
  UNIQUE(session_id, user_id)
);

ALTER TABLE public.training_attendance ENABLE ROW LEVEL SECURITY;

-- Authenticated users can view attendance
CREATE POLICY "Attendance is viewable by authenticated users"
  ON public.training_attendance FOR SELECT USING (auth.uid() IS NOT NULL);

-- Users can check themselves in
CREATE POLICY "Users can check in themselves"
  ON public.training_attendance FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can remove their own check-in, leaders can remove any
CREATE POLICY "Users can remove own check-in or leaders can remove any"
  ON public.training_attendance FOR DELETE USING (
    auth.uid() = user_id OR
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'division_head'))
  );
