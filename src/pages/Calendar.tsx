
import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Edit } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useUserRole } from '@/hooks/useUserRole';
import { useAuth } from '@/contexts/AuthContext';
import AddEventDialog from '@/components/AddEventDialog';
import EventDetailsModal from '@/components/EventDetailsModal';
import TeamManagement from '@/components/TeamManagement';

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

const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  
  const { user } = useAuth();
  const { canManageEvents } = useUserRole();

  const gameColors = {
    'Apex Legends': 'bg-orange-500',
    'Valorant': 'bg-red-600',
    'Call of Duty': 'bg-green-600',
    'Siege X': 'bg-blue-600',
    'Call of Duty Mobile': 'bg-purple-600'
  };

  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('event_date', { ascending: true });

      if (error) {
        console.error('Error fetching events:', error);
        return;
      }

      // Generate recurring events for the current month view
      const allEvents = generateRecurringEvents(data || [], currentDate);
      setEvents(allEvents);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateRecurringEvents = (baseEvents: Event[], viewDate: Date) => {
    const allEvents: Event[] = [];
    const startOfMonth = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1);
    const endOfMonth = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0);

    baseEvents.forEach(event => {
      if (event.is_recurring && event.recurrence_day !== null) {
        // Generate recurring events for the month
        const currentDate = new Date(startOfMonth);
        while (currentDate <= endOfMonth) {
          if (currentDate.getDay() === event.recurrence_day) {
            // Format date consistently
            const year = currentDate.getFullYear();
            const month = String(currentDate.getMonth() + 1).padStart(2, '0');
            const day = String(currentDate.getDate()).padStart(2, '0');
            const formattedDate = `${year}-${month}-${day}`;
            
            allEvents.push({
              ...event,
              id: `${event.id}-${formattedDate}`,
              event_date: formattedDate
            });
          }
          currentDate.setDate(currentDate.getDate() + 1);
        }
      } else {
        // Add non-recurring events
        allEvents.push(event);
      }
    });

    console.log('Generated events:', allEvents);
    return allEvents;
  };

  useEffect(() => {
    fetchEvents();
  }, [currentDate]);

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + (direction === 'next' ? 1 : -1), 1));
  };

  const formatDateKey = (year: number, month: number, day: number) => {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  };

  const getEventsForDate = (year: number, month: number, day: number) => {
    const dateKey = formatDateKey(year, month, day);
    return events.filter(event => event.event_date === dateKey);
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

  const handleEventClick = (event: Event) => {
    console.log('Event clicked:', event);
    setSelectedEvent(event);
  };

  const handleEditEvent = (event: Event) => {
    console.log('Event edit clicked:', event);
    setSelectedEvent(null);
    setEditingEvent(event);
  };

  const handleEventUpdated = () => {
    console.log('Event updated, refreshing calendar...');
    fetchEvents();
    setEditingEvent(null);
  };

  const handleEventDeleted = () => {
    console.log('Event deleted, refreshing calendar...');
    fetchEvents();
    setSelectedEvent(null);
  };

  const daysInMonth = getDaysInMonth(currentDate);
  const firstDayOfMonth = getFirstDayOfMonth(currentDate);
  const monthYear = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <div className="min-h-screen bg-black pt-20">
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-6">
            Practice <span className="text-red-500">Calendar</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Stay updated with all practice schedules and tournament dates across our game divisions.
          </p>
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="bg-gray-900/50 rounded-xl border border-gray-800 overflow-hidden">
            {/* Calendar Header */}
            <div className="bg-gray-800/50 p-6 flex items-center justify-between">
              <button
                onClick={() => navigateMonth('prev')}
                className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
              >
                <ChevronLeft size={20} />
              </button>
              
              <h2 className="text-2xl font-bold text-white">{monthYear}</h2>
              
              <button
                onClick={() => navigateMonth('next')}
                className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
              >
                <ChevronRight size={20} />
              </button>
            </div>

            {/* Calendar Grid */}
            <div className="p-6">
              {loading ? (
                <div className="text-center text-gray-400 py-8">
                  Loading calendar events...
                </div>
              ) : (
                <>
                  {/* Day headers */}
                  <div className="grid grid-cols-7 gap-2 mb-4">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                      <div key={day} className="text-center text-gray-400 font-semibold py-2">
                        {day}
                      </div>
                    ))}
                  </div>

                  {/* Calendar days */}
                  <div className="grid grid-cols-7 gap-2">
                    {/* Empty cells for days before month starts */}
                    {Array.from({ length: firstDayOfMonth }, (_, index) => (
                      <div key={`empty-${index}`} className="h-32 p-2"></div>
                    ))}

                    {/* Days of the month */}
                    {Array.from({ length: daysInMonth }, (_, index) => {
                      const day = index + 1;
                      const dayEvents = getEventsForDate(currentDate.getFullYear(), currentDate.getMonth(), day);
                      const isToday = new Date().toDateString() === new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toDateString();

                      return (
                        <div
                          key={day}
                          className={`${dayEvents.length >= 2 ? 'min-h-40 max-h-56' : 'min-h-32 max-h-40'} p-2 border border-gray-700 rounded-lg hover:border-gray-600 transition-colors ${
                            isToday ? 'bg-red-600/10 border-red-600/50' : 'bg-gray-800/30'
                          }`}
                        >
                          <div className={`text-sm font-semibold mb-2 ${isToday ? 'text-red-500' : 'text-white'}`}>
                            {day}
                          </div>
                          <div className="space-y-1 overflow-y-auto h-full max-h-44">
                            {dayEvents.map((event, eventIndex) => (
                              <div
                                key={eventIndex}
                                className={`text-xs px-2 py-1 rounded text-white cursor-pointer hover:opacity-80 transition-opacity ${
                                  gameColors[event.game as keyof typeof gameColors] || 'bg-gray-600'
                                } flex-shrink-0`}
                                onClick={() => handleEventClick(event)}
                                title={`${event.title} - ${formatTime(event.event_time)} ${event.division ? `(${event.division})` : ''}`}
                              >
                                <div className="font-medium truncate">{formatTime(event.event_time)}</div>
                                {event.division && (
                                  <div className="truncate opacity-90 text-xs">{event.division}</div>
                                )}
                                {canManageEvents && (
                                  <Edit 
                                    size={10} 
                                    className="inline ml-1 opacity-70"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleEditEvent(event);
                                    }}
                                  />
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Legend */}
          <div className="mt-8 bg-gray-900/50 rounded-xl p-6 border border-gray-800">
            <h3 className="text-lg font-bold text-white mb-4">Game Legend</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {Object.entries(gameColors).map(([game, color]) => (
                <div key={game} className="flex items-center">
                  <div className={`w-4 h-4 rounded ${color} mr-2`}></div>
                  <span className="text-gray-300 text-sm">{game}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Add Event Button (for division heads and admins) */}
          {user && canManageEvents && (
            <div className="mt-6 text-center">
              <AddEventDialog 
                onEventAdded={handleEventUpdated} 
                editingEvent={editingEvent}
                onCancelEdit={() => setEditingEvent(null)}
              />
            </div>
          )}

          {user && !canManageEvents && (
            <div className="mt-6 text-center">
              <p className="text-gray-400 text-sm">
                Contact an admin or division head to add events to the calendar.
              </p>
            </div>
          )}

          {/* Team Management for Division Heads */}
          {user && canManageEvents && <TeamManagement />}
        </div>

        {/* Event Details Modal */}
        <EventDetailsModal
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
          onEdit={handleEditEvent}
          onDelete={handleEventDeleted}
          canEdit={canManageEvents}
        />
      </div>
    </div>
  );
};

export default Calendar;
