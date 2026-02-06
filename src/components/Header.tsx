
import React, { useState, useCallback, memo } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, LogOut, User, ChevronDown } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const gameRoutes = [
  { name: 'Apex Legends', path: '/apex-legends' },
  { name: 'Valorant', path: '/valorant' },
  { name: 'Call of Duty', path: '/call-of-duty' },
  { name: 'Call of Duty Mobile', path: '/call-of-duty-mobile' },
  { name: 'Siege X', path: '/siege-x' }
] as const;

const Header = memo(() => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { toast } = useToast();

  const isActive = useCallback((path: string) => location.pathname === path, [location.pathname]);

  const navItems = [
    { name: 'Home', path: '/' },
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'About Us', path: '/about' },
    { name: 'Calendar', path: '/calendar' },
    { name: 'Players', path: '/players' },
    ...(user ? [{ name: 'Profile', path: '/profile' }] : []),
  ];

  const handleSignOut = useCallback(async () => {
    try {
      await signOut();
      toast({
        title: "Signed out successfully",
        description: "You have been logged out of your account.",
      });
      navigate('/');
    } catch (error: any) {
      toast({
        title: "Error signing out",
        description: error.message,
        variant: "destructive",
      });
    }
  }, [signOut, toast, navigate]);

  const closeMenu = useCallback(() => setIsMenuOpen(false), []);
  const toggleMenu = useCallback(() => setIsMenuOpen(prev => !prev), []);

  return (
    <header className="bg-background/95 backdrop-blur-sm border-b border-border sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="w-8 h-8 rounded-full flex items-center justify-center transition-transform duration-200 group-hover:scale-110">
              <img 
                src="/lovable-uploads/a1fca067-d591-4c53-9625-1589f2126a59.png" 
                alt="Nitara Gaming" 
                className="w-8 h-8 object-contain"
                loading="eager"
              />
            </div>
            <span className="text-foreground font-bold text-xl">Nitara Gaming</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className={`transition-colors duration-200 relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-destructive after:transition-all after:duration-300 hover:after:w-full ${
                  isActive(item.path)
                    ? 'text-destructive after:w-full'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {item.name}
              </Link>
            ))}
            
            {/* Games Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center space-x-1 text-muted-foreground hover:text-foreground transition-colors duration-200">
                <span>Games</span>
                <ChevronDown size={16} className="transition-transform duration-200 group-data-[state=open]:rotate-180" />
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-popover border-border animate-in fade-in-0 zoom-in-95 slide-in-from-top-2">
                {gameRoutes.map((game) => (
                  <DropdownMenuItem key={game.path} asChild>
                    <Link
                      to={game.path}
                      className="text-muted-foreground hover:text-foreground hover:bg-accent focus:bg-accent focus:text-foreground transition-colors duration-150"
                    >
                      {game.name}
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>

          {/* Right side buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-4">
                <Link
                  to="/profile"
                  className="flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-colors duration-200"
                >
                  <User size={20} />
                  <span>Profile</span>
                </Link>
                <button
                  onClick={handleSignOut}
                  className="flex items-center space-x-2 bg-secondary hover:bg-secondary/80 text-secondary-foreground px-4 py-2 rounded-lg transition-all duration-200 hover:scale-105"
                >
                  <LogOut size={16} />
                  <span>Sign Out</span>
                </button>
              </div>
            ) : (
              <Link
                to="/auth"
                className="bg-destructive hover:bg-destructive/90 text-destructive-foreground px-4 py-2 rounded-lg transition-all duration-200 hover:scale-105 hover:shadow-lg hover:shadow-destructive/25"
              >
                Sign In
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden text-muted-foreground hover:text-foreground transition-colors duration-200"
            onClick={toggleMenu}
            aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
          >
            <div className="relative w-6 h-6">
              <Menu 
                size={24} 
                className={`absolute inset-0 transition-all duration-300 ${isMenuOpen ? 'opacity-0 rotate-90' : 'opacity-100 rotate-0'}`} 
              />
              <X 
                size={24} 
                className={`absolute inset-0 transition-all duration-300 ${isMenuOpen ? 'opacity-100 rotate-0' : 'opacity-0 -rotate-90'}`} 
              />
            </div>
          </button>
        </div>

        {/* Mobile Navigation */}
        <div 
          className={`md:hidden overflow-hidden transition-all duration-300 ease-out ${
            isMenuOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <nav className="py-4 border-t border-border flex flex-col space-y-4">
            {navItems.map((item, index) => (
              <Link
                key={item.name}
                to={item.path}
                className={`transition-all duration-200 transform ${
                  isActive(item.path)
                    ? 'text-destructive'
                    : 'text-muted-foreground hover:text-foreground'
                } ${isMenuOpen ? 'translate-x-0 opacity-100' : '-translate-x-4 opacity-0'}`}
                style={{ transitionDelay: `${index * 50}ms` }}
                onClick={closeMenu}
              >
                {item.name}
              </Link>
            ))}
            
            {/* Mobile Games Links */}
            <div className="border-t border-border pt-4">
              <span className="text-muted-foreground text-sm font-semibold mb-2 block">Games</span>
              {gameRoutes.map((game, index) => (
                <Link
                  key={game.path}
                  to={game.path}
                  className={`text-muted-foreground hover:text-foreground transition-all duration-200 block py-1 pl-4 ${
                    isMenuOpen ? 'translate-x-0 opacity-100' : '-translate-x-4 opacity-0'
                  }`}
                  style={{ transitionDelay: `${(navItems.length + index) * 50}ms` }}
                  onClick={closeMenu}
                >
                  {game.name}
                </Link>
              ))}
            </div>
            
            {user ? (
              <button
                onClick={() => {
                  handleSignOut();
                  closeMenu();
                }}
                className="bg-secondary hover:bg-secondary/80 text-secondary-foreground px-4 py-2 rounded-lg transition-all duration-200 w-fit flex items-center space-x-2"
              >
                <LogOut size={16} />
                <span>Sign Out</span>
              </button>
            ) : (
              <Link
                to="/auth"
                className="bg-destructive hover:bg-destructive/90 text-destructive-foreground px-4 py-2 rounded-lg transition-all duration-200 w-fit"
                onClick={closeMenu}
              >
                Sign In
              </Link>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
});

Header.displayName = 'Header';

export default Header;
