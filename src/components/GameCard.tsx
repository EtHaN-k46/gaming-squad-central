
import React from 'react';
import { Link } from 'react-router-dom';
import { Users, Crown, Shield } from 'lucide-react';

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

interface GameCardProps {
  id: string;
  name: string;
  playerCount: number;
  image: string;
  description: string;
  teamMembers: TeamMember[];
  teamSettings: TeamSettings;
}

const GameCard: React.FC<GameCardProps> = ({ 
  id, 
  name, 
  playerCount, 
  image, 
  description, 
  teamMembers, 
  teamSettings 
}) => {
  const divisionMembers = teamMembers.filter(member => member.division === name);
  const team1 = divisionMembers.filter(member => member.team_number === 1);
  const team2 = divisionMembers.filter(member => member.team_number === 2);

  const gameColors = {
    'Apex Legends': 'from-orange-500 to-orange-600',
    'Valorant': 'from-red-500 to-red-600',
    'Call of Duty': 'from-green-500 to-green-600',
    'Siege X': 'from-blue-500 to-blue-600',
    'Call of Duty Mobile': 'from-purple-500 to-purple-600'
  };

  return (
    <Link to={`/games/${id}`} className="group block">
      <div className="bg-gray-900/50 rounded-xl overflow-hidden border border-gray-800 hover:border-red-600/50 transition-all duration-300 transform hover:scale-105 hover:shadow-xl hover:shadow-red-600/10">
        <div className="aspect-video bg-gradient-to-br from-gray-800 to-gray-900 relative overflow-hidden">
          {image ? (
            <>
              <img 
                src={image} 
                alt={name} 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
              <div className="absolute bottom-4 left-4 z-10">
                <h3 className="text-2xl font-bold text-white drop-shadow-lg">{name}</h3>
              </div>
            </>
          ) : (
            <>
              <div className="absolute inset-0 bg-gradient-to-br from-red-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <h3 className="text-2xl font-bold text-white z-10 absolute inset-0 flex items-center justify-center">{name}</h3>
            </>
          )}
        </div>
        
        <div className="p-6">
          <p className="text-gray-400 mb-4 line-clamp-2">{description}</p>
          
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center text-gray-300">
              <Users size={16} className="mr-2" />
              <span className="text-sm">{playerCount} Players</span>
            </div>
            <span className="text-red-500 text-sm font-semibold group-hover:text-red-400">
              View Teams →
            </span>
          </div>

          {/* Team Information */}
          {playerCount > 0 && (
            <div className={`bg-gradient-to-r ${gameColors[name as keyof typeof gameColors]} rounded-lg p-1 mb-4`}>
              <div className="bg-gray-800 rounded-md p-4">
                <div className="flex items-center justify-center mb-3">
                  <Shield className="mr-2 text-white" size={16} />
                  <span className="text-white font-semibold text-sm">Team Overview</span>
                </div>
                
                <div className="grid grid-cols-2 gap-3 text-xs">
                  {/* Team 1 */}
                  <div className="bg-gray-700/50 rounded p-2">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white font-medium">{teamSettings.team1_name}</span>
                      <span className="text-gray-400">{team1.length}/{teamSettings.team1_max_players}</span>
                    </div>
                    <div className="space-y-1">
                      {team1.slice(0, 3).map((member) => (
                        <div key={member.id} className="flex items-center text-gray-300">
                          {member.is_captain && <Crown className="text-yellow-500 mr-1" size={10} />}
                          <span className="truncate">{member.username}</span>
                        </div>
                      ))}
                      {team1.length > 3 && (
                        <div className="text-gray-400 text-xs">+{team1.length - 3} more</div>
                      )}
                      {team1.length === 0 && (
                        <div className="text-gray-500 text-xs">No players</div>
                      )}
                    </div>
                  </div>

                  {/* Team 2 */}
                  <div className="bg-gray-700/50 rounded p-2">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white font-medium">{teamSettings.team2_name}</span>
                      <span className="text-gray-400">{team2.length}/{teamSettings.team2_max_players}</span>
                    </div>
                    <div className="space-y-1">
                      {team2.slice(0, 3).map((member) => (
                        <div key={member.id} className="flex items-center text-gray-300">
                          {member.is_captain && <Crown className="text-yellow-500 mr-1" size={10} />}
                          <span className="truncate">{member.username}</span>
                        </div>
                      ))}
                      {team2.length > 3 && (
                        <div className="text-gray-400 text-xs">+{team2.length - 3} more</div>
                      )}
                      {team2.length === 0 && (
                        <div className="text-gray-500 text-xs">No players</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {playerCount === 0 && (
            <div className="text-center text-gray-500 py-4 text-sm">
              No players assigned yet
            </div>
          )}
        </div>
      </div>
    </Link>
  );
};

export default GameCard;
