import { useEffect, useState } from 'react';
import { Calendar, Clock, MapPin, Users, Trash2, Download } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { exportToCSV, exportToICS, type BookingExport } from '../utils/exportUtils';

interface Booking {
  id: string;
  room_id: string;
  title: string;
  description: string;
  start_time: string;
  end_time: string;
  participants_count: number;
  room: {
    name: string;
    floor: string;
  };
}

export function MyBookings({ onRefresh }: { onRefresh: number }) {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBookings();
  }, [user, onRefresh]);

  const loadBookings = async () => {
    if (!user) return;

    setLoading(true);
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        id,
        room_id,
        title,
        description,
        start_time,
        end_time,
        participants_count,
        rooms:room_id (
          name,
          floor
        )
      `)
      .eq('user_id', user.id)
      .gte('end_time', new Date().toISOString())
      .order('start_time', { ascending: true });

    if (!error && data) {
      const formattedBookings = data.map(booking => ({
        id: booking.id,
        room_id: booking.room_id,
        title: booking.title,
        description: booking.description,
        start_time: booking.start_time,
        end_time: booking.end_time,
        participants_count: booking.participants_count,
        room: Array.isArray(booking.rooms) ? booking.rooms[0] : booking.rooms
      }));
      setBookings(formattedBookings);
    }

    setLoading(false);
  };

  const deleteBooking = async (id: string) => {
    if (!confirm('Sei sicuro di voler eliminare questa prenotazione?')) return;

    const { error } = await supabase
      .from('bookings')
      .delete()
      .eq('id', id);

    if (!error) {
      loadBookings();
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('it-IT', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('it-IT', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const exportBookingsToCSV = () => {
    const bookingsToExport: BookingExport[] = bookings.map(b => ({
      title: b.title,
      description: b.description,
      room: b.room.name,
      floor: b.room.floor,
      date: formatDate(b.start_time),
      startTime: formatTime(b.start_time),
      endTime: formatTime(b.end_time),
      participants: b.participants_count,
      organizer: user?.email || '',
    }));

    exportToCSV(bookingsToExport, `prenotazioni-${new Date().toISOString().split('T')[0]}`);
  };

  const exportBookingToCalendar = (booking: Booking) => {
    const bookingExport: BookingExport = {
      title: booking.title,
      description: booking.description,
      room: booking.room.name,
      floor: booking.room.floor,
      date: formatDate(booking.start_time),
      startTime: formatTime(booking.start_time),
      endTime: formatTime(booking.end_time),
      participants: booking.participants_count,
      organizer: user?.email || '',
    };

    exportToICS(bookingExport);
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
      </div>
    );
  }

  if (bookings.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-md p-8 text-center">
        <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-600 text-lg">Non hai prenotazioni future</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl shadow-md p-4 flex gap-2">
        <button
          onClick={exportBookingsToCSV}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition font-medium"
        >
          <Download className="w-4 h-4" />
          Scarica CSV
        </button>
      </div>

      {bookings.map((booking) => (
        <div
          key={booking.id}
          className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100"
        >
          <div className="bg-gradient-to-r from-green-500 to-green-600 p-4">
            <h3 className="text-xl font-bold text-white">{booking.title}</h3>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="flex items-start gap-2">
                <Calendar className="w-5 h-5 text-green-600 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900">{formatDate(booking.start_time)}</p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Clock className="w-5 h-5 text-green-600 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900">
                    {formatTime(booking.start_time)} - {formatTime(booking.end_time)}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <MapPin className="w-5 h-5 text-green-600 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900">{booking.room.name}</p>
                  <p className="text-sm text-gray-600">{booking.room.floor}</p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Users className="w-5 h-5 text-green-600 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900">{booking.participants_count} partecipanti</p>
                </div>
              </div>
            </div>

            {booking.description && (
              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-700">{booking.description}</p>
              </div>
            )}

            <div className="flex gap-2">
              <button
                onClick={() => exportBookingToCalendar(booking)}
                className="flex items-center gap-2 bg-blue-50 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-100 transition font-medium"
              >
                <Download className="w-4 h-4" />
                Calendario
              </button>
              <button
                onClick={() => deleteBooking(booking.id)}
                className="flex items-center gap-2 bg-red-50 text-red-600 px-4 py-2 rounded-lg hover:bg-red-100 transition font-medium"
              >
                <Trash2 className="w-4 h-4" />
                Elimina
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
