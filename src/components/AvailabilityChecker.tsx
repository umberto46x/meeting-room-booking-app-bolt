import { useEffect, useState } from 'react';
import { Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Database } from '../lib/database.types';

type Room = Database['public']['Tables']['rooms']['Row'];

interface AvailabilitySlot {
  time: string;
  available: boolean;
}

interface AvailabilityCheckerProps {
  room: Room;
  date: string;
}

export function AvailabilityChecker({ room, date }: AvailabilityCheckerProps) {
  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAvailability();
  }, [room.id, date]);

  const loadAvailability = async () => {
    setLoading(true);

    const startOfDay = new Date(`${date}T00:00:00`);
    const endOfDay = new Date(`${date}T23:59:59`);

    const { data: bookings, error } = await supabase
      .from('bookings')
      .select('start_time, end_time')
      .eq('room_id', room.id)
      .gte('start_time', startOfDay.toISOString())
      .lte('end_time', endOfDay.toISOString());

    if (error) {
      setLoading(false);
      return;
    }

    const timeSlots = generateTimeSlots();
    const bookedRanges = (bookings || []).map(b => ({
      start: new Date(b.start_time),
      end: new Date(b.end_time),
    }));

    const slots = timeSlots.map(time => {
      const slotStart = new Date(`${date}T${time}`);
      const slotEnd = new Date(slotStart.getTime() + 60 * 60 * 1000);

      const isBooked = bookedRanges.some(range =>
        (slotStart < range.end && slotEnd > range.start)
      );

      return {
        time,
        available: !isBooked,
      };
    });

    setSlots(slots);
    setLoading(false);
  };

  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 7; hour < 22; hour++) {
      slots.push(`${hour.toString().padStart(2, '0')}:00`);
    }
    return slots;
  };

  if (loading) {
    return (
      <div className="text-center py-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
      </div>
    );
  }

  const availableSlots = slots.filter(s => s.available).length;
  const totalSlots = slots.length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-blue-600" />
          <span className="font-medium text-gray-700">Disponibilità: {availableSlots}/{totalSlots} fasce orarie</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
          <span className="text-sm text-gray-600">{((availableSlots / totalSlots) * 100).toFixed(0)}%</span>
        </div>
      </div>

      <div className="grid grid-cols-4 md:grid-cols-7 gap-2">
        {slots.map((slot) => (
          <div
            key={slot.time}
            className={`p-2 rounded-lg text-center text-sm font-medium transition ${
              slot.available
                ? 'bg-green-50 text-green-700 border border-green-200'
                : 'bg-red-50 text-red-700 border border-red-200 opacity-50'
            }`}
          >
            <div className="flex items-center justify-center gap-1">
              {slot.available ? (
                <CheckCircle className="w-3 h-3" />
              ) : (
                <AlertCircle className="w-3 h-3" />
              )}
              <span>{slot.time}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-green-50 border border-green-200"></div>
          <span className="text-gray-600">Disponibile</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-red-50 border border-red-200"></div>
          <span className="text-gray-600">Occupato</span>
        </div>
      </div>
    </div>
  );
}
