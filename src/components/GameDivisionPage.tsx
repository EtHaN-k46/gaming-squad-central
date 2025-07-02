
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
    <div className="min-h-screen bg-black pt-20">
      {/* Hero Section */}
      <div className="relative h-96 overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${gameImage})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-black/40" />
        <div className="relative container mx-auto px-4 h-full flex items-center">
          <div className="max-w-2xl">
            <h1 className="text-6xl font-bold text-white mb-6 animate-fade-in">
              {gameName} <span className="text-red-500">Division</span>
            </h1>
            <p className="text-xl text-gray-300 animate-fade-in">
              {gameDescription}
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {/* Division Head Card */}
        {divisionHead && (
          <div className="mb-12">
            <div className={`bg-gradient-to-r ${gameColor} rounded-xl p-1 max-w-md mx-auto animate-scale-in`}>
              <div className="bg-gray-900 rounded-lg p-6">
                <div className="flex items-center justify-center mb-4">
                  <Crown className="text-yellow-500 mr-2" size={24} />
                  <h3 className="text-xl font-bold text-white">Division Head</h3>
                </div>
                <div className="text-center">
                  <h4 className="text-lg font-semibold text-white">{divisionHead.display_name}</h4>
                  <p className="text-gray-400">Leading the {gameName} Division</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Teams Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Team 1 */}
          <div className={`bg-gradient-to-r ${gameColor} rounded-xl p-1 animate-slide-in-right`}>
            <div className="bg-gray-900 rounded-lg p-6 h-full">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <Users className="text-white mr-2" size={20} />
                  <h3 className="text-xl font-bold text-white">{teamSettings.team1_name}</h3>
                </div>
                <span className="text-gray-400 text-sm">
                  {team1Members.length}/{teamSettings.team1_max_players}
                </span>
              </div>

              <div className="space-y-3 mb-4">
                {team1Members.map((member) => (
                  <div key={member.id} className="flex items-center justify-between bg-gray-800/50 rounded-lg p-3">
                    <div className="flex items-center">
                      {member.is_captain && <Crown className="text-yellow-500 mr-2" size={16} />}
                      <span className="text-white">{member.username}</span>
                    </div>
                    {isAdmin && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removePlayer(member.id)}
                        className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                      >
                        <X size={16} />
                      </Button>
                    )}
                  </div>
                ))}
                
                {team1Members.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Users size={48} className="mx-auto mb-4 opacity-50" />
                    <p>No players assigned yet</p>
                  </div>
                )}
              </div>

              {isAdmin && (
                <div className="border-t border-gray-700 pt-4">
                  {editingTeam === 1 ? (
                    <div className="flex space-x-2">
                      <Input
                        value={newPlayerName}
                        onChange={(e) => setNewPlayerName(e.target.value)}
                        placeholder="Enter player name"
                        className="bg-gray-800 border-gray-600 text-white"
                        onKeyPress={(e) => e.key === 'Enter' && addPlayer(1)}
                      />
                      <Button
                        onClick={() => addPlayer(1)}
                        size="sm"
                        className="bg-green-600 hover:bg-green-700"
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
                      >
                        <X size={16} />
                      </Button>
                    </div>
                  ) : (
                    <Button
                      onClick={() => setEditingTeam(1)}
                      variant="outline"
                      size="sm"
                      className="w-full border-gray-600 text-gray-300 hover:bg-gray-800"
                    >
                      <Plus size={16} className="mr-2" />
                      Add Player
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Team 2 */}
          <div className={`bg-gradient-to-r ${gameColor} rounded-xl p-1 animate-slide-in-right`} style={{ animationDelay: '0.1s' }}>
            <div className="bg-gray-900 rounded-lg p-6 h-full">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <Users className="text-white mr-2" size={20} />
                  <h3 className="text-xl font-bold text-white">{teamSettings.team2_name}</h3>
                </div>
                <span className="text-gray-400 text-sm">
                  {team2Members.length}/{teamSettings.team2_max_players}
                </span>
              </div>

              <div className="space-y-3 mb-4">
                {team2Members.map((member) => (
                  <div key={member.id} className="flex items-center justify-between bg-gray-800/50 rounded-lg p-3">
                    <div className="flex items-center">
                      {member.is_captain && <Crown className="text-yellow-500 mr-2" size={16} />}
                      <span className="text-white">{member.username}</span>
                    </div>
                    {isAdmin && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removePlayer(member.id)}
                        className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                      >
                        <X size={16} />
                      </Button>
                    )}
                  </div>
                ))}
                
                {team2Members.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Users size={48} className="mx-auto mb-4 opacity-50" />
                    <p>No players assigned yet</p>
                  </div>
                )}
              </div>

              {isAdmin && (
                <div className="border-t border-gray-700 pt-4">
                  {editingTeam === 2 ? (
                    <div className="flex space-x-2">
                      <Input
                        value={newPlayerName}
                        onChange={(e) => setNewPlayerName(e.target.value)}
                        placeholder="Enter player name"
                        className="bg-gray-800 border-gray-600 text-white"
                        onKeyPress={(e) => e.key === 'Enter' && addPlayer(2)}
                      />
                      <Button
                        onClick={() => addPlayer(2)}
                        size="sm"
                        className="bg-green-600 hover:bg-green-700"
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
                      >
                        <X size={16} />
                      </Button>
                    </div>
                  ) : (
                    <Button
                      onClick={() => setEditingTeam(2)}
                      variant="outline"
                      size="sm"
                      className="w-full border-gray-600 text-gray-300 hover:bg-gray-800"
                    >
                      <Plus size={16} className="mr-2" />
                      Add Player
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameDivisionPage;
