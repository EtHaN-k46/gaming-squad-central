import React, { useState, useRef } from 'react';
import { Camera, Upload, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';

interface AvatarUploadProps {
  currentAvatarUrl?: string;
  onAvatarUpdate: (url: string) => void;
  userId: string;
}

export const AvatarUpload: React.FC<AvatarUploadProps> = ({
  currentAvatarUrl,
  onAvatarUpdate,
  userId,
}) => {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const uploadAvatar = async (file: File) => {
    setUploading(true);
    try {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        throw new Error('Please upload a valid image file (JPEG, PNG, or WebP)');
      }

      // Validate file size (max 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        throw new Error('File size must be less than 5MB');
      }

      // Delete existing avatar if any
      if (currentAvatarUrl) {
        const oldPath = currentAvatarUrl.split('/').pop();
        if (oldPath) {
          await supabase.storage
            .from('avatars')
            .remove([`${userId}/${oldPath}`]);
        }
      }

      // Create unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${userId}/${fileName}`;

      // Upload new avatar
      const { error: uploadError, data } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      onAvatarUpdate(publicUrl);
      
      toast({
        title: "Avatar updated!",
        description: "Your profile picture has been uploaded successfully.",
      });

    } catch (error: any) {
      console.error('Error uploading avatar:', error);
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload avatar. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      uploadAvatar(file);
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  const removeAvatar = async () => {
    if (!currentAvatarUrl) return;

    try {
      const oldPath = currentAvatarUrl.split('/').pop();
      if (oldPath) {
        await supabase.storage
          .from('avatars')
          .remove([`${userId}/${oldPath}`]);
      }

      onAvatarUpdate('');
      
      toast({
        title: "Avatar removed",
        description: "Your profile picture has been removed.",
      });

    } catch (error: any) {
      console.error('Error removing avatar:', error);
      toast({
        title: "Remove failed",
        description: "Failed to remove avatar. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="relative group">
        <Avatar className="h-32 w-32 border-4 border-gray-700">
          <AvatarImage 
            src={currentAvatarUrl} 
            alt="Profile picture"
            className="object-cover"
          />
          <AvatarFallback className="bg-gradient-to-br from-red-600 to-orange-600 text-white text-2xl">
            <Camera size={32} />
          </AvatarFallback>
        </Avatar>
        
        {/* Overlay for hover effect */}
        <div className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <Camera className="text-white" size={24} />
        </div>
      </div>

      <div className="flex gap-2">
        <Button
          onClick={triggerFileSelect}
          disabled={uploading}
          variant="outline"
          size="sm"
          className="text-white border-gray-600 hover:bg-gray-800"
        >
          {uploading ? (
            <>Uploading...</>
          ) : (
            <>
              <Upload size={16} className="mr-2" />
              {currentAvatarUrl ? 'Change' : 'Upload'}
            </>
          )}
        </Button>

        {currentAvatarUrl && (
          <Button
            onClick={removeAvatar}
            variant="outline"
            size="sm"
            className="text-red-400 border-red-600 hover:bg-red-900/20"
          >
            <X size={16} className="mr-2" />
            Remove
          </Button>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        onChange={handleFileSelect}
        className="hidden"
      />

      <p className="text-xs text-gray-400 text-center max-w-xs">
        Upload a profile picture. Supported formats: JPEG, PNG, WebP. Max size: 5MB.
      </p>
    </div>
  );
};