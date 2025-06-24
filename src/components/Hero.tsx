
import React from 'react';
import { Link } from 'react-router-dom';

const Hero = () => {
  return (
    <section className="relative min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `linear-gradient(45deg, transparent 40%, rgba(220, 38, 38, 0.1) 50%, transparent 60%)`,
          backgroundSize: '60px 60px',
          animation: 'pulse 4s ease-in-out infinite alternate'
        }}></div>
      </div>

      {/* Team Image Background */}
      <div className="absolute inset-0 flex items-center justify-end pr-20 opacity-80">
        <div className="w-3/5 h-4/5 bg-gradient-to-l from-transparent via-gray-800/20 to-black/40 rounded-lg relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent"></div>
          {/* Placeholder for team image */}
          <div className="w-full h-full bg-gray-800/30 flex items-center justify-center">
            <div className="grid grid-cols-5 gap-4 opacity-60">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="w-16 h-20 bg-gray-700/50 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
            The Ultimate 
            <span className="block text-transparent bg-gradient-to-r from-red-500 to-red-600 bg-clip-text">
              E-Sports Experience
            </span>
            <span className="block">Starts Here.</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
            Welcome to Zaispot, the ultimate destination for eSports teams and gaming enthusiasts. Join 
            forces with elite players, showcase your skills, and dominate the competitive arena.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              to="/games"
              className="bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-red-600/25"
            >
              Get Started
            </Link>
            <Link
              to="/about"
              className="border border-gray-600 hover:border-gray-400 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-all duration-200 hover:bg-gray-800/50"
            >
              Know More
            </Link>
          </div>
        </div>
      </div>

      {/* Animated elements */}
      <div className="absolute top-20 left-20 w-2 h-2 bg-red-500 rounded-full animate-pulse opacity-60"></div>
      <div className="absolute bottom-32 left-32 w-1 h-1 bg-red-400 rounded-full animate-pulse opacity-40"></div>
      <div className="absolute top-40 right-40 w-1.5 h-1.5 bg-red-600 rounded-full animate-pulse opacity-50"></div>
    </section>
  );
};

export default Hero;
