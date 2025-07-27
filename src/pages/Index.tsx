
import React from 'react';
import Hero from '../components/Hero';
import StatsSection from '../components/StatsSection';
import { Link } from 'react-router-dom';
import { Calendar, Users, Trophy, Target } from 'lucide-react';

const Index = () => {
  const features = [
    {
      icon: Calendar,
      title: 'Practice Schedules',
      description: 'Stay updated with dynamic practice calendars for all game divisions.',
      link: '/calendar'
    },
    {
      icon: Users,
      title: 'Player Profiles',
      description: 'View comprehensive player profiles and team assignments.',
      link: '/players'
    },
    {
      icon: Trophy,
      title: 'Tournament Prep',
      description: 'Coordinate tournament preparations and competitive strategies.',
      link: '/about'
    },
    {
      icon: Target,
      title: 'Game Divisions',
      description: 'Explore all our competitive gaming divisions and their teams.',
      link: '/games'
    }
  ];

  return (
    <div className="min-h-screen bg-black">
      <Hero />
      <StatsSection />
      
      {/* Features Section */}
      <section className="py-20 bg-gradient-to-b from-black to-gray-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Everything You Need for 
              <span className="text-red-500"> Professional Gaming</span>
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Comprehensive tools and features designed specifically for competitive gaming organizations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Link
                key={index}
                to={feature.link}
                className="group bg-gray-900/50 rounded-xl p-6 border border-gray-800 hover:border-red-600/50 transition-all duration-300 transform hover:scale-105 hover:shadow-xl hover:shadow-red-600/10"
              >
                <div className="inline-flex items-center justify-center w-12 h-12 bg-red-600/10 rounded-lg mb-4 group-hover:bg-red-600/20 transition-colors">
                  <feature.icon className="w-6 h-6 text-red-500" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                <p className="text-gray-400 mb-4">{feature.description}</p>
                <span className="text-red-500 text-sm font-semibold group-hover:text-red-400">
                  Learn More →
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-b from-gray-900 to-black">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Ready to Join the 
              <span className="text-red-500"> Elite?</span>
            </h2>
            <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
              Take your gaming to the next level. Join Nitara Gaming and compete with the best players in the world.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/auth"
                className="bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-colors"
              >
                Join Now
              </Link>
              <Link
                to="/games"
                className="border border-gray-600 hover:border-gray-400 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-colors hover:bg-gray-800/50"
              >
                Explore Games
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
   
export default Index;
