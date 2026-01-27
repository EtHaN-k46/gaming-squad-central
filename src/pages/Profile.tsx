import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { ProfileForm } from '@/components/profile/ProfileForm';
import { ProfileSidebar } from '@/components/profile/ProfileSidebar';
import type { ProfileUpdateData } from '@/lib/validation/profile';

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
        // Data from DB is trusted but we still handle null values safely
        setProfile({
          id: data.id,
          username: data.username || '',
          first_name: data.first_name || '',
          last_name: data.last_name || '',
          bio: data.bio || '',
          avatar_url: data.avatar_url || '',
        });
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred';
      toast({
        title: 'Error loading profile',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpdate = (url: string) => {
    setProfile((prev) => ({ ...prev, avatar_url: url }));
  };

  const handleProfileUpdate = (data: ProfileUpdateData) => {
    setProfile((prev) => ({
      ...prev,
      username: data.username,
      first_name: data.first_name,
      last_name: data.last_name,
      bio: data.bio,
    }));
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
            <p className="text-xl text-gray-400">Manage your gaming profile</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Profile Summary Sidebar */}
            <div className="lg:col-span-1">
              <ProfileSidebar
                userId={user.id}
                email={user.email || ''}
                username={profile.username}
                firstName={profile.first_name}
                lastName={profile.last_name}
                avatarUrl={profile.avatar_url}
                onAvatarUpdate={handleAvatarUpdate}
              />
            </div>

            {/* Profile Form */}
            <div className="lg:col-span-2">
              <ProfileForm
                userId={user.id}
                initialData={{
                  username: profile.username,
                  first_name: profile.first_name,
                  last_name: profile.last_name,
                  bio: profile.bio,
                  avatar_url: profile.avatar_url,
                }}
                onUpdate={handleProfileUpdate}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
