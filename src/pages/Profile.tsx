
import React, { useState } from 'react';
import { User, Mail, Twitter, Twitch, Youtube, Save } from 'lucide-react';

const Profile = () => {
  const [formData, setFormData] = useState({
    username: 'GamerPro123',
    email: 'gamer@example.com',
    firstName: 'John',
    lastName: 'Doe',
    bio: 'Competitive gamer with 5+ years experience in FPS games.',
    gamePreferences: ['apex-legends', 'valorant'],
    teamAssignment: 'team-1',
    socials: {
      twitter: '@gamerpro123',
      twitch: 'gamerpro123',
      youtube: 'GamerPro Gaming'
    }
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name.startsWith('socials.')) {
      const socialPlatform = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        socials: {
          ...prev.socials,
          [socialPlatform]: value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleGamePreferenceChange = (gameId: string) => {
    setFormData(prev => ({
      ...prev,
      gamePreferences: prev.gamePreferences.includes(gameId)
        ? prev.gamePreferences.filter(id => id !== gameId)
        : [...prev.gamePreferences, gameId]
    }));
  };

  const games = [
    { id: 'apex-legends', name: 'Apex Legends' },
    { id: 'valorant', name: 'Valorant' },
    { id: 'call-of-duty', name: 'Call of Duty' },
    { id: 'siege-x', name: 'Siege X' },
    { id: 'call-of-duty-mobile', name: 'Call of Duty Mobile' }
  ];

  return (
    <div className="min-h-screen bg-black pt-20">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-white mb-6">
              Player <span className="text-red-500">Profile</span>
            </h1>
            <p className="text-xl text-gray-400">
              Manage your gaming profile and team assignments
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Profile Summary */}
            <div className="lg:col-span-1">
              <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-800 sticky top-24">
                <div className="text-center mb-6">
                  <div className="w-24 h-24 bg-gradient-to-br from-red-600 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <User className="text-white" size={32} />
                  </div>
                  <h3 className="text-xl font-bold text-white">{formData.username}</h3>
                  <p className="text-gray-400">{formData.email}</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="text-white font-semibold mb-2">Active Games</h4>
                    <div className="space-y-2">
                      {formData.gamePreferences.map(gameId => {
                        const game = games.find(g => g.id === gameId);
                        return (
                          <div key={gameId} className="bg-red-600/20 text-red-400 px-3 py-1 rounded-lg text-sm">
                            {game?.name}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-white font-semibold mb-2">Team Assignment</h4>
                    <div className="bg-gray-800/50 px-3 py-2 rounded-lg">
                      <span className="text-gray-300 capitalize">
                        {formData.teamAssignment.replace('-', ' ')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Profile Form */}
            <div className="lg:col-span-2">
              <form className="space-y-8">
                {/* Basic Information */}
                <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-800">
                  <h3 className="text-xl font-bold text-white mb-6">Basic Information</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-gray-300 text-sm font-medium mb-2">Username</label>
                      <input
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleInputChange}
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-300 text-sm font-medium mb-2">Email</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-300 text-sm font-medium mb-2">First Name</label>
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-300 text-sm font-medium mb-2">Last Name</label>
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
                      />
                    </div>
                  </div>

                  <div className="mt-6">
                    <label className="block text-gray-300 text-sm font-medium mb-2">Bio</label>
                    <textarea
                      name="bio"
                      value={formData.bio}
                      onChange={handleInputChange}
                      rows={4}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
                      placeholder="Tell us about your gaming experience..."
                    />
                  </div>
                </div>

                {/* Game Preferences */}
                <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-800">
                  <h3 className="text-xl font-bold text-white mb-6">Game Preferences</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {games.map(game => (
                      <label key={game.id} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.gamePreferences.includes(game.id)}
                          onChange={() => handleGamePreferenceChange(game.id)}
                          className="w-4 h-4 text-red-600 bg-gray-800 border-gray-600 rounded focus:ring-red-500"
                        />
                        <span className="ml-3 text-gray-300">{game.name}</span>
                      </label>
                    ))}
                  </div>

                  <div className="mt-6">
                    <label className="block text-gray-300 text-sm font-medium mb-2">Team Assignment</label>
                    <select
                      name="teamAssignment"
                      value={formData.teamAssignment}
                      onChange={handleInputChange}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
                    >
                      <option value="team-1">Team 1</option>
                      <option value="team-2">Team 2</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                {/* Social Media */}
                <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-800">
                  <h3 className="text-xl font-bold text-white mb-6">Social Media</h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center space-x-4">
                      <Twitter className="text-blue-400" size={20} />
                      <input
                        type="text"
                        name="socials.twitter"
                        value={formData.socials.twitter}
                        onChange={handleInputChange}
                        placeholder="@username"
                        className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
                      />
                    </div>

                    <div className="flex items-center space-x-4">
                      <Twitch className="text-purple-400" size={20} />
                      <input
                        type="text"
                        name="socials.twitch"
                        value={formData.socials.twitch}
                        onChange={handleInputChange}
                        placeholder="username"
                        className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
                      />
                    </div>

                    <div className="flex items-center space-x-4">
                      <Youtube className="text-red-500" size={20} />
                      <input
                        type="text"
                        name="socials.youtube"
                        value={formData.socials.youtube}
                        onChange={handleInputChange}
                        placeholder="Channel Name"
                        className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Save Button */}
                <div className="text-center">
                  <button
                    type="submit"
                    className="bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-lg font-semibold inline-flex items-center transition-colors"
                  >
                    <Save className="mr-2" size={20} />
                    Save Profile
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
