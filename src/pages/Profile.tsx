
import React, { useState, useEffect } from 'react';
import { User, Save } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { LoadingButton } from '@/components/ui/button-loading';
import { AvatarUpload } from '@/components/AvatarUpload';

interface ProfileData {
  id: string;
  username: string;
  first_name: string;
  last_name: string;
  bio: string;
  avatar_url: string;
}

const Profile = () => {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<ProfileData>({
    id: '',
    username: '',
    first_name: '',
    last_name: '',
    bio: '',
    avatar_url: '',
  });

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setProfile(data);
      }
    } catch (error: any) {
      toast({
        title: "Error loading profile",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  const handleAvatarUpdate = (url: string) => {
    setProfile(prev => ({ ...prev, avatar_url: url }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user?.id,
          username: profile.username,
          first_name: profile.first_name,
          last_name: profile.last_name,
          bio: profile.bio,
          avatar_url: profile.avatar_url,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;

      toast({
        title: "Profile updated!",
        description: "Your profile has been saved successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error saving profile",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-black pt-20 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-black pt-20">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-white mb-6">
              Player <span className="text-red-500">Profile</span>
            </h1>
            <p className="text-xl text-gray-400">
              Manage your gaming profile
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Profile Summary */}
            <div className="lg:col-span-1">
              <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-800 sticky top-24">
                <div className="text-center mb-6">
                  <AvatarUpload
                    userId={user.id}
                    currentAvatarUrl={profile.avatar_url}
                    onAvatarUpdate={handleAvatarUpdate}
                  />
                  <h3 className="text-xl font-bold text-white mt-4">{profile.username || 'Set username'}</h3>
                  <p className="text-gray-400">{user.email}</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="text-white font-semibold mb-2">Full Name</h4>
                    <div className="bg-gray-800/50 px-3 py-2 rounded-lg">
                      <span className="text-gray-300">
                        {profile.first_name || profile.last_name 
                          ? `${profile.first_name} ${profile.last_name}`.trim()
                          : 'Not set'
                        }
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Profile Form */}
            <div className="lg:col-span-2">
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Basic Information */}
                <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-800">
                  <h3 className="text-xl font-bold text-white mb-6">Basic Information</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-gray-300 text-sm font-medium mb-2">Username</label>
                      <input
                        type="text"
                        name="username"
                        value={profile.username}
                        onChange={handleInputChange}
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
                        placeholder="Enter your username"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-300 text-sm font-medium mb-2">Email</label>
                      <input
                        type="email"
                        value={user.email || ''}
                        disabled
                        className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-3 text-gray-400 cursor-not-allowed"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-300 text-sm font-medium mb-2">First Name</label>
                      <input
                        type="text"
                        name="first_name"
                        value={profile.first_name}
                        onChange={handleInputChange}
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
                        placeholder="Enter your first name"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-300 text-sm font-medium mb-2">Last Name</label>
                      <input
                        type="text"
                        name="last_name"
                        value={profile.last_name}
                        onChange={handleInputChange}
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
                        placeholder="Enter your last name"
                      />
                    </div>
                  </div>

                  <div className="mt-6">
                    <label className="block text-gray-300 text-sm font-medium mb-2">Bio</label>
                    <textarea
                      name="bio"
                      value={profile.bio}
                      onChange={handleInputChange}
                      rows={4}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
                      placeholder="Tell us about your gaming experience..."
                    />
                  </div>
                </div>

                {/* Save Button */}
                <div className="text-center">
                  <LoadingButton
                    type="submit"
                    loading={saving}
                    loadingText="Saving..."
                    className="bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-lg font-semibold inline-flex items-center transition-colors"
                  >
                    <Save className="mr-2" size={20} />
                    Save Profile
                  </LoadingButton>
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
