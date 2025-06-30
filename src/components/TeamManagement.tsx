
import React, { useState, useEffect } from 'react';
import { Plus, X, Edit, Trash2, Users } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useUserRole } from '@/hooks/useUserRole';

interface TeamMember {
  id: string;
  division: string;
  team_name: string;
  username: string;
  discord?: string;
  twitch?: string;
  twitter?: string;
  youtube?: string;
  instagram?: string;
}

const TeamManagement = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [userDivision, setUserDivision] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    team_name: '',
    username: '',
    discord: '',
    twitch: '',
    twitter: '',
    youtube: '',
    instagram: '',
  });

  const { user } = useAuth();
  const { toast } = useToast();
  const { role } = useUserRole();

  const divisions = ['Apex Legends', 'Valorant', 'Call of Duty', 'Siege X', 'Call of Duty Mobile'];

  useEffect(() => {
    if (user && (role === 'division_head' || role === 'admin')) {
      fetchUserDivision();
      fetchTeamMembers();
    }
  }, [user, role]);

  const fetchUserDivision = async () => {
    if (!user || role !== 'division_head') return;
    
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
    if (!user) return;

    try {
      let query = supabase.from('team_members').select('*');
      
      if (role === 'division_head' && userDivision) {
        query = query.eq('division', userDivision);
      }

      const { data, error } = await query.order('team_name').order('username');

      if (error) {
        console.error('Error fetching team members:', error);
        return;
      }

      setTeamMembers(data || []);
    } catch (error) {
      console.error('Error fetching team members:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !userDivision) return;

    setLoading(true);
    try {
      const memberData = {
        division: userDivision,
        team_name: formData.team_name,
        username: formData.username,
        discord: formData.discord || null,
        twitch: formData.twitch || null,
        twitter: formData.twitter || null,
        youtube: formData.youtube || null,
        instagram: formData.instagram || null,
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

  const handleEdit = (member: TeamMember) => {
    setEditingMember(member);
    setFormData({
      team_name: member.team_name,
      username: member.username,
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
    if (!acc[member.team_name]) {
      acc[member.team_name] = [];
    }
    acc[member.team_name].push(member);
    return acc;
  }, {} as Record<string, TeamMember[]>);

  if (!user || (role !== 'division_head' && role !== 'admin')) {
    return null;
  }

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold text-white flex items-center">
          <Users className="mr-2" />
          Team Management {userDivision && `- ${userDivision}`}
        </h3>
        <button
          onClick={() => setIsOpen(true)}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg inline-flex items-center transition-colors"
        >
          <Plus size={16} className="mr-2" />
          Add Member
        </button>
      </div>

      {/* Team Members Display */}
      <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-800">
        {Object.keys(groupedMembers).length === 0 ? (
          <p className="text-gray-400 text-center py-8">No team members added yet.</p>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedMembers).map(([teamName, members]) => (
              <div key={teamName}>
                <h4 className="text-lg font-semibold text-white mb-3">{teamName}</h4>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {members.map((member) => (
                    <div key={member.id} className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                      <div className="flex justify-between items-start mb-2">
                        <h5 className="font-semibold text-white">{member.username}</h5>
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
                      <div className="text-sm text-gray-400 space-y-1">
                        {member.discord && <div>Discord: {member.discord}</div>}
                        {member.twitch && <div>Twitch: {member.twitch}</div>}
                        {member.twitter && <div>Twitter: {member.twitter}</div>}
                        {member.youtube && <div>YouTube: {member.youtube}</div>}
                        {member.instagram && <div>Instagram: {member.instagram}</div>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
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
                  onChange={(e) => setFormData({ ...formData, team_name: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
                  placeholder="e.g., Alpha Squad, Team Red"
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
    </div>
  );
};

export default TeamManagement;
