
import React, { useState, useEffect } from 'react';
import { Edit, Save, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface TeamSettings {
  id: string;
  division: string;
  team1_name: string;
  team2_name: string;
  team1_max_players: number;
  team2_max_players: number;
}

interface TeamNameEditorProps {
  division: string;
  canEdit: boolean;
}

const TeamNameEditor: React.FC<TeamNameEditorProps> = ({ division, canEdit }) => {
  const [settings, setSettings] = useState<TeamSettings | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    team1_name: 'Team 1',
    team2_name: 'Team 2'
  });
  const [loading, setLoading] = useState(false);

  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchTeamSettings();
  }, [division]);

  const fetchTeamSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('team_settings')
        .select('*')
        .eq('division', division)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching team settings:', error);
        return;
      }

      if (data) {
        setSettings(data);
        setEditData({
          team1_name: data.team1_name || 'Team 1',
          team2_name: data.team2_name || 'Team 2'
        });
      }
    } catch (error) {
      console.error('Error fetching team settings:', error);
    }
  };

  const handleSave = async () => {
    if (!user) return;

    setLoading(true);
    try {
      if (settings) {
        // Update existing settings
        const { error } = await supabase
          .from('team_settings')
          .update({
            team1_name: editData.team1_name,
            team2_name: editData.team2_name,
            updated_at: new Date().toISOString()
          })
          .eq('id', settings.id);

        if (error) throw error;
      } else {
        // Create new settings
        const { error } = await supabase
          .from('team_settings')
          .insert({
            division,
            team1_name: editData.team1_name,
            team2_name: editData.team2_name,
            team1_max_players: 5,
            team2_max_players: 5,
            created_by: user.id
          });

        if (error) throw error;
      }

      toast({
        title: "Team names updated",
        description: "The team names have been updated successfully.",
      });

      setIsEditing(false);
      fetchTeamSettings();
    } catch (error: any) {
      toast({
        title: "Error updating team names",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditData({
      team1_name: settings?.team1_name || 'Team 1',
      team2_name: settings?.team2_name || 'Team 2'
    });
  };

  if (!canEdit && !settings) return null;

  return (
    <div className="mb-4 p-4 bg-gray-800/30 rounded-lg border border-gray-700">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-white font-medium">Team Names</h4>
        {canEdit && !isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="text-blue-400 hover:text-blue-300 p-1 hover:bg-gray-700 rounded transition-colors"
          >
            <Edit size={16} />
          </button>
        )}
      </div>

      {isEditing ? (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-gray-300 text-xs font-medium mb-1">
                Team 1 Name
              </label>
              <input
                type="text"
                value={editData.team1_name}
                onChange={(e) => setEditData({ ...editData, team1_name: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white text-sm focus:border-red-500 focus:outline-none"
                placeholder="Team 1"
              />
            </div>
            <div>
              <label className="block text-gray-300 text-xs font-medium mb-1">
                Team 2 Name
              </label>
              <input
                type="text"
                value={editData.team2_name}
                onChange={(e) => setEditData({ ...editData, team2_name: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white text-sm focus:border-red-500 focus:outline-none"
                placeholder="Team 2"
              />
            </div>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={handleSave}
              disabled={loading}
              className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm inline-flex items-center transition-colors disabled:opacity-50"
            >
              <Save size={12} className="mr-1" />
              {loading ? 'Saving...' : 'Save'}
            </button>
            <button
              onClick={handleCancel}
              className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded text-sm inline-flex items-center transition-colors"
            >
              <X size={12} className="mr-1" />
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="text-gray-300">
            <span className="font-medium">{settings?.team1_name || 'Team 1'}</span>
          </div>
          <div className="text-gray-300">
            <span className="font-medium">{settings?.team2_name || 'Team 2'}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamNameEditor;
