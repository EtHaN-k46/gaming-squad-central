
import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface AddEventDialogProps {
  onEventAdded: () => void;
}

const AddEventDialog: React.FC<AddEventDialogProps> = ({ onEventAdded }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    game: 'Apex Legends',
    event_date: '',
    event_time: '',
  });

  const { user } = useAuth();
  const { toast } = useToast();

  const games = ['Apex Legends', 'Valorant', 'Call of Duty', 'Siege X', 'Call of Duty Mobile'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('events')
        .insert({
          title: formData.title,
          description: formData.description,
          game: formData.game,
          event_date: formData.event_date,
          event_time: formData.event_time,
          created_by: user.id,
        });

      if (error) throw error;

      toast({
        title: "Event created successfully",
        description: "The practice session has been added to the calendar.",
      });

      setFormData({
        title: '',
        description: '',
        game: 'Apex Legends',
        event_date: '',
        event_time: '',
      });
      setIsOpen(false);
      onEventAdded();
    } catch (error: any) {
      toast({
        title: "Error creating event",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) {
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
      <div className="bg-gray-900 rounded-xl p-6 w-full max-w-md border border-gray-800">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Add Practice Session</h2>
          <button
            onClick={() => setIsOpen(false)}
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

          <div className="flex space-x-4 pt-4">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-3 px-4 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating...' : 'Create Event'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddEventDialog;
