import React from 'react';
import { AvatarUpload } from '@/components/AvatarUpload';

interface ProfileSidebarProps {
  userId: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  avatarUrl: string;
  onAvatarUpdate: (url: string) => void;
}

/**
 * Profile sidebar component displaying user summary
 * All text content is rendered using React's safe JSX escaping
 */
export const ProfileSidebar: React.FC<ProfileSidebarProps> = ({
  userId,
  email,
  username,
  firstName,
  lastName,
  avatarUrl,
  onAvatarUpdate,
}) => {
  // React's JSX automatically escapes these values, preventing XSS
  const displayName = username || 'Set username';
  const fullName =
    firstName || lastName
      ? `${firstName} ${lastName}`.trim()
      : 'Not set';

  return (
    <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-800 sticky top-24">
      <div className="text-center mb-6">
        <AvatarUpload
          userId={userId}
          currentAvatarUrl={avatarUrl}
          onAvatarUpdate={onAvatarUpdate}
        />
        {/* 
          React automatically escapes text content, so even if username 
          contains "<script>", it will be rendered as text, not executed.
          This is the safe default rendering pattern.
        */}
        <h3 className="text-xl font-bold text-white mt-4">{displayName}</h3>
        <p className="text-gray-400">{email}</p>
      </div>

      <div className="space-y-4">
        <div>
          <h4 className="text-white font-semibold mb-2">Full Name</h4>
          <div className="bg-gray-800/50 px-3 py-2 rounded-lg">
            {/* Safe rendering - React escapes the content */}
            <span className="text-gray-300">{fullName}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
