
import React, { useState, useEffect } from 'react';
import { Users, Crown, Shield, Edit } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useUserRole } from '@/hooks/useUserRole';
import { useAuth } from '@/contexts/AuthContext';

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
}

const Players = () => {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [teamSettings, setTeamSettings] = useState<TeamSettings[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDivision, setSelectedDivision] = useState<string>('all');
  
  const { user } = useAuth();
  const { role, canManageEvents } = useUserRole();

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

      // Handle the new database columns properly
      const membersWithDefaults = (membersData || []).map(member => ({
        ...member,
        team_number: member.team_number ?? 1,
        is_captain: member.is_captain ?? false,
      }));

      setTeamMembers(membersWithDefaults);

      // Fetch team settings
      const { data: settingsData, error: settingsError } = await supabase
        .from('team_settings')
        .select('*');

      if (settingsError && settingsError.code !== 'PGRST116') {
        console.error('Error fetching team settings:', settingsError);
      }

      // Set default team settings or use fetched data
      const settings = settingsData || [];
      const defaultSettings = divisions.map(division => {
        const existingSetting = settings.find(s => s.division === division);
        return existingSetting || {
          division,
          team1_max_players: 5,
          team2_max_players: 5,
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
      team2_max_players: 5
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black pt-20 flex items-center justify-center">
        <div className="text-white text-xl">Loading players...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black pt-20">
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-6 animate-fade-in">
            Our <span className="text-red-500">Players</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Meet the talented players across all our game divisions and teams.
          </p>
        </div>

        {/* Division Filter */}
        <div className="mb-8 flex flex-wrap justify-center gap-4">
          <button
            onClick={() => setSelectedDivision('all')}
            className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
              selectedDivision === 'all'
                ? 'bg-red-600 text-white scale-105'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            All Divisions
          </button>
          {divisions.map((division) => (
            <button
              key={division}
              onClick={() => setSelectedDivision(division)}
              className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
                selectedDivision === division
                  ? 'bg-red-600 text-white scale-105'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              {division}
            </button>
          ))}
        </div>

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
                <div className={`bg-gradient-to-r ${gameColors[division as keyof typeof gameColors]} rounded-xl p-1 mb-6`}>
                  <div className="bg-gray-900 rounded-lg p-6">
                    <h2 className="text-3xl font-bold text-white mb-6 text-center flex items-center justify-center">
                      <Shield className="mr-3" size={32} />
                      {division}
                    </h2>

                    <div className="grid md:grid-cols-2 gap-8">
                      {/* Team 1 */}
                      <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-xl font-semibold text-white flex items-center">
                            <Users className="mr-2" size={20} />
                            Team 1
                          </h3>
                          <span className="text-gray-400 text-sm">
                            {team1.length}/{settings.team1_max_players} players
                          </span>
                        </div>
                        
                        <div className="space-y-3">
                          {team1.map((member, index) => (
                            <div
                              key={member.id}
                              className="bg-gray-700/50 rounded-lg p-4 hover:bg-gray-700 transition-all duration-300 hover:scale-105"
                              style={{ animationDelay: `${index * 0.05}s` }}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                  {member.is_captain && (
                                    <Crown className="text-yellow-500 mr-2" size={16} />
                                  )}
                                  <span className="text-white font-medium">{member.username}</span>
                                </div>
                                {canManageEvents && (
                                  <Edit className="text-gray-400 hover:text-white cursor-pointer" size={14} />
                                )}
                              </div>
                              
                              <div className="mt-2 flex flex-wrap gap-2 text-xs text-gray-400">
                                {member.discord && (
                                  <span className="bg-indigo-600/20 text-indigo-400 px-2 py-1 rounded">
                                    Discord
                                  </span>
                                )}
                                {member.twitch && (
                                  <span className="bg-purple-600/20 text-purple-400 px-2 py-1 rounded">
                                    Twitch
                                  </span>
                                )}
                                {member.twitter && (
                                  <span className="bg-blue-600/20 text-blue-400 px-2 py-1 rounded">
                                    Twitter
                                  </span>
                                )}
                                {member.youtube && (
                                  <span className="bg-red-600/20 text-red-400 px-2 py-1 rounded">
                                    YouTube
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                          
                          {team1.length === 0 && (
                            <div className="text-center text-gray-500 py-8">
                              No players assigned to Team 1
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Team 2 */}
                      <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-xl font-semibold text-white flex items-center">
                            <Users className="mr-2" size={20} />
                            Team 2
                          </h3>
                          <span className="text-gray-400 text-sm">
                            {team2.length}/{settings.team2_max_players} players
                          </span>
                        </div>
                        
                        <div className="space-y-3">
                          {team2.map((member, index) => (
                            <div
                              key={member.id}
                              className="bg-gray-700/50 rounded-lg p-4 hover:bg-gray-700 transition-all duration-300 hover:scale-105"
                              style={{ animationDelay: `${index * 0.05}s` }}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                  {member.is_captain && (
                                    <Crown className="text-yellow-500 mr-2" size={16} />
                                  )}
                                  <span className="text-white font-medium">{member.username}</span>
                                </div>
                                {canManageEvents && (
                                  <Edit className="text-gray-400 hover:text-white cursor-pointer" size={14} />
                                )}
                              </div>
                              
                              <div className="mt-2 flex flex-wrap gap-2 text-xs text-gray-400">
                                {member.discord && (
                                  <span className="bg-indigo-600/20 text-indigo-400 px-2 py-1 rounded">
                                    Discord
                                  </span>
                                )}
                                {member.twitch && (
                                  <span className="bg-purple-600/20 text-purple-400 px-2 py-1 rounded">
                                    Twitch
                                  </span>
                                )}
                                {member.twitter && (
                                  <span className="bg-blue-600/20 text-blue-400 px-2 py-1 rounded">
                                    Twitter
                                  </span>
                                )}
                                {member.youtube && (
                                  <span className="bg-red-600/20 text-red-400 px-2 py-1 rounded">
                                    YouTube
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                          
                          {team2.length === 0 && (
                            <div className="text-center text-gray-500 py-8">
                              No players assigned to Team 2
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {teamMembers.length === 0 && (
          <div className="text-center text-gray-400 py-16">
            <Users size={64} className="mx-auto mb-4 opacity-50" />
            <h3 className="text-xl font-semibold mb-2">No Players Yet</h3>
            <p>Team members will appear here once they're added by division heads.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Players;
