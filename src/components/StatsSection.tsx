import React from 'react';
import { Users, Trophy, Star, Target } from 'lucide-react';

const StatsSection = () => {
  const stats = [
    {
      icon: Users,
      number: "2.5",
      suffix: "M",
      label: "Million Fans worldwide and growing"
    },
    {
      icon: Target,
      number: "20",
      suffix: "+",
      label: "Years of experience we have"
    },
    {
      icon: Trophy,
      number: "52",
      suffix: "+",
      label: "Prestigious awards win by our team"
    },
    {
      icon: Star,
      number: "40",
      suffix: "+",
      label: "Professional expert Gamers"
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-gray-900 to-black">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center group">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-red-600/10 rounded-full mb-6 group-hover:bg-red-600/20 transition-colors duration-200">
                <stat.icon className="w-8 h-8 text-red-500" />
              </div>
              <div className="text-5xl md:text-6xl font-bold text-white mb-2">
                {stat.number}
                <span className="text-red-500">{stat.suffix}</span>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed max-w-xs mx-auto">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
