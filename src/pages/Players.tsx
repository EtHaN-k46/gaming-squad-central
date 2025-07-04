import React, { useState, useEffect } from 'react';
import { Users, Crown, Shield, Edit, Plus, Save, X, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useUserRole } from '@/hooks/useUserRole';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import TeamNameEditor from '@/components/TeamNameEditor';
import DivisionHeadManager from '@/components/DivisionHeadManager';

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
  division: string;
  team1_max_players: number;
  team2_max_players: number;
  team1_name: string;
  team2_name: string;
}

const Players = () => {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [teamSettings, setTeamSettings] = useState<TeamSettings[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDivision, setSelectedDivision] = useState<string>('all');
  const [editingPlayer, setEditingPlayer] = useState<TeamMember | null>(null);
  const [isAddingPlayer, setIsAddingPlayer] = useState<{division: string, team: number} | null>(null);
  const [newPlayerData, setNewPlayerData] = useState({
    username: '',
    discord: '',
    twitch: '',
    twitter: '',
    youtube: '',
    instagram: '',
    is_captain: false,
  });
  
  const { user } = useAuth();
  const { role, canManageEvents } = useUserRole();
  const { toast } = useToast();

  const divisions = ['Apex Legends', 'Valorant', 'Call of Duty', 'Siege X', 'Call of Duty Mobile'];
  
  const gameColors = {
    'Apex Legends': 'from-orange-500 to-orange-600',
    'Valorant': 'from-red-500 to-red-600',
    'Call of Duty': 'from-green-500 to-green-600',
    'Siege X': 'from-blue-500 to-blue-600',
    'Call of Duty Mobile': 'from-purple-500 to-purple-600'
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const { data: membersData, error: membersError } = await supabase
        .from('team_members')
        .select('*')
        .order('division')
        .order('username');

      if (membersError) throw membersError;

      const membersWithDefaults = (membersData || []).map(member => ({
        ...member,
        team_number: member.team_number ?? 1,
        is_captain: member.is_captain ?? false,
      }));

      setTeamMembers(membersWithDefaults);

      const { data: settingsData, error: settingsError } = await supabase
        .from('team_settings')
        .select('*');

      if (settingsError && settingsError.code !== 'PGRST116') {
        console.error('Error fetching team settings:', settingsError);
      }

      const settings = settingsData || [];
      const defaultSettings = divisions.map(division => {
        const existingSetting = settings.find(s => s.division === division);
        return existingSetting || {
          division,
          team1_max_players: 5,
          team2_max_players: 5,
          team1_name: 'Team 1',
          team2_name: 'Team 2',
        };
      });
      
      setTeamSettings(defaultSettings);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredMembers = () => {
    if (selectedDivision === 'all') return teamMembers;
    return teamMembers.filter(member => member.division === selectedDivision);
  };

  const getTeamsByDivision = (division: string) => {
    const divisionMembers = teamMembers.filter(member => member.division === division);
    const team1 = divisionMembers.filter(member => member.team_number === 1);
    const team2 = divisionMembers.filter(member => member.team_number === 2);
    return { team1, team2 };
  };

  const getTeamSettings = (division: string) => {
    return teamSettings.find(setting => setting.division === division) || {
      division,
      team1_max_players: 5,
      team2_max_players: 5,
      team1_name: 'Team 1',
      team2_name: 'Team 2'
    };
  };

  const canEditDivision = (division: string) => {
    return role === 'admin' || canManageEvents;
  };

  const addPlayer = async (division: string, teamNumber: number) => {
    if (!newPlayerData.username.trim() || !user) return;

    try {
      const teamSettings = getTeamSettings(division);
      const teamName = teamNumber === 1 ? teamSettings.team1_name : teamSettings.team2_name;

      const { error } = await supabase
        .from('team_members')
        .insert({
          username: newPlayerData.username.trim(),
          division: division,
          team_name: teamName,
          team_number: teamNumber,
          discord: newPlayerData.discord || null,
          twitch: newPlayerData.twitch || null,
          twitter: newPlayerData.twitter || null,
          youtube: newPlayerData.youtube || null,
          instagram: newPlayerData.instagram || null,
          is_captain: newPlayerData.is_captain,
          created_by: user.id
        });

      if (error) throw error;

      setNewPlayerData({
        username: '',
        discord: '',
        twitch: '',
        twitter: '',
        youtube: '',
        instagram: '',
        is_captain: false,
      });
      setIsAddingPlayer(null);
      fetchData();
      
      toast({
        title: "Player added successfully",
        description: `${newPlayerData.username} has been added to ${teamName}.`,
      });
    } catch (error: any) {
      toast({
        title: "Error adding player",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const updatePlayer = async () => {
    if (!editingPlayer || !user) return;

    try {
      const { error } = await supabase
        .from('team_members')
        .update({
          username: editingPlayer.username,
          discord: editingPlayer.discord || null,
          twitch: editingPlayer.twitch || null,
          twitter: editingPlayer.twitter || null,
          youtube: editingPlayer.youtube || null,
          instagram: editingPlayer.instagram || null,
          is_captain: editingPlayer.is_captain,
        })
        .eq('id', editingPlayer.id);

      if (error) throw error;

      setEditingPlayer(null);
      fetchData();
      
      toast({
        title: "Player updated successfully",
        description: `${editingPlayer.username} has been updated.`,
      });
    } catch (error: any) {
      toast({
        title: "Error updating player",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const removePlayer = async (playerId: string, playerName: string) => {
    try {
      const { error } = await supabase
        .from('team_members')
        .delete()
        .eq('id', playerId);

      if (error) throw error;

      fetchData();
      
      toast({
        title: "Player removed successfully",
        description: `${playerName} has been removed from the team.`,
      });
    } catch (error: any) {
      toast({
        title: "Error removing player",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 pt-20 flex items-center justify-center relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute w-96 h-96 bg-gradient-radial from-blue-500/10 to-transparent rounded-full blur-3xl animate-pulse" style={{ animationDuration: '3s' }} />
        <div className="absolute w-96 h-96 bg-gradient-radial from-red-500/10 to-transparent rounded-full blur-3xl animate-pulse" style={{ animationDuration: '4s', animationDelay: '1s' }} />
        
        <div className="text-center relative z-10">
          <div className="w-16 h-16 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-white text-xl font-semibold animate-pulse">Loading Elite Players...</div>
          <div className="text-gray-400 text-sm mt-2">Fetching team rosters</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 pt-20 relative overflow-hidden">
      {/* Animated Background Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-96 h-96 bg-gradient-radial from-blue-500/5 to-transparent rounded-full blur-3xl -top-48 -left-48 animate-pulse" style={{ animationDuration: '4s' }} />
        <div className="absolute w-96 h-96 bg-gradient-radial from-purple-500/5 to-transparent rounded-full blur-3xl top-1/3 -right-48 animate-pulse" style={{ animationDuration: '6s', animationDelay: '2s' }} />
        <div className="absolute w-96 h-96 bg-gradient-radial from-red-500/5 to-transparent rounded-full blur-3xl -bottom-48 left-1/3 animate-pulse" style={{ animationDuration: '5s', animationDelay: '1s' }} />
      </div>

      <div className="container mx-auto px-4 py-12 relative z-10">
        <div className="text-center mb-16">
          <div className="mb-6 inline-block">
            <span className="px-4 py-2 rounded-full text-sm font-semibold bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg animate-fade-in">
              🏆 Elite Roster
            </span>
          </div>
          <h1 className="text-6xl font-black text-white mb-6 animate-fade-in drop-shadow-2xl">
            Our <span className="bg-gradient-to-r from-red-500 to-red-600 bg-clip-text text-transparent">Elite Players</span>
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto animate-fade-in leading-relaxed" style={{ animationDelay: '0.2s' }}>
            Meet the talented players across all our game divisions and competitive teams.
          </p>
        </div>

        {/* Enhanced Division Filter */}
        <div className="mb-12 flex flex-wrap justify-center gap-4">
          <button
            onClick={() => setSelectedDivision('all')}
            className={`group px-8 py-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 ${
              selectedDivision === 'all'
                ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-xl shadow-red-500/25 scale-105'
                : 'bg-gradient-to-r from-gray-800 to-gray-700 text-gray-300 hover:from-gray-700 hover:to-gray-600 border border-gray-600/50'
            }`}
          >
            <span className="relative z-10">All Divisions</span>
            {selectedDivision === 'all' && (
              <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-red-600 opacity-20 blur-xl rounded-xl" />
            )}
          </button>
          {divisions.map((division, index) => {
            const isActive = selectedDivision === division;
            const gameColor = gameColors[division as keyof typeof gameColors];
            
            return (
              <button
                key={division}
                onClick={() => setSelectedDivision(division)}
                className={`group relative px-8 py-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 overflow-hidden ${
                  isActive
                    ? `bg-gradient-to-r ${gameColor} text-white shadow-xl scale-105`
                    : 'bg-gradient-to-r from-gray-800 to-gray-700 text-gray-300 hover:from-gray-700 hover:to-gray-600 border border-gray-600/50'
                }`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <span className="relative z-10">{division}</span>
                {isActive && (
                  <div className={`absolute inset-0 bg-gradient-to-r ${gameColor} opacity-20 blur-xl`} />
                )}
                <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </button>
            );
          })}
        </div>

        {/* Admin/Division Head Management */}
        {user && canManageEvents && (
          <DivisionHeadManager isAdmin={role === 'admin'} />
        )}

        {/* Teams Display */}
        <div className="space-y-12">
          {(selectedDivision === 'all' ? divisions : [selectedDivision]).map((division, divisionIndex) => {
            const { team1, team2 } = getTeamsByDivision(division);
            const settings = getTeamSettings(division);
            
            if (team1.length === 0 && team2.length === 0) return null;

            return (
              <div
                key={division}
                className="animate-fade-in"
                style={{ animationDelay: `${divisionIndex * 0.1}s` }}
              >
                <div className={`bg-gradient-to-r ${gameColors[division as keyof typeof gameColors]} rounded-2xl p-1 mb-8 shadow-2xl transition-all duration-500 hover:shadow-3xl`}>
                  <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-8 relative overflow-hidden">
                    {/* Background Glow */}
                    <div className={`absolute inset-0 bg-gradient-to-r ${gameColors[division as keyof typeof gameColors]} opacity-5 blur-2xl`} />
                    
                    <div className="relative z-10">
                      <h2 className="text-4xl font-black text-white mb-8 text-center flex items-center justify-center group">
                        <div className="relative mr-4">
                          <Shield size={36} className="text-white transition-transform duration-300 group-hover:scale-110" />
                          <div className={`absolute inset-0 bg-gradient-to-r ${gameColors[division as keyof typeof gameColors]} opacity-30 blur-lg animate-pulse`} />
                        </div>
                        <span className={`group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:${gameColors[division as keyof typeof gameColors]} group-hover:bg-clip-text transition-all duration-300`}>
                          {division}
                        </span>
                      </h2>

                      {/* Team Name Editor for Division Heads and Admins */}
                      {user && canManageEvents && (
                        <TeamNameEditor 
                          division={division} 
                          canEdit={true}
                        />
                      )}

                      <div className="grid md:grid-cols-2 gap-8">
                        {/* Team 1 */}
                        <div className="group bg-gradient-to-br from-gray-800/60 to-gray-700/40 rounded-2xl p-6 border border-gray-600/30 hover:border-gray-500/50 transition-all duration-300 hover:scale-[1.02] relative overflow-hidden">
                          {/* Team Background Glow */}
                          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400/10 to-transparent rounded-full blur-3xl" />
                          
                          <div className="relative z-10">
                            <div className="flex items-center justify-between mb-6">
                              <h3 className="text-2xl font-bold text-white flex items-center group-hover:text-blue-300 transition-colors duration-300">
                                <div className="relative mr-3">
                                  <Users size={24} className="transition-transform duration-300 group-hover:scale-110" />
                                  <div className="absolute inset-0 bg-blue-400 blur-lg opacity-0 group-hover:opacity-30 transition-opacity duration-300" />
                                </div>
                                {settings.team1_name}
                              </h3>
                              <div className="flex flex-col items-end">
                                <span className="text-gray-300 text-sm font-medium mb-1">
                                  {team1.length}/{settings.team1_max_players} players
                                </span>
                                <div className="w-20 h-3 bg-gray-700 rounded-full overflow-hidden">
                                  <div 
                                    className={`h-full bg-gradient-to-r ${gameColors[division as keyof typeof gameColors]} transition-all duration-500`}
                                    style={{ width: `${(team1.length / settings.team1_max_players) * 100}%` }}
                                  />
                                </div>
                              </div>
                            </div>
                            
                            <div className="space-y-4">
                              {team1.map((member, index) => (
                                <div
                                  key={member.id}
                                  className="bg-gradient-to-r from-gray-700/60 to-gray-600/40 rounded-xl p-5 hover:from-gray-600/60 hover:to-gray-500/40 transition-all duration-300 hover:scale-105 group/member border border-gray-600/30"
                                  style={{ animationDelay: `${index * 0.05}s` }}
                                >
                                  <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center">
                                      {member.is_captain && (
                                        <div className="relative mr-3">
                                          <Crown className="text-yellow-400 animate-pulse" size={18} />
                                          <div className="absolute inset-0 bg-yellow-400 blur-md opacity-30" />
                                        </div>
                                      )}
                                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold mr-3 group-hover/member:scale-110 transition-transform duration-300">
                                        {member.username.charAt(0).toUpperCase()}
                                      </div>
                                      <div>
                                        <span className="text-white font-semibold text-lg group-hover/member:text-blue-300 transition-colors duration-300">
                                          {member.username}
                                        </span>
                                        {member.is_captain && (
                                          <span className="block text-yellow-400 text-xs font-medium">Team Captain</span>
                                        )}
                                      </div>
                                    </div>
                                    {canEditDivision(division) && (
                                      <div className="flex gap-2">
                                        <Dialog>
                                          <DialogTrigger asChild>
                                            <Button
                                              variant="ghost"
                                              size="sm"
                                              onClick={() => setEditingPlayer(member)}
                                              className="text-blue-400 hover:text-blue-300 hover:bg-blue-900/30 opacity-0 group-hover/member:opacity-100 transition-all duration-300"
                                            >
                                              <Edit size={14} />
                                            </Button>
                                          </DialogTrigger>
                                          <DialogContent className="bg-gray-900 border-gray-700">
                                            <DialogHeader>
                                              <DialogTitle className="text-white">Edit Player</DialogTitle>
                                            </DialogHeader>
                                            <div className="space-y-4">
                                              <div>
                                                <Label htmlFor="edit-username" className="text-white">Username</Label>
                                                <Input
                                                  id="edit-username"
                                                  value={editingPlayer?.username || ''}
                                                  onChange={(e) => setEditingPlayer(prev => prev ? {...prev, username: e.target.value} : null)}
                                                  className="bg-gray-800 border-gray-600 text-white"
                                                />
                                              </div>
                                              <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                  <Label htmlFor="edit-discord" className="text-white">Discord</Label>
                                                  <Input
                                                    id="edit-discord"
                                                    value={editingPlayer?.discord || ''}
                                                    onChange={(e) => setEditingPlayer(prev => prev ? {...prev, discord: e.target.value} : null)}
                                                    className="bg-gray-800 border-gray-600 text-white"
                                                    placeholder="Discord username"
                                                  />
                                                </div>
                                                <div>
                                                  <Label htmlFor="edit-twitch" className="text-white">Twitch</Label>
                                                  <Input
                                                    id="edit-twitch"
                                                    value={editingPlayer?.twitch || ''}
                                                    onChange={(e) => setEditingPlayer(prev => prev ? {...prev, twitch: e.target.value} : null)}
                                                    className="bg-gray-800 border-gray-600 text-white"
                                                    placeholder="Twitch username"
                                                  />
                                                </div>
                                                <div>
                                                  <Label htmlFor="edit-twitter" className="text-white">Twitter</Label>
                                                  <Input
                                                    id="edit-twitter"
                                                    value={editingPlayer?.twitter || ''}
                                                    onChange={(e) => setEditingPlayer(prev => prev ? {...prev, twitter: e.target.value} : null)}
                                                    className="bg-gray-800 border-gray-600 text-white"
                                                    placeholder="Twitter handle"
                                                  />
                                                </div>
                                                <div>
                                                  <Label htmlFor="edit-youtube" className="text-white">YouTube</Label>
                                                  <Input
                                                    id="edit-youtube"
                                                    value={editingPlayer?.youtube || ''}
                                                    onChange={(e) => setEditingPlayer(prev => prev ? {...prev, youtube: e.target.value} : null)}
                                                    className="bg-gray-800 border-gray-600 text-white"
                                                    placeholder="YouTube channel"
                                                  />
                                                </div>
                                                <div>
                                                  <Label htmlFor="edit-instagram" className="text-white">Instagram</Label>
                                                  <Input
                                                    id="edit-instagram"
                                                    value={editingPlayer?.instagram || ''}
                                                    onChange={(e) => setEditingPlayer(prev => prev ? {...prev, instagram: e.target.value} : null)}
                                                    className="bg-gray-800 border-gray-600 text-white"
                                                    placeholder="Instagram handle"
                                                  />
                                                </div>
                                              </div>
                                              <div className="flex items-center space-x-2">
                                                <Switch
                                                  id="edit-captain"
                                                  checked={editingPlayer?.is_captain || false}
                                                  onCheckedChange={(checked) => setEditingPlayer(prev => prev ? {...prev, is_captain: checked} : null)}
                                                />
                                                <Label htmlFor="edit-captain" className="text-white">Team Captain</Label>
                                              </div>
                                              <div className="flex gap-2">
                                                <Button onClick={updatePlayer} className="bg-green-600 hover:bg-green-700">
                                                  <Save size={16} className="mr-2" />
                                                  Save Changes
                                                </Button>
                                                <Button
                                                  variant="outline"
                                                  onClick={() => setEditingPlayer(null)}
                                                  className="border-gray-600 text-gray-300"
                                                >
                                                  Cancel
                                                </Button>
                                              </div>
                                            </div>
                                          </DialogContent>
                                        </Dialog>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => removePlayer(member.id, member.username)}
                                          className="text-red-400 hover:text-red-300 hover:bg-red-900/30 opacity-0 group-hover/member:opacity-100 transition-all duration-300"
                                        >
                                          <Trash2 size={14} />
                                        </Button>
                                      </div>
                                    )}
                                  </div>
                                  
                                  <div className="flex flex-wrap gap-2 text-xs">
                                    {member.discord && (
                                      <span className="bg-indigo-600/30 text-indigo-300 px-3 py-1 rounded-full border border-indigo-500/30 hover:bg-indigo-600/40 transition-colors duration-200">
                                        Discord
                                      </span>
                                    )}
                                    {member.twitch && (
                                      <span className="bg-purple-600/30 text-purple-300 px-3 py-1 rounded-full border border-purple-500/30 hover:bg-purple-600/40 transition-colors duration-200">
                                        Twitch
                                      </span>
                                    )}
                                    {member.twitter && (
                                      <span className="bg-blue-600/30 text-blue-300 px-3 py-1 rounded-full border border-blue-500/30 hover:bg-blue-600/40 transition-colors duration-200">
                                        Twitter
                                      </span>
                                    )}
                                    {member.youtube && (
                                      <span className="bg-red-600/30 text-red-300 px-3 py-1 rounded-full border border-red-500/30 hover:bg-red-600/40 transition-colors duration-200">
                                        YouTube
                                      </span>
                                    )}
                                    {member.instagram && (
                                      <span className="bg-pink-600/30 text-pink-300 px-3 py-1 rounded-full border border-pink-500/30 hover:bg-pink-600/40 transition-colors duration-200">
                                        Instagram
                                      </span>
                                    )}
                                  </div>
                                </div>
                              ))}
                              
                              {team1.length === 0 && (
                                <div className="text-center py-16 text-gray-500">
                                  <div className="relative">
                                    <Users size={80} className="mx-auto mb-6 opacity-20" />
                                    <div className="absolute inset-0 flex items-center justify-center">
                                      <div className="w-20 h-20 border-2 border-gray-600 border-dashed rounded-full animate-pulse" />
                                    </div>
                                  </div>
                                  <p className="text-lg font-semibold mb-2">No players assigned yet</p>
                                  <p className="text-sm text-gray-600">Waiting for elite players to join {settings.team1_name}</p>
                                </div>
                              )}
                            </div>

                            {/* Add Player Button for Team 1 */}
                            {canEditDivision(division) && (
                              <div className="mt-6 pt-6 border-t border-gray-600/30">
                                <Dialog open={isAddingPlayer?.division === division && isAddingPlayer?.team === 1} onOpenChange={(open) => !open && setIsAddingPlayer(null)}>
                                  <DialogTrigger asChild>
                                    <Button
                                      onClick={() => setIsAddingPlayer({division, team: 1})}
                                      variant="outline"
                                      className="w-full border-gray-600/50 text-gray-300 hover:bg-gray-800/50 hover:text-white transition-all duration-300"
                                    >
                                      <Plus size={16} className="mr-2" />
                                      Add Player to {settings.team1_name}
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent className="bg-gray-900 border-gray-700">
                                    <DialogHeader>
                                      <DialogTitle className="text-white">Add Player to {settings.team1_name}</DialogTitle>
                                    </DialogHeader>
                                    <div className="space-y-4">
                                      <div>
                                        <Label htmlFor="username" className="text-white">Username *</Label>
                                        <Input
                                          id="username"
                                          value={newPlayerData.username}
                                          onChange={(e) => setNewPlayerData(prev => ({...prev, username: e.target.value}))}
                                          className="bg-gray-800 border-gray-600 text-white"
                                          placeholder="Enter username"
                                        />
                                      </div>
                                      <div className="grid grid-cols-2 gap-4">
                                        <div>
                                          <Label htmlFor="discord" className="text-white">Discord</Label>
                                          <Input
                                            id="discord"
                                            value={newPlayerData.discord}
                                            onChange={(e) => setNewPlayerData(prev => ({...prev, discord: e.target.value}))}
                                            className="bg-gray-800 border-gray-600 text-white"
                                            placeholder="Discord username"
                                          />
                                        </div>
                                        <div>
                                          <Label htmlFor="twitch" className="text-white">Twitch</Label>
                                          <Input
                                            id="twitch"
                                            value={newPlayerData.twitch}
                                            onChange={(e) => setNewPlayerData(prev => ({...prev, twitch: e.target.value}))}
                                            className="bg-gray-800 border-gray-600 text-white"
                                            placeholder="Twitch username"
                                          />
                                        </div>
                                        <div>
                                          <Label htmlFor="twitter" className="text-white">Twitter</Label>
                                          <Input
                                            id="twitter"
                                            value={newPlayerData.twitter}
                                            onChange={(e) => setNewPlayerData(prev => ({...prev, twitter: e.target.value}))}
                                            className="bg-gray-800 border-gray-600 text-white"
                                            placeholder="Twitter handle"
                                          />
                                        </div>
                                        <div>
                                          <Label htmlFor="youtube" className="text-white">YouTube</Label>
                                          <Input
                                            id="youtube"
                                            value={newPlayerData.youtube}
                                            onChange={(e) => setNewPlayerData(prev => ({...prev, youtube: e.target.value}))}
                                            className="bg-gray-800 border-gray-600 text-white"
                                            placeholder="YouTube channel"
                                          />
                                        </div>
                                        <div>
                                          <Label htmlFor="instagram" className="text-white">Instagram</Label>
                                          <Input
                                            id="instagram"
                                            value={newPlayerData.instagram}
                                            onChange={(e) => setNewPlayerData(prev => ({...prev, instagram: e.target.value}))}
                                            className="bg-gray-800 border-gray-600 text-white"
                                            placeholder="Instagram handle"
                                          />
                                        </div>
                                      </div>
                                      <div className="flex items-center space-x-2">
                                        <Switch
                                          id="captain"
                                          checked={newPlayerData.is_captain}
                                          onCheckedChange={(checked) => setNewPlayerData(prev => ({...prev, is_captain: checked}))}
                                        />
                                        <Label htmlFor="captain" className="text-white">Team Captain</Label>
                                      </div>
                                      <div className="flex gap-2">
                                        <Button
                                          onClick={() => addPlayer(division, 1)}
                                          disabled={!newPlayerData.username.trim()}
                                          className="bg-green-600 hover:bg-green-700"
                                        >
                                          <Save size={16} className="mr-2" />
                                          Add Player
                                        </Button>
                                        <Button
                                          variant="outline"
                                          onClick={() => setIsAddingPlayer(null)}
                                          className="border-gray-600 text-gray-300"
                                        >
                                          Cancel
                                        </Button>
                                      </div>
                                    </div>
                                  </DialogContent>
                                </Dialog>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Team 2 */}
                        <div className="group bg-gradient-to-br from-gray-800/60 to-gray-700/40 rounded-2xl p-6 border border-gray-600/30 hover:border-gray-500/50 transition-all duration-300 hover:scale-[1.02] relative overflow-hidden">
                          {/* Team Background Glow */}
                          <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-purple-400/10 to-transparent rounded-full blur-3xl" />
                          
                          <div className="relative z-10">
                            <div className="flex items-center justify-between mb-6">
                              <h3 className="text-2xl font-bold text-white flex items-center group-hover:text-purple-300 transition-colors duration-300">
                                <div className="relative mr-3">
                                  <Users size={24} className="transition-transform duration-300 group-hover:scale-110" />
                                  <div className="absolute inset-0 bg-purple-400 blur-lg opacity-0 group-hover:opacity-30 transition-opacity duration-300" />
                                </div>
                                {settings.team2_name}
                              </h3>
                              <div className="flex flex-col items-end">
                                <span className="text-gray-300 text-sm font-medium mb-1">
                                  {team2.length}/{settings.team2_max_players} players
                                </span>
                                <div className="w-20 h-3 bg-gray-700 rounded-full overflow-hidden">
                                  <div 
                                    className={`h-full bg-gradient-to-r ${gameColors[division as keyof typeof gameColors]} transition-all duration-500`}
                                    style={{ width: `${(team2.length / settings.team2_max_players) * 100}%` }}
                                  />
                                </div>
                              </div>
                            </div>
                            
                            <div className="space-y-4">
                              {team2.map((member, index) => (
                                <div
                                  key={member.id}
                                  className="bg-gradient-to-r from-gray-700/60 to-gray-600/40 rounded-xl p-5 hover:from-gray-600/60 hover:to-gray-500/40 transition-all duration-300 hover:scale-105 group/member border border-gray-600/30"
                                  style={{ animationDelay: `${index * 0.05}s` }}
                                >
                                  <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center">
                                      {member.is_captain && (
                                        <div className="relative mr-3">
                                          <Crown className="text-yellow-400 animate-pulse" size={18} />
                                          <div className="absolute inset-0 bg-yellow-400 blur-md opacity-30" />
                                        </div>
                                      )}
                                      <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-red-600 rounded-full flex items-center justify-center text-white text-sm font-bold mr-3 group-hover/member:scale-110 transition-transform duration-300">
                                        {member.username.charAt(0).toUpperCase()}
                                      </div>
                                      <div>
                                        <span className="text-white font-semibold text-lg group-hover/member:text-purple-300 transition-colors duration-300">
                                          {member.username}
                                        </span>
                                        {member.is_captain && (
                                          <span className="block text-yellow-400 text-xs font-medium">Team Captain</span>
                                        )}
                                      </div>
                                    </div>
                                    {canEditDivision(division) && (
                                      <div className="flex gap-2">
                                        <Dialog>
                                          <DialogTrigger asChild>
                                            <Button
                                              variant="ghost"
                                              size="sm"
                                              onClick={() => setEditingPlayer(member)}
                                              className="text-blue-400 hover:text-blue-300 hover:bg-blue-900/30 opacity-0 group-hover/member:opacity-100 transition-all duration-300"
                                            >
                                              <Edit size={14} />
                                            </Button>
                                          </DialogTrigger>
                                          <DialogContent className="bg-gray-900 border-gray-700">
                                            <DialogHeader>
                                              <DialogTitle className="text-white">Edit Player</DialogTitle>
                                            </DialogHeader>
                                            <div className="space-y-4">
                                              <div>
                                                <Label htmlFor="edit-username-2" className="text-white">Username</Label>
                                                <Input
                                                  id="edit-username-2"
                                                  value={editingPlayer?.username || ''}
                                                  onChange={(e) => setEditingPlayer(prev => prev ? {...prev, username: e.target.value} : null)}
                                                  className="bg-gray-800 border-gray-600 text-white"
                                                />
                                              </div>
                                              <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                  <Label htmlFor="edit-discord-2" className="text-white">Discord</Label>
                                                  <Input
                                                    id="edit-discord-2"
                                                    value={editingPlayer?.discord || ''}
                                                    onChange={(e) => setEditingPlayer(prev => prev ? {...prev, discord: e.target.value} : null)}
                                                    className="bg-gray-800 border-gray-600 text-white"
                                                    placeholder="Discord username"
                                                  />
                                                </div>
                                                <div>
                                                  <Label htmlFor="edit-twitch-2" className="text-white">Twitch</Label>
                                                  <Input
                                                    id="edit-twitch-2"
                                                    value={editingPlayer?.twitch || ''}
                                                    onChange={(e) => setEditingPlayer(prev => prev ? {...prev, twitch: e.target.value} : null)}
                                                    className="bg-gray-800 border-gray-600 text-white"
                                                    placeholder="Twitch username"
                                                  />
                                                </div>
                                                <div>
                                                  <Label htmlFor="edit-twitter-2" className="text-white">Twitter</Label>
                                                  <Input
                                                    id="edit-twitter-2"
                                                    value={editingPlayer?.twitter || ''}
                                                    onChange={(e) => setEditingPlayer(prev => prev ? {...prev, twitter: e.target.value} : null)}
                                                    className="bg-gray-800 border-gray-600 text-white"
                                                    placeholder="Twitter handle"
                                                  />
                                                </div>
                                                <div>
                                                  <Label htmlFor="edit-youtube-2" className="text-white">YouTube</Label>
                                                  <Input
                                                    id="edit-youtube-2"
                                                    value={editingPlayer?.youtube || ''}
                                                    onChange={(e) => setEditingPlayer(prev => prev ? {...prev, youtube: e.target.value} : null)}
                                                    className="bg-gray-800 border-gray-600 text-white"
                                                    placeholder="YouTube channel"
                                                  />
                                                </div>
                                                <div>
                                                  <Label htmlFor="edit-instagram-2" className="text-white">Instagram</Label>
                                                  <Input
                                                    id="edit-instagram-2"
                                                    value={editingPlayer?.instagram || ''}
                                                    onChange={(e) => setEditingPlayer(prev => prev ? {...prev, instagram: e.target.value} : null)}
                                                    className="bg-gray-800 border-gray-600 text-white"
                                                    placeholder="Instagram handle"
                                                  />
                                                </div>
                                              </div>
                                              <div className="flex items-center space-x-2">
                                                <Switch
                                                  id="edit-captain-2"
                                                  checked={editingPlayer?.is_captain || false}
                                                  onCheckedChange={(checked) => setEditingPlayer(prev => prev ? {...prev, is_captain: checked} : null)}
                                                />
                                                <Label htmlFor="edit-captain-2" className="text-white">Team Captain</Label>
                                              </div>
                                              <div className="flex gap-2">
                                                <Button onClick={updatePlayer} className="bg-green-600 hover:bg-green-700">
                                                  <Save size={16} className="mr-2" />
                                                  Save Changes
                                                </Button>
                                                <Button
                                                  variant="outline"
                                                  onClick={() => setEditingPlayer(null)}
                                                  className="border-gray-600 text-gray-300"
                                                >
                                                  Cancel
                                                </Button>
                                              </div>
                                            </div>
                                          </DialogContent>
                                        </Dialog>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => removePlayer(member.id, member.username)}
                                          className="text-red-400 hover:text-red-300 hover:bg-red-900/30 opacity-0 group-hover/member:opacity-100 transition-all duration-300"
                                        >
                                          <Trash2 size={14} />
                                        </Button>
                                      </div>
                                    )}
                                  </div>
                                  
                                  <div className="flex flex-wrap gap-2 text-xs">
                                    {member.discord && (
                                      <span className="bg-indigo-600/30 text-indigo-300 px-3 py-1 rounded-full border border-indigo-500/30 hover:bg-indigo-600/40 transition-colors duration-200">
                                        Discord
                                      </span>
                                    )}
                                    {member.twitch && (
                                      <span className="bg-purple-600/30 text-purple-300 px-3 py-1 rounded-full border border-purple-500/30 hover:bg-purple-600/40 transition-colors duration-200">
                                        Twitch
                                      </span>
                                    )}
                                    {member.twitter && (
                                      <span className="bg-blue-600/30 text-blue-300 px-3 py-1 rounded-full border border-blue-500/30 hover:bg-blue-600/40 transition-colors duration-200">
                                        Twitter
                                      </span>
                                    )}
                                    {member.youtube && (
                                      <span className="bg-red-600/30 text-red-300 px-3 py-1 rounded-full border border-red-500/30 hover:bg-red-600/40 transition-colors duration-200">
                                        YouTube
                                      </span>
                                    )}
                                    {member.instagram && (
                                      <span className="bg-pink-600/30 text-pink-300 px-3 py-1 rounded-full border border-pink-500/30 hover:bg-pink-600/40 transition-colors duration-200">
                                        Instagram
                                      </span>
                                    )}
                                  </div>
                                </div>
                              ))}
                              
                              {team2.length === 0 && (
                                <div className="text-center py-16 text-gray-500">
                                  <div className="relative">
                                    <Users size={80} className="mx-auto mb-6 opacity-20" />
                                    <div className="absolute inset-0 flex items-center justify-center">
                                      <div className="w-20 h-20 border-2 border-gray-600 border-dashed rounded-full animate-pulse" />
                                    </div>
                                  </div>
                                  <p className="text-lg font-semibold mb-2">No players assigned yet</p>
                                  <p className="text-sm text-gray-600">Waiting for elite players to join {settings.team2_name}</p>
                                </div>
                              )}
                            </div>

                            {/* Add Player Button for Team 2 */}
                            {canEditDivision(division) && (
                              <div className="mt-6 pt-6 border-t border-gray-600/30">
                                <Dialog open={isAddingPlayer?.division === division && isAddingPlayer?.team === 2} onOpenChange={(open) => !open && setIsAddingPlayer(null)}>
                                  <DialogTrigger asChild>
                                    <Button
                                      onClick={() => setIsAddingPlayer({division, team: 2})}
                                      variant="outline"
                                      className="w-full border-gray-600/50 text-gray-300 hover:bg-gray-800/50 hover:text-white transition-all duration-300"
                                    >
                                      <Plus size={16} className="mr-2" />
                                      Add Player to {settings.team2_name}
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent className="bg-gray-900 border-gray-700">
                                    <DialogHeader>
                                      <DialogTitle className="text-white">Add Player to {settings.team2_name}</DialogTitle>
                                    </DialogHeader>
                                    <div className="space-y-4">
                                      <div>
                                        <Label htmlFor="username-2" className="text-white">Username *</Label>
                                        <Input
                                          id="username-2"
                                          value={newPlayerData.username}
                                          onChange={(e) => setNewPlayerData(prev => ({...prev, username: e.target.value}))}
                                          className="bg-gray-800 border-gray-600 text-white"
                                          placeholder="Enter username"
                                        />
                                      </div>
                                      <div className="grid grid-cols-2 gap-4">
                                        <div>
                                          <Label htmlFor="discord-2" className="text-white">Discord</Label>
                                          <Input
                                            id="discord-2"
                                            value={newPlayerData.discord}
                                            onChange={(e) => setNewPlayerData(prev => ({...prev, discord: e.target.value}))}
                                            className="bg-gray-800 border-gray-600 text-white"
                                            placeholder="Discord username"
                                          />
                                        </div>
                                        <div>
                                          <Label htmlFor="twitch-2" className="text-white">Twitch</Label>
                                          <Input
                                            id="twitch-2"
                                            value={newPlayerData.twitch}
                                            onChange={(e) => setNewPlayerData(prev => ({...prev, twitch: e.target.value}))}
                                            className="bg-gray-800 border-gray-600 text-white"
                                            placeholder="Twitch username"
                                          />
                                        </div>
                                        <div>
                                          <Label htmlFor="twitter-2" className="text-white">Twitter</Label>
                                          <Input
                                            id="twitter-2"
                                            value={newPlayerData.twitter}
                                            onChange={(e) => setNewPlayerData(prev => ({...prev, twitter: e.target.value}))}
                                            className="bg-gray-800 border-gray-600 text-white"
                                            placeholder="Twitter handle"
                                          />
                                        </div>
                                        <div>
                                          <Label htmlFor="youtube-2" className="text-white">YouTube</Label>
                                          <Input
                                            id="youtube-2"
                                            value={newPlayerData.youtube}
                                            onChange={(e) => setNewPlayerData(prev => ({...prev, youtube: e.target.value}))}
                                            className="bg-gray-800 border-gray-600 text-white"
                                            placeholder="YouTube channel"
                                          />
                                        </div>
                                        <div>
                                          <Label htmlFor="instagram-2" className="text-white">Instagram</Label>
                                          <Input
                                            id="instagram-2"
                                            value={newPlayerData.instagram}
                                            onChange={(e) => setNewPlayerData(prev => ({...prev, instagram: e.target.value}))}
                                            className="bg-gray-800 border-gray-600 text-white"
                                            placeholder="Instagram handle"
                                          />
                                        </div>
                                      </div>
                                      <div className="flex items-center space-x-2">
                                        <Switch
                                          id="captain-2"
                                          checked={newPlayerData.is_captain}
                                          onCheckedChange={(checked) => setNewPlayerData(prev => ({...prev, is_captain: checked}))}
                                        />
                                        <Label htmlFor="captain-2" className="text-white">Team Captain</Label>
                                      </div>
                                      <div className="flex gap-2">
                                        <Button
                                          onClick={() => addPlayer(division, 2)}
                                          disabled={!newPlayerData.username.trim()}
                                          className="bg-green-600 hover:bg-green-700"
                                        >
                                          <Save size={16} className="mr-2" />
                                          Add Player
                                        </Button>
                                        <Button
                                          variant="outline"
                                          onClick={() => setIsAddingPlayer(null)}
                                          className="border-gray-600 text-gray-300"
                                        >
                                          Cancel
                                        </Button>
                                      </div>
                                    </div>
                                  </DialogContent>
                                </Dialog>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {getFilteredMembers().length === 0 && selectedDivision !== 'all' && (
          <div className="text-center text-gray-400 py-20">
            <div className="relative">
              <Users size={96} className="mx-auto mb-6 opacity-20" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-24 h-24 border-2 border-gray-600 border-dashed rounded-full animate-pulse" />
              </div>
            </div>
            <h3 className="text-2xl font-bold mb-4">No Players in {selectedDivision}</h3>
            <p className="text-lg mb-2">This division doesn't have any players yet.</p>
            <p className="text-gray-500">Check back later or contact division heads to add players.</p>
          </div>
        )}

        {teamMembers.length === 0 && selectedDivision === 'all' && (
          <div className="text-center text-gray-400 py-20">
            <div className="relative">
              <Users size={96} className="mx-auto mb-6 opacity-20" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-24 h-24 border-2 border-gray-600 border-dashed rounded-full animate-pulse" />
              </div>
            </div>
            <h3 className="text-2xl font-bold mb-4">No Players Yet</h3>
            <p className="text-lg mb-2">Team members will appear here once they're added.</p>
            <p className="text-gray-500">Division heads can add players from their respective game pages.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Players;