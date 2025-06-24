
import React from 'react';
import { Users, Target, Trophy, Star } from 'lucide-react';

const About = () => {
  const teamMembers = [
    { name: 'Jenny Wilson', role: 'CEO, Alishka', avatar: '1' },
    { name: 'Albert Flores', role: 'CEO, Alishka', avatar: '2' },
    { name: 'Ronald Richards', role: 'CEO, Alishka', avatar: '3' },
    { name: 'Devon Lane', role: 'Lead Strategist', avatar: '4' },
    { name: 'Courtney Henry', role: 'Community Manager', avatar: '5' },
    { name: 'Cameron Williamson', role: 'Head Coach', avatar: '6' },
  ];

  return (
    <div className="min-h-screen bg-black pt-20">
      {/* Who We Are Section */}
      <section className="py-20 bg-gradient-to-b from-black to-gray-900">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-red-500 font-semibold mb-4 block">Who We Are</span>
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                A Team Of Passionate Gamers, Dedicated To Creating The Ultimate 
                <span className="text-red-500"> ESports Experience.</span>
              </h2>
              <p className="text-gray-400 text-lg mb-8 leading-relaxed">
                Our Mission Is Empower Teams & Players.
              </p>
              <button className="bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-lg font-semibold transition-colors">
                Know More
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="bg-gradient-to-br from-red-600/20 to-orange-600/20 p-6 rounded-xl border border-red-600/20">
                  <Users className="text-red-500 mb-4" size={32} />
                  <h3 className="text-white font-bold text-lg mb-2">Elite Teams</h3>
                  <p className="text-gray-400 text-sm">Professional gaming teams across multiple divisions</p>
                </div>
                <div className="bg-gradient-to-br from-blue-600/20 to-purple-600/20 p-6 rounded-xl border border-blue-600/20">
                  <Trophy className="text-blue-500 mb-4" size={32} />
                  <h3 className="text-white font-bold text-lg mb-2">Championships</h3>
                  <p className="text-gray-400 text-sm">Multiple tournament victories and awards</p>
                </div>
              </div>
              <div className="space-y-4 mt-8">
                <div className="bg-gradient-to-br from-green-600/20 to-teal-600/20 p-6 rounded-xl border border-green-600/20">
                  <Target className="text-green-500 mb-4" size={32} />
                  <h3 className="text-white font-bold text-lg mb-2">Precision</h3>
                  <p className="text-gray-400 text-sm">Strategic gameplay and tactical excellence</p>
                </div>
                <div className="bg-gradient-to-br from-yellow-600/20 to-orange-600/20 p-6 rounded-xl border border-yellow-600/20">
                  <Star className="text-yellow-500 mb-4" size={32} />
                  <h3 className="text-white font-bold text-lg mb-2">Excellence</h3>
                  <p className="text-gray-400 text-sm">Committed to the highest standards</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 bg-gradient-to-b from-gray-900 to-black">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <span className="text-red-500 font-semibold mb-4 block">The Gamers</span>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Players Behind Our Screens.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {teamMembers.map((member, index) => (
              <div key={index} className="text-center group">
                <div className="relative mb-6 inline-block">
                  <div className="w-32 h-32 bg-gradient-to-br from-red-600 to-orange-600 rounded-full flex items-center justify-center text-white text-2xl font-bold group-hover:scale-105 transition-transform duration-200">
                    {member.avatar}
                  </div>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{member.name}</h3>
                <p className="text-gray-400">{member.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
