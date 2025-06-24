
import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';

const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  
  // Mock events data
  const events = [
    { date: '2024-12-25', title: 'Apex Legends Practice', game: 'Apex Legends', time: '18:00' },
    { date: '2024-12-26', title: 'Valorant Scrimmage', game: 'Valorant', time: '19:30' },
    { date: '2024-12-27', title: 'COD Tournament Prep', game: 'Call of Duty', time: '20:00' },
  ];

  const gameColors = {
    'Apex Legends': 'bg-orange-500',
    'Valorant': 'bg-red-600',
    'Call of Duty': 'bg-green-600',
    'Siege X': 'bg-blue-600',
    'Call of Duty Mobile': 'bg-purple-600'
  };

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
    return events.filter(event => event.date === dateKey);
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

        <div className="max-w-4xl mx-auto">
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
                  <div key={`empty-${index}`} className="h-24 p-2"></div>
                ))}

                {/* Days of the month */}
                {Array.from({ length: daysInMonth }, (_, index) => {
                  const day = index + 1;
                  const dayEvents = getEventsForDate(currentDate.getFullYear(), currentDate.getMonth(), day);
                  const isToday = new Date().toDateString() === new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toDateString();

                  return (
                    <div
                      key={day}
                      className={`h-24 p-2 border border-gray-700 rounded-lg cursor-pointer hover:border-gray-600 transition-colors ${
                        isToday ? 'bg-red-600/10 border-red-600/50' : 'bg-gray-800/30'
                      }`}
                      onClick={() => setSelectedDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), day))}
                    >
                      <div className={`text-sm font-semibold mb-1 ${isToday ? 'text-red-500' : 'text-white'}`}>
                        {day}
                      </div>
                      <div className="space-y-1">
                        {dayEvents.slice(0, 2).map((event, eventIndex) => (
                          <div
                            key={eventIndex}
                            className={`text-xs px-2 py-1 rounded text-white truncate ${
                              gameColors[event.game as keyof typeof gameColors] || 'bg-gray-600'
                            }`}
                          >
                            {event.time}
                          </div>
                        ))}
                        {dayEvents.length > 2 && (
                          <div className="text-xs text-gray-400">+{dayEvents.length - 2} more</div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
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

          {/* Add Event Button (for division heads) */}
          <div className="mt-6 text-center">
            <button className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg inline-flex items-center transition-colors">
              <Plus size={20} className="mr-2" />
              Add Practice Session
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Calendar;
