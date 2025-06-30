
import React from 'react';
import GameCard from '../components/GameCard';

const Games = () => {
  const games = [
    {
      id: 'apex-legends',
      name: 'Apex Legends',
      playerCount: 15,
      image: '/lovable-uploads/fb650a8f-2343-42cf-9d23-e8eb1e20780f.png',
      description: 'Battle royale at its finest. Join our elite squads and dominate the Apex Games with strategic gameplay and teamwork.'
    },
    {
      id: 'siege-x',
      name: 'Siege X',
      playerCount: 12,
      image: '/lovable-uploads/f30ffafc-4de0-4575-b109-a1e02abc3444.png',
      description: 'Tactical shooter excellence. Master the art of strategy and precision in intense 5v5 competitive matches.'
    },
    {
      id: 'valorant',
      name: 'Valorant',
      playerCount: 18,
      image: '/lovable-uploads/b12a3836-2b91-4fc0-8005-d8887098ab08.png',
      description: 'Precision gunplay meets unique agent abilities. Lead your team to victory in this tactical FPS phenomenon.'
    },
    {
      id: 'call-of-duty',
      name: 'Call of Duty',
      playerCount: 20,
      image: '/lovable-uploads/e737d49c-ab99-40b7-b162-a5ec7017b87b.png',
      description: 'Fast-paced action and competitive gameplay. Join the ranks of our professional COD division.'
    },
    {
      id: 'call-of-duty-mobile',
      name: 'Call of Duty Mobile',
      playerCount: 14,
      image: '/lovable-uploads/e7daf921-22c2-4680-998a-589d56031b42.png',
      description: 'Mobile gaming at its peak. Compete in tournaments and climb the rankings in COD Mobile.'
    }
  ];

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
          {games.map((game) => (
            <GameCard key={game.id} {...game} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Games;
