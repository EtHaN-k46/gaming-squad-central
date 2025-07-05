import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from '@/hooks/useUserRole';
import { Navigate } from 'react-router-dom';
import { Users, Calendar, Trophy, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const { role, loading: roleLoading } = useUserRole();

  if (authLoading || roleLoading) {
    return (
      <div className="min-h-screen bg-black pt-20 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const quickActions = [
    {
      title: 'View Calendar',
      description: 'Check practice schedules and events',
      icon: Calendar,
      link: '/calendar',
      color: 'from-blue-500 to-blue-600'
    },
    {
      title: 'Player Management',
      description: 'Manage team rosters and players',
      icon: Users,
      link: '/players',
      color: 'from-green-500 to-green-600',
      adminOnly: true
    },
    {
      title: 'Game Divisions',
      description: 'Browse all competitive divisions',
      icon: Trophy,
      link: '/games',
      color: 'from-purple-500 to-purple-600'
    },
    {
      title: 'Profile Settings',
      description: 'Update your gaming profile',
      icon: Settings,
      link: '/profile',
      color: 'from-red-500 to-red-600'
    }
  ];

  const visibleActions = quickActions.filter(action => 
    !action.adminOnly || (role === 'admin' || role === 'division_head')
  );

  return (
    <div className="min-h-screen bg-black pt-20">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-white mb-6">
              Welcome Back, <span className="text-red-500">{user.email?.split('@')[0]}</span>
            </h1>
            <p className="text-xl text-gray-400">
              Ready to dominate the gaming arena? Here's your command center.
            </p>
          </div>

          {/* Role Badge */}
          {role && role !== 'user' && (
            <div className="flex justify-center mb-8">
              <div className="bg-gradient-to-r from-red-600 to-orange-600 px-4 py-2 rounded-full">
                <span className="text-white font-semibold capitalize">
                  {role.replace('_', ' ')}
                </span>
              </div>
            </div>
          )}

          {/* Quick Actions Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {visibleActions.map((action, index) => (
              <Link
                key={index}
                to={action.link}
                className="group bg-gray-900/50 rounded-xl p-6 border border-gray-800 hover:border-red-600/50 transition-all duration-300 transform hover:scale-105 hover:shadow-xl hover:shadow-red-600/10"
              >
                <div className={`w-12 h-12 bg-gradient-to-r ${action.color} rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <action.icon className="text-white" size={24} />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{action.title}</h3>
                <p className="text-gray-400 text-sm mb-4">{action.description}</p>
                <span className="text-red-500 text-sm font-semibold group-hover:text-red-400 transition-colors">
                  Access →
                </span>
              </Link>
            ))}
          </div>

          {/* Recent Activity Section */}
          <div className="mt-12">
            <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-800">
              <h2 className="text-2xl font-bold text-white mb-6">Quick Stats</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-red-500 mb-2">5</div>
                  <p className="text-gray-400">Active Divisions</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-500 mb-2">12</div>
                  <p className="text-gray-400">This Month's Events</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-500 mb-2">50+</div>
                  <p className="text-gray-400">Active Players</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;