
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import TextType from './TextType';

const Hero = () => {
  const { user } = useAuth();

  return (
    <section className="relative min-h-screen bg-background dark:bg-gradient-to-br dark:from-background dark:via-muted dark:to-background flex items-center justify-center overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `linear-gradient(45deg, transparent 40%, hsl(var(--destructive) / 0.1) 50%, transparent 60%)`,
          backgroundSize: '60px 60px',
          animation: 'pulse 4s ease-in-out infinite alternate'
        }}></div>
      </div>

      {/* Team Image Background */}
      <div className="absolute inset-0 flex items-center justify-end pr-20 opacity-80">
        <div className="w-3/5 h-4/5 bg-gradient-to-l from-transparent via-muted/20 to-background/40 rounded-lg relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-background/60 to-transparent"></div>
          {/* Placeholder for team image */}
          <div className="w-full h-full bg-muted/30 flex items-center justify-center">
            <div className="grid grid-cols-5 gap-4 opacity-60">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="w-16 h-20 bg-border/50 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-bold text-foreground mb-6 leading-tight">
            {user ? (
              <>
                <TextType 
                  text={["Welcome Back to Nitara Gaming"]}
                  typingSpeed={75}
                  pauseDuration={1500}
                  showCursor={true}
                  cursorCharacter="|"
                  loop={false}
                  className="text-transparent bg-gradient-to-r from-destructive to-destructive/80 bg-clip-text"
                />
              </>
            ) : (
              <>
                <TextType 
                  text={["Welcome to Nitara Gaming", "The ultimate esports experience starts here"]}
                  typingSpeed={75}
                  pauseDuration={1500}
                  showCursor={true}
                  cursorCharacter="|"
                  className="text-transparent bg-gradient-to-r from-destructive to-destructive/80 bg-clip-text"
                />
              </>
            )}
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
            {user ? (
              "Ready to dominate the gaming arena? Check out the latest games and join your next tournament."
            ) : (
              "Welcome to Nitara Gaming, the ultimate destination for eSports teams and gaming enthusiasts. Join forces with elite players, showcase your skills, and dominate the competitive arena."
            )}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            {user ? (
              <>
                <Link
                  to="/dashboard"
                  className="bg-destructive hover:bg-destructive/90 text-destructive-foreground px-8 py-4 rounded-lg text-lg font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-destructive/25"
                >
                  Dashboard
                </Link>
                <Link
                  to="/games"
                  className="border border-border hover:border-muted-foreground text-foreground px-8 py-4 rounded-lg text-lg font-semibold transition-all duration-200 hover:bg-muted/50"
                >
                  Browse Games
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/auth"
                  className="bg-destructive hover:bg-destructive/90 text-destructive-foreground px-8 py-4 rounded-lg text-lg font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-destructive/25"
                >
                  Get Started
                </Link>
                <Link
                  to="/about"
                  className="border border-border hover:border-muted-foreground text-foreground px-8 py-4 rounded-lg text-lg font-semibold transition-all duration-200 hover:bg-muted/50"
                >
                  Know More
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Animated elements */}
      <div className="absolute top-20 left-20 w-2 h-2 bg-destructive rounded-full animate-pulse opacity-60"></div>
      <div className="absolute bottom-32 left-32 w-1 h-1 bg-destructive/80 rounded-full animate-pulse opacity-40"></div>
      <div className="absolute top-40 right-40 w-1.5 h-1.5 bg-destructive rounded-full animate-pulse opacity-50"></div>
    </section>
  );
};

export default Hero;
