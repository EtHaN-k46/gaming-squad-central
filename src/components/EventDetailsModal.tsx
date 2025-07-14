
import React, { useState } from 'react';
import { X, Clock, Calendar, Users, GamepadIcon, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

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

interface EventDetailsModalProps {
  event: Event | null;
  onClose: () => void;
  onEdit?: (event: Event) => void;
  onDelete?: () => void;
  canEdit?: boolean;
}

const EventDetailsModal: React.FC<EventDetailsModalProps> = ({
  event,
  onClose,
  onEdit,
  onDelete,
  canEdit = false
}) => {
  const [deleting, setDeleting] = useState(false);
  
  if (!event) return null;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':');
    const date = new Date();
    date.setHours(parseInt(hours), parseInt(minutes));
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const getDayName = (dayNumber: number) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[dayNumber];
  };

  const handleDelete = async () => {
    if (!event) return;
    
    setDeleting(true);
    try {
      // Extract the original event ID - for recurring events, remove the date suffix
      let eventId = event.id;
      if (event.id.includes('-') && event.is_recurring) {
        // For recurring events with synthetic IDs like "uuid-2025-07-15"
        eventId = event.id.split('-').slice(0, -3).join('-'); // Remove last 3 parts (year-month-day)
      }
      
      console.log('Attempting to delete event:', {
        originalEventId: event.id,
        extractedEventId: eventId,
        isRecurring: event.is_recurring,
        eventTitle: event.title
      });
      
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', eventId);

      if (error) {
        console.error('Supabase delete error:', error);
        throw error;
      }
      
      console.log('Event deleted successfully');
      
      const eventType = event.is_recurring ? 'recurring event' : 'event';
      toast.success(`${eventType.charAt(0).toUpperCase() + eventType.slice(1)} deleted successfully!`);
      
      // Call onDelete to refresh the calendar
      if (onDelete) {
        onDelete();
      }
      onClose();
    } catch (error: any) {
      console.error('Error deleting event:', error);
      console.error('Delete error details:', {
        message: error?.message,
        code: error?.code,
        details: error?.details,
        hint: error?.hint,
        eventId: event.id,
        isRecurring: event.is_recurring
      });
      
      let errorMessage = 'Failed to delete event';
      if (error?.message) {
        errorMessage += `: ${error.message}`;
      }
      
      toast.error(errorMessage);
    } finally {
      setDeleting(false);
    }
  };

  const gameColors = {
    'Apex Legends': 'bg-orange-500',
    'Valorant': 'bg-red-600',
    'Call of Duty': 'bg-green-600',
    'Siege X': 'bg-blue-600',
    'Call of Duty Mobile': 'bg-purple-600'
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-xl p-6 w-full max-w-lg border border-gray-800">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">{event.title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            <X size={24} />
          </button>
        </div>

        <div className="space-y-4">
          {/* Game and Division */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <GamepadIcon className="text-gray-400 mr-2" size={20} />
              <span className="text-white font-medium">{event.game}</span>
              <div 
                className={`w-3 h-3 rounded-full ml-2 ${gameColors[event.game as keyof typeof gameColors] || 'bg-gray-600'}`}
              />
            </div>
            {event.division && (
              <div className="flex items-center">
                <Users className="text-gray-400 mr-2" size={20} />
                <span className="text-white font-medium">{event.division}</span>
              </div>
            )}
          </div>

          {/* Date and Time */}
          <div className="bg-gray-800/50 rounded-lg p-4 space-y-3">
            {event.is_recurring ? (
              <div className="flex items-center">
                <Calendar className="text-gray-400 mr-2" size={20} />
                <div>
                  <span className="text-white font-medium">
                    Every {event.recurrence_day !== null ? getDayName(event.recurrence_day) : 'Week'}
                  </span>
                  <div className="text-sm text-gray-400">Recurring weekly event</div>
                </div>
              </div>
            ) : (
              <div className="flex items-center">
                <Calendar className="text-gray-400 mr-2" size={20} />
                <div>
                  <span className="text-white font-medium">{formatDate(event.event_date)}</span>
                  <div className="text-sm text-gray-400">One-time event</div>
                </div>
              </div>
            )}

            <div className="flex items-center">
              <Clock className="text-gray-400 mr-2" size={20} />
              <span className="text-white font-medium">{formatTime(event.event_time)}</span>
            </div>
          </div>

          {/* Description */}
          {event.description && (
            <div className="bg-gray-800/50 rounded-lg p-4">
              <h4 className="text-white font-medium mb-2">Description</h4>
              <p className="text-gray-300 text-sm leading-relaxed">{event.description}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex space-x-3 pt-4">
            <button
              onClick={onClose}
              className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-3 px-4 rounded-lg transition-colors"
            >
              Close
            </button>
            {canEdit && onEdit && (
              <button
                onClick={() => onEdit(event)}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg transition-colors"
              >
                Edit Event
              </button>
            )}
            {canEdit && (
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex items-center justify-center bg-red-600 hover:bg-red-700 text-white py-3 px-4 rounded-lg transition-colors disabled:opacity-50"
              >
                <Trash2 size={16} className="mr-2" />
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetailsModal;
