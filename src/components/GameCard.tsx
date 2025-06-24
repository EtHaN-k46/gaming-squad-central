
import React from 'react';
import { Link } from 'react-router-dom';
import { Users } from 'lucide-react';

interface GameCardProps {
  id: string;
  name: string;
  playerCount: number;
  image: string;
  description: string;
}

const GameCard: React.FC<GameCardProps> = ({ id, name, playerCount, image, description }) => {
  return (
    <Link to={`/games/${id}`} className="group">
      <div className="bg-gray-900/50 rounded-xl overflow-hidden border border-gray-800 hover:border-red-600/50 transition-all duration-300 transform hover:scale-105 hover:shadow-xl hover:shadow-red-600/10">
        <div className="aspect-video bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-red-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <h3 className="text-2xl font-bold text-white z-10">{name}</h3>
        </div>
        <div className="p-6">
          <p className="text-gray-400 mb-4 line-clamp-2">{description}</p>
          <div className="flex items-center justify-between">
            <div className="flex items-center text-gray-300">
              <Users size={16} className="mr-2" />
              <span className="text-sm">{playerCount} Players</span>
            </div>
            <span className="text-red-500 text-sm font-semibold group-hover:text-red-400">
              View Teams →
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default GameCard;
