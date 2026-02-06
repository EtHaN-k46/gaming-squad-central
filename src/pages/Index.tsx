import React, { memo, useMemo } from 'react';
import Hero from '../components/Hero';
import StatsSection from '../components/StatsSection';
import { Link } from 'react-router-dom';
import { Calendar, Users, Trophy, Target } from 'lucide-react';

interface Feature {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  link: string;
}

const FeatureCard = memo(({ feature, index }: { feature: Feature, index: number }) => (
  <Link
    to={feature.link}
    className="group bg-secondary/50 rounded-xl p-6 border border-border hover:border-destructive/50 transition-all duration-300 hover-lift hover:shadow-xl hover:shadow-destructive/10 opacity-0 slide-up"
    style={{ animationDelay: `${index * 100}ms`, animationFillMode: 'forwards' }}
  >
    <div className="inline-flex items-center justify-center w-12 h-12 bg-destructive/10 rounded-lg mb-4 group-hover:bg-destructive/20 transition-colors duration-300">
      <feature.icon className="w-6 h-6 text-destructive" />
    </div>
    <h3 className="text-xl font-bold text-foreground mb-3">{feature.title}</h3>
    <p className="text-muted-foreground mb-4">{feature.description}</p>
    <span className="text-destructive text-sm font-semibold group-hover:text-destructive/80 transition-colors duration-200">
      Learn More →
    </span>
  </Link>
));

FeatureCard.displayName = 'FeatureCard';

const features: Feature[] = [
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

const Index = memo(() => {
  return (
    <div className="min-h-screen bg-background">
      <Hero />
      <StatsSection />
      
      {/* Features Section */}
      <section className="py-20 bg-gradient-to-b from-background to-secondary/20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 opacity-0 fade-in" style={{ animationDelay: '100ms', animationFillMode: 'forwards' }}>
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Everything You Need for 
              <span className="text-destructive"> Professional Gaming</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Comprehensive tools and features designed specifically for competitive gaming organizations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <FeatureCard key={feature.title} feature={feature} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* Discord CTA Button Section */}
      <section className="py-20 bg-gradient-to-b from-secondary/20 to-background">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            Join Our <span className="text-destructive">Discord Server</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Instantly connect with our community and stay updated with events, scrims, and announcements.
          </p>
          <a
            href="https://discord.gg/p38PeNGh"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-destructive hover:bg-destructive/90 text-destructive-foreground font-semibold py-4 px-8 rounded-xl shadow-lg transition-all duration-300 text-lg hover:scale-105 hover:shadow-destructive/25"
          >
            Join Our Discord
          </a>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-b from-background to-secondary/20">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Ready to Join the 
              <span className="text-destructive"> Elite?</span>
            </h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Take your gaming to the next level. Join Nitara Gaming and compete with the best players in the world.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/auth"
                className="bg-destructive hover:bg-destructive/90 text-destructive-foreground px-8 py-4 rounded-lg text-lg font-semibold transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-destructive/25"
              >
                Join Now
              </Link>
              <Link
                to="/games"
                className="border border-border hover:border-muted-foreground text-foreground px-8 py-4 rounded-lg text-lg font-semibold transition-all duration-300 hover:bg-secondary/50"
              >
                Explore Games
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
});

Index.displayName = 'Index';
   
export default Index;
