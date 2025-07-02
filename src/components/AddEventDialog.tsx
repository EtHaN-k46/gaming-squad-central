
import React, { useState, useEffect } from 'react';
import { Plus, X, Edit, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useUserRole } from '@/hooks/useUserRole';

interface Event {
  id: string;
  title: string;
  description: string | null;
  game: string;
  division: string | null;
  event_date: string;
  event_time: string;
  is_recurring: boolean | null;
  recurrence_day: number | null;
}

interface AddEventDialogProps {
  onEventAdded: () => void;
  editingEvent?: Event | null;
  onCancelEdit?: () => void;
}

const AddEventDialog: React.FC<AddEventDialogProps> = ({ 
  onEventAdded, 
  editingEvent, 
  onCancelEdit 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [userDivision, setUserDivision] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    game: 'Apex Legends',
    division: '',
    event_date: '',
    event_time: '',
    is_recurring: false,
    recurrence_day: 1, // Monday by default
  });

  const { user } = useAuth();
  const { toast } = useToast();
  const { role } = useUserRole();

  const games = ['Apex Legends', 'Valorant', 'Call of Duty', 'Siege X', 'Call of Duty Mobile'];
  const divisions = ['Apex Legends', 'Valorant', 'Call of Duty', 'Siege X', 'Call of Duty Mobile'];
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  useEffect(() => {
    if (user && role === 'division_head') {
      fetchUserDivision();
    }
  }, [user, role]);

  useEffect(() => {
    if (editingEvent) {
      setFormData({
        title: editingEvent.title,
        description: editingEvent.description || '',
        game: editingEvent.game,
        division: editingEvent.division || '',
        event_date: editingEvent.event_date,
        event_time: editingEvent.event_time,
        is_recurring: Boolean(editingEvent.is_recurring),
        recurrence_day: editingEvent.recurrence_day || 1,
      });
      setIsOpen(true);
    }
  }, [editingEvent]);

  const fetchUserDivision = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('division')
        .eq('user_id', user.id)
        .eq('role', 'division_head')
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching user division:', error);
        return;
      }

      setUserDivision(data?.division || null);
      if (data?.division && !editingEvent) {
        setFormData(prev => ({ ...prev, division: data.division }));
      }
    } catch (error) {
      console.error('Error fetching user division:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      const eventData = {
        title: formData.title,
        description: formData.description,
        game: formData.game,
        division: formData.division,
        event_date: formData.event_date,
        event_time: formData.event_time,
        is_recurring: formData.is_recurring,
        recurrence_day: formData.is_recurring ? formData.recurrence_day : null,
        created_by: user.id,
      };

      if (editingEvent) {
        const { error } = await supabase
          .from('events')
          .update(eventData)
          .eq('id', editingEvent.id);

        if (error) throw error;

        toast({
          title: "Event updated successfully",
          description: "The practice session has been updated.",
        });
      } else {
        const { error } = await supabase
          .from('events')
          .insert(eventData);

        if (error) throw error;

        toast({
          title: "Event created successfully",
          description: "The practice session has been added to the calendar.",
        });
      }

      setFormData({
        title: '',
        description: '',
        game: 'Apex Legends',
        division: userDivision || '',
        event_date: '',
        event_time: '',
        is_recurring: false,
        recurrence_day: 1,
      });
      setIsOpen(false);
      if (onCancelEdit) onCancelEdit();
      onEventAdded();
    } catch (error: any) {
      toast({
        title: editingEvent ? "Error updating event" : "Error creating event",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!editingEvent || !user) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', editingEvent.id);

      if (error) throw error;

      toast({
        title: "Event deleted successfully",
        description: "The practice session has been removed from the calendar.",
      });

      setIsOpen(false);
      if (onCancelEdit) onCancelEdit();
      onEventAdded();
    } catch (error: any) {
      toast({
        title: "Error deleting event",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    if (onCancelEdit) onCancelEdit();
  };

  if (!isOpen && !editingEvent) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg inline-flex items-center transition-colors"
      >
        <Plus size={20} className="mr-2" />
        Add Practice Session
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-xl p-6 w-full max-w-md border border-gray-800 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">
            {editingEvent ? 'Edit Practice Session' : 'Add Practice Session'}
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">
              Title
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
              placeholder="Practice session title"
              required
            />
          </div>

          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">
              Game
            </label>
            <select
              value={formData.game}
              onChange={(e) => setFormData({ ...formData, game: e.target.value })}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
              required
            >
              {games.map((game) => (
                <option key={game} value={game}>
                  {game}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">
              Division
            </label>
            <select
              value={formData.division}
              onChange={(e) => setFormData({ ...formData, division: e.target.value })}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
              disabled={role === 'division_head' && userDivision}
              required
            >
              <option value="">Select Division</option>
              {(role === 'admin' ? divisions : userDivision ? [userDivision] : divisions).map((division) => (
                <option key={division} value={division}>
                  {division}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-3 p-3 bg-gray-800/50 rounded-lg">
            <input
              type="checkbox"
              id="recurring"
              checked={formData.is_recurring}
              onChange={(e) => setFormData({ ...formData, is_recurring: e.target.checked })}
              className="w-4 h-4 text-red-600 bg-gray-700 border-gray-600 rounded focus:ring-red-500"
            />
            <label htmlFor="recurring" className="text-gray-300 text-sm">
              Recurring weekly event
            </label>
          </div>

          {formData.is_recurring && (
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Repeat every
              </label>
              <select
                value={formData.recurrence_day}
                onChange={(e) => setFormData({ ...formData, recurrence_day: parseInt(e.target.value) })}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
              >
                {dayNames.map((day, index) => (
                  <option key={day} value={index}>
                    {day}
                  </option>
                ))}
              </select>
            </div>
          )}

          {!formData.is_recurring && (
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Date
              </label>
              <input
                type="date"
                value={formData.event_date}
                onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
                required
              />
            </div>
          )}

          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">
              Time
            </label>
            <input
              type="time"
              value={formData.event_time}
              onChange={(e) => setFormData({ ...formData, event_time: e.target.value })}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
              required
            />
          </div>

          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">
              Description (Optional)
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
              placeholder="Additional details about the session"
              rows={3}
            />
          </div>

          <div className="flex space-x-2 pt-4">
            {editingEvent && (
              <button
                type="button"
                onClick={handleDelete}
                className="flex-1 bg-red-700 hover:bg-red-600 text-white py-3 px-4 rounded-lg transition-colors inline-flex items-center justify-center"
              >
                <Trash2 size={16} className="mr-2" />
                Delete
              </button>
            )}
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-3 px-4 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center"
            >
              {editingEvent && <Edit size={16} className="mr-2" />}
              {loading ? 'Saving...' : (editingEvent ? 'Update' : 'Create')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddEventDialog;
