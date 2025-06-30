
import React from 'react';
import { useParams } from 'react-router-dom';
import { Users, Crown, Star } from 'lucide-react';

const GameDetail = () => {
  const { gameId } = useParams();

  // Mock data - in real app, this would come from API/database
  const gameData = {
    'apex-legends': {
      name: 'Apex Legends',
      description: 'Our Apex Legends division competes in the highest tier tournaments worldwide.',
      teams: {
        'Team 1': [
          { username: 'ShadowHunter', socials: { twitch: 'shadowhunter_tv' } },
          { username: 'ApexMaster', socials: { twitter: '@apexmaster_gg' } },
          { username: 'StormBreaker', socials: {} },
        ],
        'Team 2': [
          { username: 'VoidWalker', socials: { youtube: 'VoidWalker Gaming' } },
          { username: 'CrimsonBolt', socials: { twitch: 'crimsonbolt' } },
        ],
        'Other': [
          { username: 'RisingPhoenix', socials: {} },
          { username: 'EchoStrike', socials: { twitter: '@echostrike' } },
        ]
      },
      divisionHead: {
        name: 'Alex Rodriguez',
        role: 'Division Head',
        socials: { twitter: '@alex_apex_coach' }
      }
    },
    'valorant': {
      name: 'Valorant',
      description: 'Strategic gameplay and precise aim define our Valorant teams.',
      teams: {
        'Team 1': [
          { username: 'PrecisionAim', socials: { twitch: 'precision_aim' } },
          { username: 'TacticalMind', socials: {} },
          { username: 'SpikeDefuser', socials: { youtube: 'SpikeDefuser Pro' } },
        ],
        'Team 2': [
          { username: 'RadiantPlayer', socials: { twitter: '@radiant_player' } },
          { username: 'ClutchKing', socials: {} },
        ],
        'Other': [
          { username: 'NewTalent', socials: {} },
        ]
      },
      divisionHead: {
        name: 'Sarah Chen',
        role: 'Division Head',
        socials: { twitch: 'sarah_val_coach' }
      }
    },
    'siege-x': {
      name: 'Siege X',
      description: 'Elite tactical operations and strategic warfare. Our Siege X division excels in competitive 5v5 matches.',
      teams: {
        'Alpha Squad': [
          { username: 'BreachSpecialist', socials: { twitch: 'breach_specialist' } },
          { username: 'WallBanger', socials: { twitter: '@wallbanger_pro' } },
          { username: 'SiteControl', socials: {} },
          { username: 'FragHunter', socials: { youtube: 'FragHunter Tactics' } },
        ],
        'Bravo Squad': [
          { username: 'AnchорMaster', socials: { twitch: 'anchor_master' } },
          { username: 'RoamClear', socials: {} },
          { username: 'ObjSecure', socials: { twitter: '@obj_secure' } },
        ],
        'Reserves': [
          { username: 'TacticalRookie', socials: {} },
          { username: 'SiegeProspect', socials: { twitch: 'siege_prospect' } },
        ]
      },
      divisionHead: {
        name: 'Marcus Thompson',
        role: 'Division Head',
        socials: { twitter: '@marcus_siege_coach', twitch: 'marcus_tactical' }
      }
    },
    'call-of-duty': {
      name: 'Call of Duty',
      description: 'Fast-paced competitive warfare. Our COD division dominates in Search & Destroy and respawn game modes.',
      teams: {
        'Nitara Red': [
          { username: 'QuickScope', socials: { twitch: 'quickscope_cod' } },
          { username: 'RushKing', socials: { twitter: '@rushking_cod' } },
          { username: 'ClutchGod', socials: { youtube: 'ClutchGod Gaming' } },
          { username: 'FragOut', socials: {} },
        ],
        'Nitara Blue': [
          { username: 'SnDMaster', socials: { twitch: 'snd_master' } },
          { username: 'ObjPlayer', socials: {} },
          { username: 'SlayerBot', socials: { twitter: '@slayerbot_cod' } },
        ],
        'Academy': [
          { username: 'RisingSlayer', socials: {} },
          { username: 'CODProspect', socials: { twitch: 'cod_prospect' } },
          { username: 'NewBlood', socials: {} },
        ]
      },
      divisionHead: {
        name: 'Jake Williams',
        role: 'Division Head',
        socials: { twitter: '@jake_cod_coach', youtube: 'Jake COD Strats' }
      }
    },
    'call-of-duty-mobile': {
      name: 'Call of Duty Mobile',
      description: 'Mobile gaming excellence. Competing in ranked matches, tournaments, and championship series.',
      teams: {
        'Mobile Legends': [
          { username: 'ThumbMaster', socials: { twitch: 'thumb_master' } },
          { username: 'MobileSlayer', socials: { twitter: '@mobile_slayer' } },
          { username: 'TouchPro', socials: {} },
          { username: 'PhoneFragger', socials: { youtube: 'PhoneFragger Pro' } },
        ],
        'Pocket Warriors': [
          { username: 'SwipeKing', socials: { twitch: 'swipe_king' } },
          { username: 'MobileClutch', socials: {} },
          { username: 'TouchElite', socials: { twitter: '@touch_elite' } },
        ],
        'Rising Stars': [
          { username: 'MobileNewbie', socials: {} },
          { username: 'TouchTalent', socials: { twitch: 'touch_talent' } },
        ]
      },
      divisionHead: {
        name: 'Lisa Park',
        role: 'Division Head',
        socials: { twitter: '@lisa_mobile_coach', twitch: 'lisa_mobile_pro' }
      }
    }
  };

  const currentGame = gameData[gameId as keyof typeof gameData];

  if (!currentGame) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-4">Game Not Found</h1>
          <p className="text-gray-400">The requested game division doesn't exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black pt-20">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-white mb-6">
            {currentGame.name} <span className="text-red-500">Division</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            {currentGame.description}
          </p>
        </div>

        {/* Division Head */}
        <div className="mb-12">
          <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-800 max-w-md mx-auto">
            <div className="flex items-center mb-4">
              <Crown className="text-yellow-500 mr-2" size={24} />
              <h3 className="text-xl font-bold text-white">Division Head</h3>
            </div>
            <div className="text-center">
              <h4 className="text-lg font-semibold text-white">{currentGame.divisionHead.name}</h4>
              <p className="text-gray-400 mb-4">{currentGame.divisionHead.role}</p>
              <div className="flex justify-center space-x-2">
                {Object.entries(currentGame.divisionHead.socials).map(([platform, handle]) => (
                  <span key={platform} className="text-red-500 text-sm">
                    {platform}: {String(handle)}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Teams */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {Object.entries(currentGame.teams).map(([teamName, players]) => (
            <div key={teamName} className="bg-gray-900/50 rounded-xl p-6 border border-gray-800">
              <div className="flex items-center mb-6">
                <Star className="text-red-500 mr-2" size={20} />
                <h3 className="text-xl font-bold text-white">{teamName}</h3>
                <div className="ml-auto flex items-center text-gray-400">
                  <Users size={16} className="mr-1" />
                  <span className="text-sm">{players.length}</span>
                </div>
              </div>

              <div className="space-y-4">
                {players.map((player, index) => (
                  <div key={index} className="bg-gray-800/50 rounded-lg p-4">
                    <h4 className="font-semibold text-white mb-2">{player.username}</h4>
                    {Object.keys(player.socials).length > 0 && (
                      <div className="space-y-1">
                        {Object.entries(player.socials).map(([platform, handle]) => (
                          <div key={platform} className="text-sm text-gray-400">
                            <span className="capitalize text-red-400">{platform}:</span> {String(handle)}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
                
                {players.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Users size={48} className="mx-auto mb-4 opacity-50" />
                    <p>No players assigned to this team yet.</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GameDetail;
