
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, User, Mail } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { LoadingButton } from '@/components/ui/button-loading';
import NotificationBanner from '@/components/NotificationBanner';
import { SecurityValidator, RateLimiter, cleanupAuthState } from '@/utils/security';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [csrfToken, setCsrfToken] = useState('');
  
  const { signIn, signUp, signOut, user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/');
    }
    // Generate CSRF token
    setCsrfToken(SecurityValidator.generateCSRFToken());
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Rate limiting check
    const clientId = `${navigator.userAgent}_${window.location.hostname}`;
    if (RateLimiter.isRateLimited(clientId, 5, 15 * 60 * 1000)) {
      toast({
        title: "Too many attempts",
        description: "Please wait 15 minutes before trying again.",
        variant: "destructive",
      });
      return;
    }

    // Input validation
    if (!SecurityValidator.validateEmail(email)) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }

    if (!isLogin) {
      const passwordValidation = SecurityValidator.validatePassword(password);
      if (!passwordValidation.isValid) {
        toast({
          title: "Weak password",
          description: passwordValidation.errors.join(', '),
          variant: "destructive",
        });
        return;
      }

      if (!SecurityValidator.validateUsername(username)) {
        toast({
          title: "Invalid username",
          description: "Username must be 3-30 characters and contain only letters, numbers, underscores, and hyphens.",
          variant: "destructive",
        });
        return;
      }

      if (!SecurityValidator.validateText(firstName, 50) || !SecurityValidator.validateText(lastName, 50)) {
        toast({
          title: "Invalid name",
          description: "Names must contain only letters, numbers, and basic punctuation.",
          variant: "destructive",
        });
        return;
      }
    }

    setLoading(true);

    try {
      // Clean up existing auth state before signing in
      cleanupAuthState();
      
      // Attempt global sign out to clear any existing sessions
      try {
        await signOut();
      } catch (err) {
        // Continue even if this fails
      }
      if (isLogin) {
        const { error } = await signIn(SecurityValidator.sanitizeInput(email), password);
        if (error) {
          toast({
            title: "Error signing in",
            description: error.message,
            variant: "destructive",
          });
        } else {
          RateLimiter.clearAttempts(clientId); // Clear rate limit on success
          toast({
            title: "Welcome back!",
            description: "You have been signed in successfully.",
          });
          // Force page reload for security
          window.location.href = '/';
        }
      } else {
        const { error } = await signUp(SecurityValidator.sanitizeInput(email), password, {
          first_name: SecurityValidator.sanitizeInput(firstName),
          last_name: SecurityValidator.sanitizeInput(lastName),
          username: SecurityValidator.sanitizeInput(username),
        });
        if (error) {
          toast({
            title: "Error signing up",
            description: error.message,
            variant: "destructive",
          });
        } else {
          RateLimiter.clearAttempts(clientId); // Clear rate limit on success
          toast({
            title: "Account created!",
            description: "Please check your email to verify your account.",
          });
        }
      }
    } catch (error: any) {
      toast({
        title: "An error occurred",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center py-20">
      <div className="container mx-auto px-4">
        <div className="max-w-md mx-auto">
          <div className="bg-gray-900/50 rounded-xl p-8 border border-gray-800">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-xl">N</span>
              </div>
              <h1 className="text-3xl font-bold text-white mb-2">
                {isLogin ? 'Welcome Back' : 'Join Nitara Gaming'}
              </h1>
              <p className="text-gray-400">
                {isLogin ? 'Sign in to your account' : 'Create your gaming account'}
              </p>
            </div>

            {!isLogin && (
              <NotificationBanner
                message="After signing up, please check your email to verify your account before signing in."
                type="info"
                dismissible={false}
              />
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <input type="hidden" name="csrf_token" value={csrfToken} />
              {!isLogin && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-300 text-sm font-medium mb-2">
                        First Name
                      </label>
                      <input
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(SecurityValidator.sanitizeInput(e.target.value))}
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
                        placeholder="John"
                        maxLength={50}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-gray-300 text-sm font-medium mb-2">
                        Last Name
                      </label>
                      <input
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(SecurityValidator.sanitizeInput(e.target.value))}
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
                        placeholder="Doe"
                        maxLength={50}
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">
                      Username
                    </label>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(SecurityValidator.sanitizeInput(e.target.value))}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
                      placeholder="gamerpro123"
                      maxLength={30}
                      pattern="[a-zA-Z0-9_-]{3,30}"
                      title="Username must be 3-30 characters and contain only letters, numbers, underscores, and hyphens"
                      required
                    />
                  </div>
                </>
              )}

              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(SecurityValidator.sanitizeInput(e.target.value))}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
                  placeholder="Enter your email"
                  maxLength={254}
                  autoComplete="email"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500 pr-12"
                    placeholder="Enter your password"
                    minLength={8}
                    maxLength={128}
                    autoComplete={isLogin ? "current-password" : "new-password"}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3.5 text-gray-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <LoadingButton
                type="submit"
                loading={loading}
                loadingText="Please wait..."
                className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
              >
                {isLogin ? 'Sign In' : 'Sign Up'}
              </LoadingButton>
            </form>

            <div className="mt-8 text-center">
              <p className="text-gray-400">
                {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
                <button
                  onClick={() => setIsLogin(!isLogin)}
                  className="text-red-500 hover:text-red-400 font-medium"
                >
                  {isLogin ? 'Sign up' : 'Sign in'}
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
