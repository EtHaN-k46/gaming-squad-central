import React, { useState, useRef } from 'react';
import { Camera, Upload, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';

interface AvatarUploadProps {
  userId: string;
  currentAvatarUrl?: string;
  onAvatarUpdate: (url: string) => void;
  username?: string;
}

export const AvatarUpload: React.FC<AvatarUploadProps> = ({
  userId,
  currentAvatarUrl,
  onAvatarUpdate,
  username = 'User'
}) => {
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file.",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select an image smaller than 5MB.",
        variant: "destructive",
      });
      return;
    }

    // Create preview
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);

    // Upload file
    await uploadAvatar(file);

    // Clean up object URL
    URL.revokeObjectURL(objectUrl);
    setPreviewUrl(null);
  };

  const uploadAvatar = async (file: File) => {
    setUploading(true);
    try {
      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/avatar.${fileExt}`;

      // Delete existing avatar if it exists
      if (currentAvatarUrl) {
        const oldFileName = currentAvatarUrl.split('/').pop();
        if (oldFileName) {
          await supabase.storage
            .from('avatars')
            .remove([`${userId}/${oldFileName}`]);
        }
      }

      // Upload new avatar
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      if (data?.publicUrl) {
        onAvatarUpdate(data.publicUrl);
        toast({
          title: "Avatar updated!",
          description: "Your profile picture has been updated successfully.",
        });
      }
    } catch (error: any) {
      console.error('Error uploading avatar:', error);
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload avatar.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const removeAvatar = async () => {
    if (!currentAvatarUrl) return;

    try {
      const fileName = currentAvatarUrl.split('/').pop();
      if (fileName) {
        const { error } = await supabase.storage
          .from('avatars')
          .remove([`${userId}/${fileName}`]);

        if (error) throw error;

        onAvatarUpdate('');
        toast({
          title: "Avatar removed",
          description: "Your profile picture has been removed.",
        });
      }
    } catch (error: any) {
      console.error('Error removing avatar:', error);
      toast({
        title: "Remove failed",
        description: error.message || "Failed to remove avatar.",
        variant: "destructive",
      });
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const displayUrl = previewUrl || currentAvatarUrl;

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="relative group">
        <Avatar className="w-24 h-24 border-2 border-gray-600">
          {displayUrl ? (
            <AvatarImage 
              src={displayUrl} 
              alt={`${username}'s avatar`}
              className="object-cover"
            />
          ) : (
            <AvatarFallback className="bg-gradient-to-br from-red-600 to-orange-600 text-white text-lg font-semibold">
              {getInitials(username)}
            </AvatarFallback>
          )}
        </Avatar>
        
        {/* Overlay with upload icon */}
        <div 
          className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
          onClick={triggerFileSelect}
        >
          <Camera className="text-white" size={20} />
        </div>

        {/* Remove button */}
        {currentAvatarUrl && !uploading && (
          <button
            onClick={removeAvatar}
            className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1 hover:bg-red-700 transition-colors"
            title="Remove avatar"
          >
            <X size={12} />
          </button>
        )}
      </div>

      <div className="flex flex-col items-center space-y-2">
        <Button
          onClick={triggerFileSelect}
          disabled={uploading}
          variant="outline"
          size="sm"
          className="border-gray-600 text-gray-300 hover:text-white hover:border-red-500"
        >
          <Upload className="mr-2" size={16} />
          {uploading ? 'Uploading...' : 'Upload Photo'}
        </Button>
        
        <p className="text-xs text-gray-400 text-center">
          Click to upload or change your profile picture
          <br />
          Max size: 5MB • JPG, PNG, GIF
        </p>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
};