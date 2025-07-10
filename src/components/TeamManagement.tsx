
import React, { useState, useEffect } from 'react';
import { Plus, X, Edit, Trash2, Users, Settings, Crown } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useUserRole } from '@/hooks/useUserRole';
import { SecurityValidator } from '@/utils/security';

interface TeamMember {
  id: string;
  division: string;
  team_name: string;
  username: string;
  team_number: number;
  is_captain: boolean;
  discord?: string;
  twitch?: string;
  twitter?: string;
  youtube?: string;
  instagram?: string;
}

interface TeamSettings {
  id?: string;
  division: string;
  team1_max_players: number;
  team2_max_players: number;
}

const TeamManagement = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [teamSettings, setTeamSettings] = useState<TeamSettings | null>(null);
  const [loading, setLoading] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [userDivision, setUserDivision] = useState<string | null>(null);
  const [showDivisionSelector, setShowDivisionSelector] = useState(false);
  const [formData, setFormData] = useState({
    team_name: '',
    username: '',
    team_number: 1,
    is_captain: false,
    discord: '',
    twitch: '',
    twitter: '',
    youtube: '',
    instagram: '',
  });
  const [settingsData, setSettingsData] = useState({
    team1_max_players: 5,
    team2_max_players: 5,
  });

  const { user } = useAuth();
  const { toast } = useToast();
  const { role } = useUserRole();

  const divisions = ['Apex Legends', 'Valorant', 'Call of Duty', 'Siege X', 'Call of Duty Mobile'];

  useEffect(() => {
    if (user && (role === 'division_head' || role === 'admin')) {
      fetchUserDivision();
    }
  }, [user, role]);

  useEffect(() => {
    if (userDivision) {
      fetchTeamMembers();
      fetchTeamSettings();
    }
  }, [userDivision]);

  const fetchUserDivision = async () => {
    if (!user) return;
    
    // If admin, set a default division or allow selecting from all divisions
    if (role === 'admin') {
      // For now, set to the first division for admin to manage
      setUserDivision('Apex Legends');
      return;
    }
    
    if (role !== 'division_head') return;
    
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('division')
        .eq('user_id', user.id)
        .eq('role', 'division_head')
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching user division:', error);
        return;
      }

      setUserDivision(data?.division || null);
    } catch (error) {
      console.error('Error fetching user division:', error);
    }
  };

  const fetchTeamMembers = async () => {
    if (!user || !userDivision) return;

    try {
      let query = supabase.from('team_members').select('*');
      
      // Both admins and division heads should filter by division
      query = query.eq('division', userDivision);

      const { data, error } = await query.order('username');

      if (error) {
        console.error('Error fetching team members:', error);
        return;
      }

      // Handle the new database columns properly
      const membersWithDefaults = (data || []).map(member => ({
        ...member,
        team_number: member.team_number ?? 1,
        is_captain: member.is_captain ?? false,
      }));

      setTeamMembers(membersWithDefaults);
    } catch (error) {
      console.error('Error fetching team members:', error);
    }
  };

  const fetchTeamSettings = async () => {
    if (!userDivision) return;

    try {
      const { data, error } = await supabase
        .from('team_settings')
        .select('*')
        .eq('division', userDivision)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching team settings:', error);
        return;
      }

      if (data) {
        setTeamSettings(data);
        setSettingsData({
          team1_max_players: data.team1_max_players ?? 5,
          team2_max_players: data.team2_max_players ?? 5,
        });
      } else {
        // Default settings if none exist
        setTeamSettings({
          division: userDivision,
          team1_max_players: 5,
          team2_max_players: 5,
        });
        setSettingsData({
          team1_max_players: 5,
          team2_max_players: 5,
        });
      }
    } catch (error) {
      console.error('Error fetching team settings:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !userDivision) return;

    // Validate inputs
    if (!SecurityValidator.validateText(formData.team_name, 100)) {
      toast({
        title: "Invalid team name",
        description: "Team name contains invalid characters or is too long.",
        variant: "destructive",
      });
      return;
    }

    if (!SecurityValidator.validateUsername(formData.username)) {
      toast({
        title: "Invalid username",
        description: "Username must be 3-30 characters and contain only letters, numbers, underscores, and hyphens.",
        variant: "destructive",
      });
      return;
    }

    // Validate social media URLs if provided
    const socialUrls = [formData.discord, formData.twitch, formData.twitter, formData.youtube, formData.instagram];
    for (const url of socialUrls) {
      if (url && !SecurityValidator.validateUrl(url)) {
        toast({
          title: "Invalid URL",
          description: "Please enter valid URLs for social media links.",
          variant: "destructive",
        });
        return;
      }
    }

    setLoading(true);
    try {
      const memberData = {
        division: userDivision,
        team_name: SecurityValidator.sanitizeInput(formData.team_name),
        username: SecurityValidator.sanitizeInput(formData.username),
        team_number: formData.team_number,
        is_captain: formData.is_captain,
        discord: formData.discord ? SecurityValidator.sanitizeInput(formData.discord) : null,
        twitch: formData.twitch ? SecurityValidator.sanitizeInput(formData.twitch) : null,
        twitter: formData.twitter ? SecurityValidator.sanitizeInput(formData.twitter) : null,
        youtube: formData.youtube ? SecurityValidator.sanitizeInput(formData.youtube) : null,
        instagram: formData.instagram ? SecurityValidator.sanitizeInput(formData.instagram) : null,
        created_by: user.id,
      };

      if (editingMember) {
        const { error } = await supabase
          .from('team_members')
          .update(memberData)
          .eq('id', editingMember.id);

        if (error) throw error;

        toast({
          title: "Team member updated successfully",
          description: "The team member information has been updated.",
        });
      } else {
        const { error } = await supabase
          .from('team_members')
          .insert(memberData);

        if (error) throw error;

        toast({
          title: "Team member added successfully",
          description: "The new team member has been added.",
        });
      }

      resetForm();
      fetchTeamMembers();
    } catch (error: any) {
      toast({
        title: editingMember ? "Error updating team member" : "Error adding team member",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSettingsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !userDivision) return;

    setLoading(true);
    try {
      const settingsPayload = {
        division: userDivision,
        team1_max_players: settingsData.team1_max_players,
        team2_max_players: settingsData.team2_max_players,
        created_by: user.id,
      };

      if (teamSettings?.id) {
        const { error } = await supabase
          .from('team_settings')
          .update(settingsPayload)
          .eq('id', teamSettings.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('team_settings')
          .insert(settingsPayload);

        if (error) throw error;
      }

      toast({
        title: "Team settings updated successfully",
        description: "The team size limits have been updated.",
      });

      setIsSettingsOpen(false);
      fetchTeamSettings();
    } catch (error: any) {
      toast({
        title: "Error updating team settings",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (member: TeamMember) => {
    setEditingMember(member);
    setFormData({
      team_name: member.team_name,
      username: member.username,
      team_number: member.team_number,
      is_captain: member.is_captain,
      discord: member.discord || '',
      twitch: member.twitch || '',
      twitter: member.twitter || '',
      youtube: member.youtube || '',
      instagram: member.instagram || '',
    });
    setIsOpen(true);
  };

  const handleDelete = async (memberId: string) => {
    if (!confirm('Are you sure you want to remove this team member?')) return;

    try {
      const { error } = await supabase
        .from('team_members')
        .delete()
        .eq('id', memberId);

      if (error) throw error;

      toast({
        title: "Team member removed successfully",
        description: "The team member has been removed from the roster.",
      });

      fetchTeamMembers();
    } catch (error: any) {
      toast({
        title: "Error removing team member",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      team_name: '',
      username: '',
      team_number: 1,
      is_captain: false,
      discord: '',
      twitch: '',
      twitter: '',
      youtube: '',
      instagram: '',
    });
    setEditingMember(null);
    setIsOpen(false);
  };

  const groupedMembers = teamMembers.reduce((acc, member) => {
    const key = `Team ${member.team_number}`;
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(member);
    return acc;
  }, {} as Record<string, TeamMember[]>);

  if (!user || (role !== 'division_head' && role !== 'admin')) {
    return null;
  }

  return (
    <div className="mt-8">
      {/* Admin Division Selector */}
      {role === 'admin' && (
        <div className="mb-6 bg-gray-900/50 rounded-xl p-4 border border-gray-800">
          <label className="block text-gray-300 text-sm font-medium mb-2">
            Select Division to Manage
          </label>
          <select
            value={userDivision || ''}
            onChange={(e) => setUserDivision(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
          >
            <option value="">Select a division...</option>
            {divisions.map((division) => (
              <option key={division} value={division}>
                {division}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold text-white flex items-center">
          <Users className="mr-2" />
          Team Management {userDivision && `- ${userDivision}`}
        </h3>
        <div className="flex space-x-2">
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg inline-flex items-center transition-colors"
          >
            <Settings size={16} className="mr-2" />
            Team Settings
          </button>
          <button
            onClick={() => setIsOpen(true)}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg inline-flex items-center transition-colors"
          >
            <Plus size={16} className="mr-2" />
            Add Member
          </button>
        </div>
      </div>

      {/* Team Members Display */}
      <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-800">
        {Object.keys(groupedMembers).length === 0 ? (
          <p className="text-gray-400 text-center py-8">No team members added yet.</p>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {['Team 1', 'Team 2'].map((teamKey) => {
              const members = groupedMembers[teamKey] || [];
              const maxPlayers = teamKey === 'Team 1' ? 
                (teamSettings?.team1_max_players || 5) : 
                (teamSettings?.team2_max_players || 5);
              
              return (
                <div key={teamKey} className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-semibold text-white">{teamKey}</h4>
                    <span className="text-sm text-gray-400">
                      {members.length}/{maxPlayers} players
                    </span>
                  </div>
                  
                  <div className="space-y-3">
                    {members.map((member) => (
                      <div key={member.id} className="bg-gray-700/50 rounded-lg p-3 border border-gray-600">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center">
                            {member.is_captain && (
                              <Crown className="text-yellow-500 mr-2" size={16} />
                            )}
                            <h5 className="font-semibold text-white">{member.username}</h5>
                          </div>
                          <div className="flex space-x-1">
                            <button
                              onClick={() => handleEdit(member)}
                              className="text-gray-400 hover:text-white p-1"
                            >
                              <Edit size={14} />
                            </button>
                            <button
                              onClick={() => handleDelete(member.id)}
                              className="text-red-400 hover:text-red-300 p-1"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                        <div className="text-xs text-gray-400">
                          Team: {member.team_name}
                        </div>
                        <div className="text-sm text-gray-400 space-y-1 mt-2">
                          {member.discord && <div>Discord: {member.discord}</div>}
                          {member.twitch && <div>Twitch: {member.twitch}</div>}
                          {member.twitter && <div>Twitter: {member.twitter}</div>}
                          {member.youtube && <div>YouTube: {member.youtube}</div>}
                          {member.instagram && <div>Instagram: {member.instagram}</div>}
                        </div>
                      </div>
                    ))}
                    
                    {members.length === 0 && (
                      <div className="text-center text-gray-500 py-4">
                        No players in {teamKey}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add/Edit Member Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-xl p-6 w-full max-w-md border border-gray-800 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">
                {editingMember ? 'Edit Team Member' : 'Add Team Member'}
              </h2>
              <button
                onClick={resetForm}
                className="text-gray-400 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Team Name
                </label>
                <input
                  type="text"
                  value={formData.team_name}
                  onChange={(e) => setFormData({ ...formData, team_name: SecurityValidator.sanitizeInput(e.target.value) })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
                  placeholder="e.g., Alpha Squad, Team Red"
                  maxLength={100}
                  required
                />
              </div>

              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Username
                </label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
                  placeholder="Player username"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Team Number
                  </label>
                  <select
                    value={formData.team_number}
                    onChange={(e) => setFormData({ ...formData, team_number: parseInt(e.target.value) })}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
                    required
                  >
                    <option value={1}>Team 1</option>
                    <option value={2}>Team 2</option>
                  </select>
                </div>

                <div className="flex items-center space-x-3 pt-6">
                  <input
                    type="checkbox"
                    id="captain"
                    checked={formData.is_captain}
                    onChange={(e) => setFormData({ ...formData, is_captain: e.target.checked })}
                    className="w-4 h-4 text-red-600 bg-gray-700 border-gray-600 rounded focus:ring-red-500"
                  />
                  <label htmlFor="captain" className="text-gray-300 text-sm">
                    Team Captain
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Discord
                  </label>
                  <input
                    type="text"
                    value={formData.discord}
                    onChange={(e) => setFormData({ ...formData, discord: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
                    placeholder="Discord#1234"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Twitch
                  </label>
                  <input
                    type="text"
                    value={formData.twitch}
                    onChange={(e) => setFormData({ ...formData, twitch: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
                    placeholder="twitch.tv/username"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Twitter
                  </label>
                  <input
                    type="text"
                    value={formData.twitter}
                    onChange={(e) => setFormData({ ...formData, twitter: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
                    placeholder="@username"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    YouTube
                  </label>
                  <input
                    type="text"
                    value={formData.youtube}
                    onChange={(e) => setFormData({ ...formData, youtube: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
                    placeholder="Channel Name"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Instagram
                </label>
                <input
                  type="text"
                  value={formData.instagram}
                  onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
                  placeholder="@username"
                />
              </div>

              <div className="flex space-x-4 pt-4">
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-3 px-4 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Saving...' : (editingMember ? 'Update' : 'Add Member')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Team Settings Modal */}
      {isSettingsOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-xl p-6 w-full max-w-md border border-gray-800">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Team Settings</h2>
              <button
                onClick={() => setIsSettingsOpen(false)}
                className="text-gray-400 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSettingsSubmit} className="space-y-4">
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Team 1 Max Players
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={settingsData.team1_max_players}
                  onChange={(e) => setSettingsData({ ...settingsData, team1_max_players: parseInt(e.target.value) })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Team 2 Max Players
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={settingsData.team2_max_players}
                  onChange={(e) => setSettingsData({ ...settingsData, team2_max_players: parseInt(e.target.value) })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
                  required
                />
              </div>

              <div className="flex space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => setIsSettingsOpen(false)}
                  className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-3 px-4 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Saving...' : 'Update Settings'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamManagement;
