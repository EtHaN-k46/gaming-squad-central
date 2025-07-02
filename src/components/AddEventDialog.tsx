
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Calendar, Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
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

interface AddEventDialogProps {
  onEventAdded: () => void;
  editingEvent?: Event | null;
  onCancelEdit?: () => void;
}

const AddEventDialog: React.FC<AddEventDialogProps> = ({ onEventAdded, editingEvent, onCancelEdit }) => {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [game, setGame] = useState('');
  const [division, setDivision] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [eventTime, setEventTime] = useState('');
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurrenceDay, setRecurrenceDay] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const { user } = useAuth();

  const games = [
    'Apex Legends',
    'Valorant', 
    'Call of Duty',
    'Siege X',
    'Call of Duty Mobile'
  ];

  const divisions = games;

  const weekDays = [
    { value: 0, label: 'Sunday' },
    { value: 1, label: 'Monday' },
    { value: 2, label: 'Tuesday' },
    { value: 3, label: 'Wednesday' },
    { value: 4, label: 'Thursday' },
    { value: 5, label: 'Friday' },
    { value: 6, label: 'Saturday' }
  ];

  // Effect to handle editing mode
  useEffect(() => {
    if (editingEvent) {
      setOpen(true);
      setTitle(editingEvent.title);
      setDescription(editingEvent.description || '');
      setGame(editingEvent.game);
      setDivision(editingEvent.division || '');
      setEventDate(editingEvent.event_date);
      setEventTime(editingEvent.event_time);
      setIsRecurring(editingEvent.is_recurring || false);
      setRecurrenceDay(editingEvent.recurrence_day);
    }
  }, [editingEvent]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('You must be logged in to create events');
      return;
    }

    if (!title || !game || !eventDate || !eventTime) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (isRecurring && recurrenceDay === null) {
      toast.error('Please select a day of the week for recurring events');
      return;
    }

    setLoading(true);

    try {
      if (editingEvent) {
        // Update existing event
        const { error } = await supabase
          .from('events')
          .update({
            title,
            description: description || null,
            game,
            division: division || null,
            event_date: eventDate,
            event_time: eventTime,
            is_recurring: isRecurring,
            recurrence_day: isRecurring ? recurrenceDay : null,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingEvent.id);

        if (error) throw error;
        toast.success('Event updated successfully!');
      } else {
        // Create new event
        const { error } = await supabase
          .from('events')
          .insert({
            title,
            description: description || null,
            game,
            division: division || null,
            event_date: eventDate,
            event_time: eventTime,
            is_recurring: isRecurring,
            recurrence_day: isRecurring ? recurrenceDay : null,
            created_by: user.id
          });

        if (error) throw error;
        toast.success('Event created successfully!');
      }
      
      // Reset form
      resetForm();
      setOpen(false);
      
      // Cancel editing mode
      if (onCancelEdit) {
        onCancelEdit();
      }
      
      onEventAdded();
    } catch (error) {
      console.error('Error saving event:', error);
      toast.error(`Failed to ${editingEvent ? 'update' : 'create'} event`);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setGame('');
    setDivision('');
    setEventDate('');
    setEventTime('');
    setIsRecurring(false);
    setRecurrenceDay(null);
  };

  const handleCancel = () => {
    setOpen(false);
    resetForm();
    if (onCancelEdit) {
      onCancelEdit();
    }
  };

  return (
    <Dialog open={open} onOpenChange={(newOpen) => {
      setOpen(newOpen);
      if (!newOpen) {
        handleCancel();
      }
    }}>
      <DialogTrigger asChild>
        <Button className="bg-red-600 hover:bg-red-700 text-white">
          <Plus className="w-4 h-4 mr-2" />
          Add Event
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] bg-gray-900 border-gray-700">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center">
            <Calendar className="w-5 h-5 mr-2 text-red-500" />
            {editingEvent ? 'Edit Event' : 'Create New Event'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-white">Event Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter event title"
              className="bg-gray-800 border-gray-600 text-white"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-white">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter event description (optional)"
              className="bg-gray-800 border-gray-600 text-white"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="game" className="text-white">Game *</Label>
              <Select value={game} onValueChange={setGame} required>
                <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                  <SelectValue placeholder="Select a game" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-600">
                  {games.map((gameOption) => (
                    <SelectItem key={gameOption} value={gameOption} className="text-white hover:bg-gray-700">
                      {gameOption}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="division" className="text-white">Division</Label>
              <Select value={division} onValueChange={setDivision}>
                <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                  <SelectValue placeholder="Select division (optional)" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-600">
                  {divisions.map((div) => (
                    <SelectItem key={div} value={div} className="text-white hover:bg-gray-700">
                      {div}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="eventDate" className="text-white">Date *</Label>
              <Input
                id="eventDate"
                type="date"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                className="bg-gray-800 border-gray-600 text-white"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="eventTime" className="text-white">Time *</Label>
              <Input
                id="eventTime"
                type="time"
                value={eventTime}
                onChange={(e) => setEventTime(e.target.value)}
                className="bg-gray-800 border-gray-600 text-white"
                required
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="recurring"
                checked={isRecurring}
                onCheckedChange={setIsRecurring}
              />
              <Label htmlFor="recurring" className="text-white">
                Make this a recurring weekly event
              </Label>
            </div>

            {isRecurring && (
              <div className="space-y-2">
                <Label htmlFor="recurrenceDay" className="text-white">Day of the Week *</Label>
                <Select 
                  value={recurrenceDay?.toString() || ''} 
                  onValueChange={(value) => setRecurrenceDay(parseInt(value))}
                >
                  <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                    <SelectValue placeholder="Select day of the week" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-600">
                    {weekDays.map((day) => (
                      <SelectItem key={day.value} value={day.value.toString()} className="text-white hover:bg-gray-700">
                        {day.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              className="border-gray-600 text-gray-300 hover:bg-gray-800"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {loading ? (editingEvent ? 'Updating...' : 'Creating...') : (editingEvent ? 'Update Event' : 'Create Event')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddEventDialog;
