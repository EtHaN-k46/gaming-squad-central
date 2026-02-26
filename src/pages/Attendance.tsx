
import React, { useState, useEffect, useCallback } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from '@/hooks/useUserRole';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
  CheckCircle2,
  Plus,
  Calendar,
  Users,
  Clock,
  BarChart3,
  Trash2,
  XCircle,
  TrendingUp,
  Award,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface TrainingSession {
  id: string;
  title: string;
  description: string | null;
  division: string;
  session_date: string;
  session_time: string;
  created_by: string;
  is_active: boolean;
  created_at: string;
}

interface AttendanceRecord {
  id: string;
  session_id: string;
  user_id: string;
  checked_in_at: string;
  notes: string | null;
}

interface ProfileInfo {
  id: string;
  username: string | null;
  first_name: string | null;
  last_name: string | null;
}

const divisions = ['Apex Legends', 'Valorant', 'Call of Duty', 'Siege X', 'Call of Duty Mobile'];

const Attendance = () => {
  const { user, loading: authLoading } = useAuth();
  const { role, loading: roleLoading, userDivision } = useUserRole();
  const { toast } = useToast();

  const [sessions, setSessions] = useState<TrainingSession[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [profiles, setProfiles] = useState<Record<string, ProfileInfo>>({});
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [selectedDivisionFilter, setSelectedDivisionFilter] = useState<string>('all');

  // Form state
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formDivision, setFormDivision] = useState('');
  const [formDate, setFormDate] = useState('');
  const [formTime, setFormTime] = useState('');
  const [creating, setCreating] = useState(false);

  const isLeader = role === 'admin' || role === 'division_head';

  const fetchData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      // Fetch sessions
      const { data: sessionsData, error: sessionsError } = await supabase
        .from('training_sessions')
        .select('*')
        .order('session_date', { ascending: false });

      if (sessionsError) throw sessionsError;
      setSessions(sessionsData || []);

      // Fetch all attendance records
      const { data: attendanceData, error: attendanceError } = await supabase
        .from('training_attendance')
        .select('*');

      if (attendanceError) throw attendanceError;
      setAttendance(attendanceData || []);

      // Fetch profiles for display
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('id, username, first_name, last_name');

      if (profilesData) {
        const profileMap: Record<string, ProfileInfo> = {};
        profilesData.forEach((p: ProfileInfo) => { profileMap[p.id] = p; });
        setProfiles(profileMap);
      }
    } catch (error) {
      console.error('Error fetching attendance data:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) fetchData();
  }, [user, fetchData]);

  const handleCreateSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!formTitle.trim() || !formDivision || !formDate || !formTime) {
      toast({ title: 'Please fill in all required fields', variant: 'destructive' });
      return;
    }

    if (formTitle.length > 200) {
      toast({ title: 'Title is too long (max 200 characters)', variant: 'destructive' });
      return;
    }

    setCreating(true);
    try {
      const { error } = await supabase.from('training_sessions').insert({
        title: formTitle.trim(),
        description: formDescription.trim() || null,
        division: formDivision,
        session_date: formDate,
        session_time: formTime,
        created_by: user.id,
      });

      if (error) throw error;

      toast({ title: 'Training session created!' });

      // Send Discord notification (fire-and-forget)
      supabase.functions.invoke('notify-discord', {
        body: {
          title: formTitle.trim(),
          division: formDivision,
          session_date: formDate,
          session_time: formTime,
          description: formDescription.trim() || null,
        },
      }).catch((err) => console.error('Discord notification failed:', err));

      setFormTitle('');
      setFormDescription('');
      setFormDivision('');
      setFormDate('');
      setFormTime('');
      setCreateOpen(false);
      fetchData();
    } catch (error: any) {
      toast({ title: 'Error creating session', description: error.message, variant: 'destructive' });
    } finally {
      setCreating(false);
    }
  };

  const handleCheckIn = async (sessionId: string) => {
    if (!user) return;
    try {
      const { error } = await supabase.from('training_attendance').insert({
        session_id: sessionId,
        user_id: user.id,
      });

      if (error) {
        if (error.code === '23505') {
          toast({ title: 'Already checked in', description: 'You have already marked your attendance.', variant: 'destructive' });
          return;
        }
        throw error;
      }

      toast({ title: 'Checked in!', description: 'Your attendance has been recorded.' });
      fetchData();
    } catch (error: any) {
      toast({ title: 'Error checking in', description: error.message, variant: 'destructive' });
    }
  };

  const handleRemoveCheckIn = async (sessionId: string) => {
    if (!user) return;
    try {
      const { error } = await supabase
        .from('training_attendance')
        .delete()
        .eq('session_id', sessionId)
        .eq('user_id', user.id);

      if (error) throw error;
      toast({ title: 'Check-in removed' });
      fetchData();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const handleDeleteSession = async (sessionId: string) => {
    if (!confirm('Delete this training session and all attendance records?')) return;
    try {
      const { error } = await supabase.from('training_sessions').delete().eq('id', sessionId);
      if (error) throw error;
      toast({ title: 'Session deleted' });
      fetchData();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const isCheckedIn = (sessionId: string) =>
    attendance.some((a) => a.session_id === sessionId && a.user_id === user?.id);

  const getSessionAttendees = (sessionId: string) =>
    attendance.filter((a) => a.session_id === sessionId);

  const getDisplayName = (userId: string) => {
    const profile = profiles[userId];
    if (!profile) return 'Unknown User';
    if (profile.first_name || profile.last_name)
      return `${profile.first_name || ''} ${profile.last_name || ''}`.trim();
    return profile.username || 'Unknown User';
  };

  const filteredSessions = selectedDivisionFilter === 'all'
    ? sessions
    : sessions.filter((s) => s.division === selectedDivisionFilter);

  // Stats calculations
  const getAttendanceStats = () => {
    const userAttendanceCount: Record<string, number> = {};
    const divisionSessionCount: Record<string, number> = {};

    sessions.forEach((s) => {
      divisionSessionCount[s.division] = (divisionSessionCount[s.division] || 0) + 1;
    });

    attendance.forEach((a) => {
      userAttendanceCount[a.user_id] = (userAttendanceCount[a.user_id] || 0) + 1;
    });

    const topAttenders = Object.entries(userAttendanceCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5);

    return { userAttendanceCount, divisionSessionCount, topAttenders };
  };

  if (authLoading || roleLoading) {
    return (
      <div className="min-h-screen bg-black pt-20 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const stats = getAttendanceStats();
  const myAttendanceCount = stats.userAttendanceCount[user.id] || 0;
  const myAttendanceRate = sessions.length > 0 ? Math.round((myAttendanceCount / sessions.length) * 100) : 0;

  return (
    <div className="min-h-screen bg-black pt-20">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-10">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">Training Attendance</h1>
              <p className="text-gray-400">Track your training sessions and attendance</p>
            </div>
            {isLeader && (
              <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-red-600 hover:bg-red-700 text-white mt-4 md:mt-0">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Training Session
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px] bg-gray-900 border-gray-700">
                  <DialogHeader>
                    <DialogTitle className="text-white">Create Training Session</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleCreateSession} className="space-y-4">
                    <div>
                      <Label className="text-white">Title *</Label>
                      <Input
                        value={formTitle}
                        onChange={(e) => setFormTitle(e.target.value)}
                        placeholder="e.g. Weekly Scrimmage"
                        className="bg-gray-800 border-gray-600 text-white"
                        maxLength={200}
                        required
                      />
                    </div>
                    <div>
                      <Label className="text-white">Description</Label>
                      <Textarea
                        value={formDescription}
                        onChange={(e) => setFormDescription(e.target.value)}
                        placeholder="Optional details..."
                        className="bg-gray-800 border-gray-600 text-white"
                        maxLength={500}
                        rows={3}
                      />
                    </div>
                    <div>
                      <Label className="text-white">Division *</Label>
                      <Select value={formDivision} onValueChange={setFormDivision}>
                        <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                          <SelectValue placeholder="Select division" />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-gray-600">
                          {divisions.map((d) => (
                            <SelectItem key={d} value={d} className="text-white hover:bg-gray-700">{d}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-white">Date *</Label>
                        <Input
                          type="date"
                          value={formDate}
                          onChange={(e) => setFormDate(e.target.value)}
                          className="bg-gray-800 border-gray-600 text-white"
                          required
                        />
                      </div>
                      <div>
                        <Label className="text-white">Time *</Label>
                        <Input
                          type="time"
                          value={formTime}
                          onChange={(e) => setFormTime(e.target.value)}
                          className="bg-gray-800 border-gray-600 text-white"
                          required
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-3 pt-2">
                      <Button type="button" variant="outline" onClick={() => setCreateOpen(false)} className="border-gray-600 text-gray-300">
                        Cancel
                      </Button>
                      <Button type="submit" disabled={creating} className="bg-red-600 hover:bg-red-700 text-white">
                        {creating ? 'Creating...' : 'Create Session'}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            )}
          </div>

          {/* My Stats Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <div className="bg-gray-900/50 rounded-xl p-5 border border-gray-800 flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                <CheckCircle2 className="text-white" size={24} />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{myAttendanceCount}</p>
                <p className="text-gray-400 text-sm">Sessions Attended</p>
              </div>
            </div>
            <div className="bg-gray-900/50 rounded-xl p-5 border border-gray-800 flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                <TrendingUp className="text-white" size={24} />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{myAttendanceRate}%</p>
                <p className="text-gray-400 text-sm">Attendance Rate</p>
              </div>
            </div>
            <div className="bg-gray-900/50 rounded-xl p-5 border border-gray-800 flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Calendar className="text-white" size={24} />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{sessions.length}</p>
                <p className="text-gray-400 text-sm">Total Sessions</p>
              </div>
            </div>
          </div>

          <Tabs defaultValue="sessions" className="space-y-6">
            <TabsList className="bg-gray-900 border border-gray-800">
              <TabsTrigger value="sessions" className="data-[state=active]:bg-red-600 data-[state=active]:text-white text-gray-400">
                <Calendar className="w-4 h-4 mr-2" /> Sessions
              </TabsTrigger>
              {isLeader && (
                <TabsTrigger value="tracking" className="data-[state=active]:bg-red-600 data-[state=active]:text-white text-gray-400">
                  <BarChart3 className="w-4 h-4 mr-2" /> Tracking & Stats
                </TabsTrigger>
              )}
            </TabsList>

            {/* Sessions Tab - Check In */}
            <TabsContent value="sessions">
              {/* Division filter */}
              <div className="mb-6">
                <Select value={selectedDivisionFilter} onValueChange={setSelectedDivisionFilter}>
                  <SelectTrigger className="w-48 bg-gray-900 border-gray-700 text-white">
                    <SelectValue placeholder="Filter by division" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-600">
                    <SelectItem value="all" className="text-white hover:bg-gray-700">All Divisions</SelectItem>
                    {divisions.map((d) => (
                      <SelectItem key={d} value={d} className="text-white hover:bg-gray-700">{d}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {loading ? (
                <div className="text-gray-400 text-center py-12">Loading sessions...</div>
              ) : filteredSessions.length === 0 ? (
                <div className="text-center py-16 text-gray-500">
                  <Calendar size={48} className="mx-auto mb-4 opacity-30" />
                  <p className="text-lg">No training sessions found</p>
                  {isLeader && <p className="text-sm mt-2">Create one to get started!</p>}
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredSessions.map((session) => {
                    const attendees = getSessionAttendees(session.id);
                    const checked = isCheckedIn(session.id);
                    const sessionDate = new Date(session.session_date + 'T00:00:00');
                    const isToday = new Date().toISOString().split('T')[0] === session.session_date;
                    const isPast = sessionDate < new Date(new Date().toISOString().split('T')[0] + 'T00:00:00');

                    return (
                      <div
                        key={session.id}
                        className={`bg-gray-900/50 rounded-xl p-6 border transition-all duration-300 ${
                          isToday ? 'border-red-600/50 shadow-lg shadow-red-600/10' : 'border-gray-800'
                        }`}
                      >
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-xl font-bold text-white">{session.title}</h3>
                              {isToday && (
                                <span className="px-2 py-0.5 bg-red-600/20 text-red-400 rounded-full text-xs font-semibold">
                                  TODAY
                                </span>
                              )}
                              {isPast && !isToday && (
                                <span className="px-2 py-0.5 bg-gray-700 text-gray-400 rounded-full text-xs">
                                  Past
                                </span>
                              )}
                            </div>
                            {session.description && (
                              <p className="text-gray-400 text-sm mb-2">{session.description}</p>
                            )}
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                              <span className="flex items-center gap-1">
                                <Calendar size={14} />
                                {sessionDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock size={14} />
                                {session.session_time}
                              </span>
                              <span className="px-2 py-0.5 bg-gray-800 text-gray-300 rounded text-xs">
                                {session.division}
                              </span>
                              <span className="flex items-center gap-1">
                                <Users size={14} />
                                {attendees.length} present
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {checked ? (
                              <Button
                                variant="outline"
                                onClick={() => handleRemoveCheckIn(session.id)}
                                className="border-green-600 text-green-400 hover:bg-green-600/10"
                              >
                                <CheckCircle2 className="w-4 h-4 mr-2" />
                                Checked In
                              </Button>
                            ) : (
                              <Button
                                onClick={() => handleCheckIn(session.id)}
                                className="bg-green-600 hover:bg-green-700 text-white"
                              >
                                <CheckCircle2 className="w-4 h-4 mr-2" />
                                Check In
                              </Button>
                            )}
                            {isLeader && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDeleteSession(session.id)}
                                className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                              >
                                <Trash2 size={16} />
                              </Button>
                            )}
                          </div>
                        </div>

                        {/* Attendees list (expanded for leaders, compact for members) */}
                        {attendees.length > 0 && (
                          <div className="mt-4 pt-4 border-t border-gray-800">
                            <p className="text-gray-400 text-xs font-semibold mb-2 uppercase tracking-wider">Attendees</p>
                            <div className="flex flex-wrap gap-2">
                              {attendees.map((a) => (
                                <span
                                  key={a.id}
                                  className="inline-flex items-center gap-1 px-3 py-1 bg-gray-800 text-gray-300 rounded-full text-sm"
                                >
                                  <CheckCircle2 size={12} className="text-green-400" />
                                  {getDisplayName(a.user_id)}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </TabsContent>

            {/* Tracking Tab - Leaders Only */}
            {isLeader && (
              <TabsContent value="tracking">
                <div className="space-y-8">
                  {/* Top Attendees */}
                  <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-800">
                    <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                      <Award size={20} className="text-yellow-400" />
                      Top Attendees
                    </h3>
                    {stats.topAttenders.length === 0 ? (
                      <p className="text-gray-500 text-center py-4">No attendance data yet</p>
                    ) : (
                      <div className="space-y-3">
                        {stats.topAttenders.map(([userId, count], idx) => {
                          const rate = sessions.length > 0 ? Math.round((count / sessions.length) * 100) : 0;
                          return (
                            <div key={userId} className="flex items-center gap-4 bg-gray-800/50 rounded-lg p-4">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                                idx === 0 ? 'bg-yellow-500 text-black' : idx === 1 ? 'bg-gray-400 text-black' : idx === 2 ? 'bg-orange-600 text-white' : 'bg-gray-700 text-gray-300'
                              }`}>
                                {idx + 1}
                              </div>
                              <div className="flex-1">
                                <p className="text-white font-medium">{getDisplayName(userId)}</p>
                                <p className="text-gray-500 text-sm">{count} sessions • {rate}% rate</p>
                              </div>
                              <div className="w-24 h-2 bg-gray-700 rounded-full overflow-hidden">
                                <div className="h-full bg-gradient-to-r from-green-500 to-green-400 rounded-full" style={{ width: `${rate}%` }} />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Per-Division Breakdown */}
                  <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-800">
                    <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                      <BarChart3 size={20} className="text-blue-400" />
                      Division Breakdown
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {divisions.map((div) => {
                        const divSessions = sessions.filter((s) => s.division === div);
                        const divAttendance = attendance.filter((a) =>
                          divSessions.some((s) => s.id === a.session_id)
                        );
                        const avgAttendance = divSessions.length > 0
                          ? Math.round(divAttendance.length / divSessions.length)
                          : 0;

                        return (
                          <div key={div} className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                            <h4 className="text-white font-medium mb-2">{div}</h4>
                            <div className="space-y-1 text-sm text-gray-400">
                              <p>{divSessions.length} sessions</p>
                              <p>{divAttendance.length} total check-ins</p>
                              <p>~{avgAttendance} avg per session</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Full Attendance Grid */}
                  <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-800">
                    <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                      <Users size={20} className="text-purple-400" />
                      Full Attendance History
                    </h3>
                    {sessions.length === 0 ? (
                      <p className="text-gray-500 text-center py-4">No sessions yet</p>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-gray-700">
                              <th className="text-left text-gray-400 py-3 px-2 font-medium">Member</th>
                              {sessions.slice(0, 10).map((s) => (
                                <th key={s.id} className="text-center text-gray-400 py-3 px-2 font-medium min-w-[80px]">
                                  <div className="text-xs">{new Date(s.session_date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
                                  <div className="text-xs text-gray-600">{s.division.slice(0, 8)}</div>
                                </th>
                              ))}
                              <th className="text-center text-gray-400 py-3 px-2 font-medium">Total</th>
                            </tr>
                          </thead>
                          <tbody>
                            {Object.keys(stats.userAttendanceCount).map((userId) => (
                              <tr key={userId} className="border-b border-gray-800">
                                <td className="py-3 px-2 text-white font-medium">{getDisplayName(userId)}</td>
                                {sessions.slice(0, 10).map((s) => {
                                  const present = attendance.some(
                                    (a) => a.session_id === s.id && a.user_id === userId
                                  );
                                  return (
                                    <td key={s.id} className="text-center py-3 px-2">
                                      {present ? (
                                        <CheckCircle2 size={16} className="text-green-400 mx-auto" />
                                      ) : (
                                        <XCircle size={16} className="text-gray-700 mx-auto" />
                                      )}
                                    </td>
                                  );
                                })}
                                <td className="text-center py-3 px-2 text-white font-bold">
                                  {stats.userAttendanceCount[userId]}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>
            )}
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Attendance;
