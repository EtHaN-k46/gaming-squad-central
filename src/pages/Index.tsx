
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
    {/* Sidebar with Discord Widget */}
          <div className="space-y-6">
            {/* Discord Community Widget */}
            <section className="bg-card rounded-lg p-6 border border-border">
              <h3 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419-.0190 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1568 2.4189Z"/>
                </svg>
                Join Our Discord
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Connect with our community on Discord! Chat with other players, find teammates, and stay updated with announcements.
              </p>
              <div className="flex justify-center">
                <iframe 
                  src="https://ptb.discord.com/widget?id=819994053759860746&theme=dark" 
                  width="350" 
                  height="500" 
                  allowTransparency={true}
                  frameBorder="0" 
                  sandbox="allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts"
                  className="rounded-lg border border-border"
                  title="Discord Server Widget"
                />
              </div>
            </section>

            {/* Quick Stats */}
            <section className="bg-card rounded-lg p-6 border border-border">
              <h3 className="text-xl font-semibold text-foreground mb-4">Community Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Active Members</span>
                  <span className="font-semibold text-foreground">2,847</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Online Now</span>
                  <span className="font-semibold text-primary">234</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Games Played</span>
                  <span className="font-semibold text-foreground">15,692</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Tournaments</span>
                  <span className="font-semibold text-foreground">47</span>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Index;
