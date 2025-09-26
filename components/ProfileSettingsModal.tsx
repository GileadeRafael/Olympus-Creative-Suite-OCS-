import React, { useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '../services/supabaseClient';
import ImageUploader from './ImageUploader';
import { getPublicUrl } from '../lib/utils';

interface ProfileSettingsModalProps {
  user: User;
  onClose: () => void;
}

const ProfileSettingsModal: React.FC<ProfileSettingsModalProps> = ({ user, onClose }) => {
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  
  const currentAvatarUrl = user.user_metadata?.avatar_url ? getPublicUrl(user.user_metadata.avatar_url) : undefined;


  const handleUpdate = async () => {
    if (!avatarFile) {
        setToast({ message: 'Please select a new photo.', type: 'error' });
        return;
    }
    setLoading(true);
    
    try {
        const fileExt = avatarFile.name.split('.').pop();
        // Use user ID for organization, which is good practice for logged-in users.
        const filePath = `${user.id}/${Date.now()}.${fileExt}`;
        
        // Upload new avatar
        const { error: uploadError } = await supabase.storage
            .from('avatars')
            .upload(filePath, avatarFile, { upsert: true });
        if (uploadError) throw uploadError;

        // Before updating, store the old path for cleanup
        const oldFilePath = user.user_metadata?.avatar_url;

        // Update user metadata with the new path. This will trigger onAuthStateChange.
        const { error: updateUserError } = await supabase.auth.updateUser({
            data: { avatar_url: filePath }
        });
        if(updateUserError) throw updateUserError;
        
        // Clean up the old avatar from storage if it exists
        if (oldFilePath) {
            await supabase.storage.from('avatars').remove([oldFilePath]);
        }

        setToast({ message: 'Profile updated successfully!', type: 'success' });
        setTimeout(() => {
          onClose();
          // No longer need to reload. The useAuth hook will automatically update the user state.
        }, 1500);

    } catch (error: any) {
        setToast({ message: error.message || 'Failed to update profile.', type: 'error' });
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white dark:bg-ocs-dark-sidebar p-6 rounded-lg shadow-xl w-full max-w-sm border border-gray-200 dark:border-zinc-700">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Profile Settings</h3>
        
        <ImageUploader onFileSelect={setAvatarFile} currentImageUrl={currentAvatarUrl} />

        <div className="flex justify-end space-x-2 mt-6">
          <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-ocs-dark-hover rounded-md hover:bg-gray-200 dark:hover:bg-zinc-700">
            Cancel
          </button>
          <button onClick={handleUpdate} disabled={loading || !avatarFile} className="px-4 py-2 text-sm text-white bg-blue-500 rounded-md hover:bg-blue-600 disabled:opacity-50">
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>

        {toast && <p className={`mt-4 text-sm text-center ${toast.type === 'success' ? 'text-green-500' : 'text-red-500'}`}>{toast.message}</p>}
      </div>
    </div>
  );
};

export default ProfileSettingsModal;