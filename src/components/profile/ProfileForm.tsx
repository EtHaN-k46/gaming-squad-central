import React, { useState } from 'react';
import { Save } from 'lucide-react';
import { LoadingButton } from '@/components/ui/button-loading';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  profileUpdateSchema, 
  PROFILE_LIMITS,
  type ProfileUpdateData 
} from '@/lib/validation/profile';

interface ProfileFormProps {
  userId: string;
  initialData: {
    username: string;
    first_name: string;
    last_name: string;
    bio: string;
    avatar_url: string;
  };
  onUpdate: (data: ProfileUpdateData) => void;
}

interface FieldErrors {
  username?: string;
  first_name?: string;
  last_name?: string;
  bio?: string;
}

export const ProfileForm: React.FC<ProfileFormProps> = ({
  userId,
  initialData,
  onUpdate,
}) => {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState(initialData);
  const [errors, setErrors] = useState<FieldErrors>({});

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Clear field error on change
    if (errors[name as keyof FieldErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const validateField = (name: string, value: string): string | undefined => {
    const testData = { ...formData, [name]: value };
    const result = profileUpdateSchema.safeParse(testData);
    
    if (!result.success) {
      const fieldError = result.error.errors.find(
        (err) => err.path[0] === name
      );
      return fieldError?.message;
    }
    return undefined;
  };

  const handleBlur = (
    e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    const error = validateField(name, value);
    if (error) {
      setErrors((prev) => ({ ...prev, [name]: error }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate all fields using Zod schema
    const result = profileUpdateSchema.safeParse(formData);
    
    if (!result.success) {
      const fieldErrors: FieldErrors = {};
      result.error.errors.forEach((err) => {
        const field = err.path[0] as keyof FieldErrors;
        if (!fieldErrors[field]) {
          fieldErrors[field] = err.message;
        }
      });
      setErrors(fieldErrors);
      
      toast({
        title: 'Validation Error',
        description: 'Please fix the highlighted fields.',
        variant: 'destructive',
      });
      return;
    }

    // Data is now sanitized by Zod transforms
    const sanitizedData = result.data;

    setSaving(true);

    try {
      const { error } = await supabase.from('profiles').upsert({
        id: userId,
        username: sanitizedData.username,
        first_name: sanitizedData.first_name,
        last_name: sanitizedData.last_name,
        bio: sanitizedData.bio,
        avatar_url: sanitizedData.avatar_url || formData.avatar_url,
        updated_at: new Date().toISOString(),
      });

      if (error) throw error;

      // Update parent with sanitized data
      onUpdate(sanitizedData);

      toast({
        title: 'Profile updated!',
        description: 'Your profile has been saved successfully.',
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred';
      toast({
        title: 'Error saving profile',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Basic Information */}
      <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-800">
        <h3 className="text-xl font-bold text-white mb-6">Basic Information</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Username */}
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">
              Username
              <span className="text-gray-500 ml-2">
                ({PROFILE_LIMITS.username.min}-{PROFILE_LIMITS.username.max} chars)
              </span>
            </label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              onBlur={handleBlur}
              className={`w-full bg-gray-800 border rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-1 ${
                errors.username
                  ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                  : 'border-gray-700 focus:border-red-500 focus:ring-red-500'
              }`}
              placeholder="Enter your username"
              maxLength={PROFILE_LIMITS.username.max}
              pattern="[a-zA-Z0-9_.-]{3,30}"
              title="Username can only contain letters, numbers, underscores, hyphens, and dots"
            />
            {errors.username && (
              <p className="mt-1 text-sm text-red-400">{errors.username}</p>
            )}
          </div>

          {/* Email (read-only) */}
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">
              Email
            </label>
            <input
              type="email"
              value={initialData.username ? '' : '(loading...)'}
              disabled
              className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-3 text-gray-400 cursor-not-allowed"
            />
          </div>

          {/* First Name */}
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">
              First Name
              <span className="text-gray-500 ml-2">
                (max {PROFILE_LIMITS.firstName.max} chars)
              </span>
            </label>
            <input
              type="text"
              name="first_name"
              value={formData.first_name}
              onChange={handleInputChange}
              onBlur={handleBlur}
              className={`w-full bg-gray-800 border rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-1 ${
                errors.first_name
                  ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                  : 'border-gray-700 focus:border-red-500 focus:ring-red-500'
              }`}
              placeholder="Enter your first name"
              maxLength={PROFILE_LIMITS.firstName.max}
            />
            {errors.first_name && (
              <p className="mt-1 text-sm text-red-400">{errors.first_name}</p>
            )}
          </div>

          {/* Last Name */}
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">
              Last Name
              <span className="text-gray-500 ml-2">
                (max {PROFILE_LIMITS.lastName.max} chars)
              </span>
            </label>
            <input
              type="text"
              name="last_name"
              value={formData.last_name}
              onChange={handleInputChange}
              onBlur={handleBlur}
              className={`w-full bg-gray-800 border rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-1 ${
                errors.last_name
                  ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                  : 'border-gray-700 focus:border-red-500 focus:ring-red-500'
              }`}
              placeholder="Enter your last name"
              maxLength={PROFILE_LIMITS.lastName.max}
            />
            {errors.last_name && (
              <p className="mt-1 text-sm text-red-400">{errors.last_name}</p>
            )}
          </div>
        </div>

        {/* Bio */}
        <div className="mt-6">
          <label className="block text-gray-300 text-sm font-medium mb-2">
            Bio
            <span className="text-gray-500 ml-2">
              (max {PROFILE_LIMITS.bio.max} chars, plain text only)
            </span>
          </label>
          <textarea
            name="bio"
            value={formData.bio}
            onChange={handleInputChange}
            onBlur={handleBlur}
            rows={4}
            className={`w-full bg-gray-800 border rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-1 ${
              errors.bio
                ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                : 'border-gray-700 focus:border-red-500 focus:ring-red-500'
            }`}
            placeholder="Tell us about your gaming experience..."
            maxLength={PROFILE_LIMITS.bio.max}
          />
          <div className="flex justify-between mt-1">
            {errors.bio ? (
              <p className="text-sm text-red-400">{errors.bio}</p>
            ) : (
              <span />
            )}
            <span className="text-xs text-gray-500">
              {formData.bio.length}/{PROFILE_LIMITS.bio.max}
            </span>
          </div>
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
  );
};
