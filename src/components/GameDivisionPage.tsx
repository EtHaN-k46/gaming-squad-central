
import React, { useState, useEffect } from 'react';
import { Crown, Users, Edit2, Save, X, Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface TeamMember {
  id: string;
  username: string;
  team_number: number;
  is_captain: boolean;
}

interface DivisionHead {
  id: string;
  display_name: string;
  user_id: string;
}

interface TeamSettings {
  team1_name: string;
  team2_name: string;
  team1_max_players: number;
  team2_max_players: number;
}

interface GameDivisionPageProps {
  gameName: string;
  gameImage: string;
  gameDescription: string;
  gameColor: string;
}

const GameDivisionPage: React.FC<GameDivisionPageProps> = ({
  gameName,
  gameImage,
  gameDescription,
  gameColor
}) => {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [divisionHead, setDivisionHead] = useState<DivisionHead | null>(null);
  const [teamSettings, setTeamSettings] = useState<TeamSettings>({
    team1_name: 'Team 1',
    team2_name: 'Team 2',
    team1_max_players: 5,
    team2_max_players: 5
  });
  const [editingTeam, setEditingTeam] = useState<number | null>(null);
  const [newPlayerName, setNewPlayerName] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
    checkUserRole();
  }, [user, gameName]);

  const fetchData = async () => {
    try {
      // Fetch team members
      const { data: membersData } = await supabase
        .from('team_members')
        .select('*')
        .eq('division', gameName);

      if (membersData) {
        setTeamMembers(membersData);
      }

      // Fetch division head
      const { data: headData } = await supabase
        .from('division_heads')
        .select('*')
        .eq('division', gameName)
        .single();

      if (headData) {
        setDivisionHead(headData);
      }

      // Fetch team settings
      const { data: settingsData } = await supabase
        .from('team_settings')
        .select('*')
        .eq('division', gameName)
        .single();

      if (settingsData) {
        setTeamSettings({
          team1_name: settingsData.team1_name || 'Team 1',
          team2_name: settingsData.team2_name || 'Team 2',
          team1_max_players: settingsData.team1_max_players || 5,
          team2_max_players: settingsData.team2_max_players || 5
        });
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const checkUserRole = async () => {
    if (!user) {
      setIsAdmin(false);
      return;
    }

    try {
      const { data } = await supabase
        .from('user_roles')
        .select('role, division')
        .eq('user_id', user.id);

      const hasAdminRole = data?.some(role => role.role === 'admin');
      const hasDivisionHeadRole = data?.some(role => 
        role.role === 'division_head' && role.division === gameName
      );

      setIsAdmin(hasAdminRole || hasDivisionHeadRole);
    } catch (error) {
      console.error('Error checking user role:', error);
      setIsAdmin(false);
    }
  };

  const addPlayer = async (teamNumber: number) => {
    if (!newPlayerName.trim() || !user) return;

    try {
      const { error } = await supabase
        .from('team_members')
        .insert({
          username: newPlayerName.trim(),
          division: gameName,
          team_name: teamNumber === 1 ? teamSettings.team1_name : teamSettings.team2_name,
          team_number: teamNumber,
          created_by: user.id
        });

      if (error) throw error;

      setNewPlayerName('');
      setEditingTeam(null);
      fetchData();
      
      toast({
        title: "Player added successfully",
        description: `${newPlayerName} has been added to the team.`,
      });
    } catch (error: any) {
      toast({
        title: "Error adding player",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const removePlayer = async (playerId: string) => {
    try {
      const { error } = await supabase
        .from('team_members')
        .delete()
        .eq('id', playerId);

      if (error) throw error;

      fetchData();
      
      toast({
        title: "Player removed successfully",
        description: "The player has been removed from the team.",
      });
    } catch (error: any) {
      toast({
        title: "Error removing player",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const team1Members = teamMembers.filter(member => member.team_number === 1);
  const team2Members = teamMembers.filter(member => member.team_number === 2);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 pt-20 relative overflow-hidden">
      {/* Animated Background Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-96 h-96 bg-gradient-radial from-blue-500/10 to-transparent rounded-full blur-3xl -top-48 -left-48 animate-pulse" style={{ animationDuration: '4s' }} />
        <div className="absolute w-96 h-96 bg-gradient-radial from-purple-500/10 to-transparent rounded-full blur-3xl top-1/2 -right-48 animate-pulse" style={{ animationDuration: '6s', animationDelay: '2s' }} />
        <div className="absolute w-96 h-96 bg-gradient-radial from-red-500/10 to-transparent rounded-full blur-3xl -bottom-48 left-1/2 animate-pulse" style={{ animationDuration: '5s', animationDelay: '1s' }} />
      </div>
      
      {/* Hero Section */}
      <div className="relative h-96 overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center transform scale-105 transition-transform duration-700"
          style={{ backgroundImage: `url(${gameImage})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-black/90" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
        
        {/* Floating Glow Effect */}
        <div className={`absolute inset-0 bg-gradient-to-r ${gameColor} opacity-20 blur-3xl animate-pulse`} style={{ animationDuration: '3s' }} />
        
        <div className="relative container mx-auto px-4 h-full flex items-center z-10">
          <div className="max-w-3xl">
            <div className="mb-4 inline-block">
              <span className={`px-4 py-2 rounded-full text-sm font-semibold bg-gradient-to-r ${gameColor} text-white shadow-lg animate-fade-in`}>
                🎮 Professional Division
              </span>
            </div>
            <h1 className="text-7xl font-black text-white mb-6 animate-fade-in drop-shadow-2xl">
              {gameName} 
              <span className={`block text-5xl bg-gradient-to-r ${gameColor} bg-clip-text text-transparent animate-fade-in`} style={{ animationDelay: '0.2s' }}>
                Elite Division
              </span>
            </h1>
            <p className="text-xl text-gray-300 animate-fade-in leading-relaxed max-w-2xl" style={{ animationDelay: '0.4s' }}>
              {gameDescription}
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16 relative z-10">
        {/* Division Head Card */}
        {divisionHead && (
          <div className="mb-16">
            <div className="max-w-lg mx-auto group cursor-pointer">
              <div className={`bg-gradient-to-r ${gameColor} rounded-2xl p-1 shadow-2xl transition-all duration-500 hover:shadow-xl hover:scale-105 animate-scale-in`}>
                <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-8 relative overflow-hidden">
                  {/* Background Glow */}
                  <div className={`absolute inset-0 bg-gradient-to-r ${gameColor} opacity-10 blur-xl`} />
                  
                  <div className="relative z-10">
                    <div className="flex items-center justify-center mb-6">
                      <div className="relative">
                        <Crown className="text-yellow-400 mr-3 animate-pulse drop-shadow-lg" size={28} />
                        <div className="absolute inset-0 bg-yellow-400 blur-lg opacity-30 animate-pulse" />
                      </div>
                      <h3 className="text-2xl font-bold text-white tracking-wide">Division Head</h3>
                    </div>
                    
                    <div className="text-center space-y-2">
                      <h4 className="text-xl font-bold text-white group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:bg-clip-text group-hover:from-yellow-400 group-hover:to-orange-500 transition-all duration-300">
                        {divisionHead.display_name}
                      </h4>
                      <p className="text-gray-400 text-sm tracking-wider">
                        Leading the {gameName} Division
                      </p>
                      <div className="flex justify-center mt-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r ${gameColor} text-white opacity-80`}>
                          🏆 Elite Leader
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Teams Section */}
        <div className="space-y-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">Team Roster</h2>
            <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto rounded-full" />
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
            {/* Team 1 */}
            <div className="group">
              <div className={`bg-gradient-to-r ${gameColor} rounded-2xl p-1 shadow-2xl transition-all duration-500 hover:shadow-3xl hover:scale-[1.02] animate-slide-in-right`}>
                <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-8 h-full relative overflow-hidden">
                  {/* Background Pattern */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/5 to-transparent rounded-full blur-3xl" />
                  
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-8">
                      <div className="flex items-center space-x-3">
                        <div className="relative">
                          <Users className="text-white" size={24} />
                          <div className="absolute inset-0 bg-blue-400 blur-lg opacity-30" />
                        </div>
                        <h3 className="text-2xl font-bold text-white tracking-wide">{teamSettings.team1_name}</h3>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-gray-400 text-sm font-medium">
                          {team1Members.length}/{teamSettings.team1_max_players} Players
                        </span>
                        <div className="w-16 h-2 bg-gray-700 rounded-full mt-1 overflow-hidden">
                          <div 
                            className={`h-full bg-gradient-to-r ${gameColor} transition-all duration-500`}
                            style={{ width: `${(team1Members.length / teamSettings.team1_max_players) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4 mb-6">
                      {team1Members.map((member, index) => (
                        <div key={member.id} className="flex items-center justify-between bg-gradient-to-r from-gray-800/60 to-gray-700/40 rounded-xl p-4 group hover:from-gray-700/60 hover:to-gray-600/40 transition-all duration-300" style={{ animationDelay: `${index * 0.1}s` }}>
                          <div className="flex items-center space-x-3">
                            {member.is_captain && (
                              <div className="relative">
                                <Crown className="text-yellow-400 animate-pulse" size={18} />
                                <div className="absolute inset-0 bg-yellow-400 blur-md opacity-30" />
                              </div>
                            )}
                            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                              {member.username.charAt(0).toUpperCase()}
                            </div>
                            <span className="text-white font-medium group-hover:text-blue-300 transition-colors duration-300">{member.username}</span>
                            {member.is_captain && (
                              <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-xs font-semibold">
                                Captain
                              </span>
                            )}
                          </div>
                          {isAdmin && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removePlayer(member.id)}
                              className="text-red-400 hover:text-red-300 hover:bg-red-900/30 opacity-0 group-hover:opacity-100 transition-all duration-300"
                            >
                              <X size={16} />
                            </Button>
                          )}
                        </div>
                      ))}
                      
                      {team1Members.length === 0 && (
                        <div className="text-center py-12 text-gray-500">
                          <div className="relative">
                            <Users size={64} className="mx-auto mb-4 opacity-30" />
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="w-16 h-16 border-2 border-gray-600 border-dashed rounded-full animate-pulse" />
                            </div>
                          </div>
                          <p className="text-lg font-medium">No players assigned yet</p>
                          <p className="text-sm text-gray-600 mt-1">Waiting for elite players to join</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Team 2 */}
            <div className="group">
              <div className={`bg-gradient-to-r ${gameColor} rounded-2xl p-1 shadow-2xl transition-all duration-500 hover:shadow-3xl hover:scale-[1.02] animate-slide-in-right`} style={{ animationDelay: '0.2s' }}>
                <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-8 h-full relative overflow-hidden">
                  {/* Background Pattern */}
                  <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-white/5 to-transparent rounded-full blur-3xl" />
                  
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-8">
                      <div className="flex items-center space-x-3">
                        <div className="relative">
                          <Users className="text-white" size={24} />
                          <div className="absolute inset-0 bg-purple-400 blur-lg opacity-30" />
                        </div>
                        <h3 className="text-2xl font-bold text-white tracking-wide">{teamSettings.team2_name}</h3>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-gray-400 text-sm font-medium">
                          {team2Members.length}/{teamSettings.team2_max_players} Players
                        </span>
                        <div className="w-16 h-2 bg-gray-700 rounded-full mt-1 overflow-hidden">
                          <div 
                            className={`h-full bg-gradient-to-r ${gameColor} transition-all duration-500`}
                            style={{ width: `${(team2Members.length / teamSettings.team2_max_players) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4 mb-6">
                      {team2Members.map((member, index) => (
                        <div key={member.id} className="flex items-center justify-between bg-gradient-to-r from-gray-800/60 to-gray-700/40 rounded-xl p-4 group hover:from-gray-700/60 hover:to-gray-600/40 transition-all duration-300" style={{ animationDelay: `${index * 0.1}s` }}>
                          <div className="flex items-center space-x-3">
                            {member.is_captain && (
                              <div className="relative">
                                <Crown className="text-yellow-400 animate-pulse" size={18} />
                                <div className="absolute inset-0 bg-yellow-400 blur-md opacity-30" />
                              </div>
                            )}
                            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-red-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                              {member.username.charAt(0).toUpperCase()}
                            </div>
                            <span className="text-white font-medium group-hover:text-purple-300 transition-colors duration-300">{member.username}</span>
                            {member.is_captain && (
                              <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-xs font-semibold">
                                Captain
                              </span>
                            )}
                          </div>
                          {isAdmin && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removePlayer(member.id)}
                              className="text-red-400 hover:text-red-300 hover:bg-red-900/30 opacity-0 group-hover:opacity-100 transition-all duration-300"
                            >
                              <X size={16} />
                            </Button>
                          )}
                        </div>
                      ))}
                      
                      {team2Members.length === 0 && (
                        <div className="text-center py-12 text-gray-500">
                          <div className="relative">
                            <Users size={64} className="mx-auto mb-4 opacity-30" />
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="w-16 h-16 border-2 border-gray-600 border-dashed rounded-full animate-pulse" />
                            </div>
                          </div>
                          <p className="text-lg font-medium">No players assigned yet</p>
                          <p className="text-sm text-gray-600 mt-1">Waiting for elite players to join</p>
                        </div>
                      )}
                    </div>

                    {isAdmin && (
                      <div className="border-t border-gray-700/50 pt-6 mt-6">
                        {editingTeam === 1 ? (
                          <div className="flex space-x-3">
                            <Input
                              value={newPlayerName}
                              onChange={(e) => setNewPlayerName(e.target.value)}
                              placeholder="Enter player name"
                              className="bg-gray-800/50 border-gray-600 text-white placeholder:text-gray-400"
                              onKeyPress={(e) => e.key === 'Enter' && addPlayer(1)}
                            />
                            <Button
                              onClick={() => addPlayer(1)}
                              size="sm"
                              className="bg-green-600 hover:bg-green-700 text-white"
                            >
                              <Save size={16} />
                            </Button>
                            <Button
                              onClick={() => {
                                setEditingTeam(null);
                                setNewPlayerName('');
                              }}
                              variant="ghost"
                              size="sm"
                              className="text-gray-400 hover:text-white"
                            >
                              <X size={16} />
                            </Button>
                          </div>
                        ) : (
                          <Button
                            onClick={() => setEditingTeam(1)}
                            variant="outline"
                            size="sm"
                            className="w-full border-gray-600/50 text-gray-300 hover:bg-gray-800/50 hover:text-white transition-all duration-300"
                          >
                            <Plus size={16} className="mr-2" />
                            Add Elite Player
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Team 2 */}
            <div className="group">
              <div className={`bg-gradient-to-r ${gameColor} rounded-2xl p-1 shadow-2xl transition-all duration-500 hover:shadow-3xl hover:scale-[1.02] animate-slide-in-right`} style={{ animationDelay: '0.2s' }}>
                <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-8 h-full relative overflow-hidden">
                  {/* Background Pattern */}
                  <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-white/5 to-transparent rounded-full blur-3xl" />
                  
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-8">
                      <div className="flex items-center space-x-3">
                        <div className="relative">
                          <Users className="text-white" size={24} />
                          <div className="absolute inset-0 bg-purple-400 blur-lg opacity-30" />
                        </div>
                        <h3 className="text-2xl font-bold text-white tracking-wide">{teamSettings.team2_name}</h3>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-gray-400 text-sm font-medium">
                          {team2Members.length}/{teamSettings.team2_max_players} Players
                        </span>
                        <div className="w-16 h-2 bg-gray-700 rounded-full mt-1 overflow-hidden">
                          <div 
                            className={`h-full bg-gradient-to-r ${gameColor} transition-all duration-500`}
                            style={{ width: `${(team2Members.length / teamSettings.team2_max_players) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4 mb-6">
                      {team2Members.map((member, index) => (
                        <div key={member.id} className="flex items-center justify-between bg-gradient-to-r from-gray-800/60 to-gray-700/40 rounded-xl p-4 group hover:from-gray-700/60 hover:to-gray-600/40 transition-all duration-300" style={{ animationDelay: `${index * 0.1}s` }}>
                          <div className="flex items-center space-x-3">
                            {member.is_captain && (
                              <div className="relative">
                                <Crown className="text-yellow-400 animate-pulse" size={18} />
                                <div className="absolute inset-0 bg-yellow-400 blur-md opacity-30" />
                              </div>
                            )}
                            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-red-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                              {member.username.charAt(0).toUpperCase()}
                            </div>
                            <span className="text-white font-medium group-hover:text-purple-300 transition-colors duration-300">{member.username}</span>
                            {member.is_captain && (
                              <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-xs font-semibold">
                                Captain
                              </span>
                            )}
                          </div>
                          {isAdmin && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removePlayer(member.id)}
                              className="text-red-400 hover:text-red-300 hover:bg-red-900/30 opacity-0 group-hover:opacity-100 transition-all duration-300"
                            >
                              <X size={16} />
                            </Button>
                          )}
                        </div>
                      ))}
                      
                      {team2Members.length === 0 && (
                        <div className="text-center py-12 text-gray-500">
                          <div className="relative">
                            <Users size={64} className="mx-auto mb-4 opacity-30" />
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="w-16 h-16 border-2 border-gray-600 border-dashed rounded-full animate-pulse" />
                            </div>
                          </div>
                          <p className="text-lg font-medium">No players assigned yet</p>
                          <p className="text-sm text-gray-600 mt-1">Waiting for elite players to join</p>
                        </div>
                      )}
                    </div>

                    {isAdmin && (
                      <div className="border-t border-gray-700/50 pt-6 mt-6">
                        {editingTeam === 2 ? (
                          <div className="flex space-x-3">
                            <Input
                              value={newPlayerName}
                              onChange={(e) => setNewPlayerName(e.target.value)}
                              placeholder="Enter player name"
                              className="bg-gray-800/50 border-gray-600 text-white placeholder:text-gray-400"
                              onKeyPress={(e) => e.key === 'Enter' && addPlayer(2)}
                            />
                            <Button
                              onClick={() => addPlayer(2)}
                              size="sm"
                              className="bg-green-600 hover:bg-green-700 text-white"
                            >
                              <Save size={16} />
                            </Button>
                            <Button
                              onClick={() => {
                                setEditingTeam(null);
                                setNewPlayerName('');
                              }}
                              variant="ghost"
                              size="sm"
                              className="text-gray-400 hover:text-white"
                            >
                              <X size={16} />
                            </Button>
                          </div>
                        ) : (
                          <Button
                            onClick={() => setEditingTeam(2)}
                            variant="outline"
                            size="sm"
                            className="w-full border-gray-600/50 text-gray-300 hover:bg-gray-800/50 hover:text-white transition-all duration-300"
                          >
                            <Plus size={16} className="mr-2" />
                            Add Elite Player
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameDivisionPage;
