
import React, { useState, useEffect } from 'react';
import GameCard from '../components/GameCard';
import { supabase } from '@/integrations/supabase/client';

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

const Games = () => {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [teamSettings, setTeamSettings] = useState<TeamSettings[]>([]);
  const [loading, setLoading] = useState(true);

  const games = [
    {
      id: 'apex-legends',
      name: 'Apex Legends',
      image: '/lovable-uploads/fb650a8f-2343-42cf-9d23-e8eb1e20780f.png',
      description: 'Battle royale at its finest. Join our elite squads and dominate the Apex Games with strategic gameplay and teamwork.'
    },
    {
      id: 'siege-x',
      name: 'Siege X',
      image: '/lovable-uploads/f30ffafc-4de0-4575-b109-a1e02abc3444.png',
      description: 'Tactical shooter excellence. Master the art of strategy and precision in intense 5v5 competitive matches.'
    },
    {
      id: 'valorant',
      name: 'Valorant',
      image: '/lovable-uploads/b12a3836-2b91-4fc0-8005-d8887098ab08.png',
      description: 'Precision gunplay meets unique agent abilities. Lead your team to victory in this tactical FPS phenomenon.'
    },
    {
      id: 'call-of-duty',
      name: 'Call of Duty',
      image: '/lovable-uploads/e737d49c-ab99-40b7-b162-a5ec7017b87b.png',
      description: 'Fast-paced action and competitive gameplay. Join the ranks of our professional COD division.'
    },
    {
      id: 'call-of-duty-mobile',
      name: 'Call of Duty Mobile',
      image: '/lovable-uploads/e7daf921-22c2-4680-998a-589d56031b42.png',
      description: 'Mobile gaming at its peak. Compete in tournaments and climb the rankings in COD Mobile.'
    }
  ];

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
      const divisions = ['Apex Legends', 'Valorant', 'Call of Duty', 'Siege X', 'Call of Duty Mobile'];
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

  const getPlayerCountForDivision = (divisionName: string) => {
    return teamMembers.filter(member => member.division === divisionName).length;
  };

  const getTeamSettingsForDivision = (divisionName: string) => {
    return teamSettings.find(setting => setting.division === divisionName) || {
      division: divisionName,
      team1_max_players: 5,
      team2_max_players: 5,
      team1_name: 'Team 1',
      team2_name: 'Team 2',
    };
  };

  const gamesWithPlayerData = games.map(game => ({
    ...game,
    playerCount: getPlayerCountForDivision(game.name),
    teamMembers: teamMembers,
    teamSettings: getTeamSettingsForDivision(game.name)
  }));

  if (loading) {
    return (
      <div className="min-h-screen bg-black pt-20 flex items-center justify-center">
        <div className="text-white text-xl">Loading games...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black pt-20">
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-white mb-6">
            Our Game <span className="text-red-500">Divisions</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Explore our professional gaming divisions and join elite teams competing at the highest level.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {gamesWithPlayerData.map((game) => (
            <GameCard key={game.id} {...game} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Games;
