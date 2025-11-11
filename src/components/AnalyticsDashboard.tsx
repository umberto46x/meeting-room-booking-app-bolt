import { useEffect, useState } from 'react';
import { BarChart3, Users, Clock, TrendingUp, Calendar } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface BookingStats {
  totalBookings: number;
  upcomingBookings: number;
  totalParticipants: number;
  averageDuration: number;
  topRoom: string;
  bookingTrend: { date: string; count: number }[];
  roomUsage: { room: string; bookings: number }[];
}

export function AnalyticsDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<BookingStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'month' | 'quarter' | 'year'>('month');

  useEffect(() => {
    loadStats();
  }, [user?.id, timeRange]);

  const loadStats = async () => {
    if (!user) return;

    setLoading(true);

    const now = new Date();
    const rangeStart = new Date();

    if (timeRange === 'month') {
      rangeStart.setMonth(now.getMonth() - 1);
    } else if (timeRange === 'quarter') {
      rangeStart.setMonth(now.getMonth() - 3);
    } else {
      rangeStart.setFullYear(now.getFullYear() - 1);
    }

    const { data: bookings, error } = await supabase
      .from('bookings')
      .select(`
        id,
        title,
        start_time,
        end_time,
        participants_count,
        rooms:room_id (name)
      `)
      .eq('user_id', user.id)
      .gte('start_time', rangeStart.toISOString())
      .lte('start_time', now.toISOString());

    if (error || !bookings) {
      setLoading(false);
      return;
    }

    const totalBookings = bookings.length;
    const upcomingBookings = bookings.filter(
      b => new Date(b.start_time) > now
    ).length;

    const totalParticipants = bookings.reduce(
      (sum, b) => sum + b.participants_count,
      0
    );

    const totalDuration = bookings.reduce((sum, b) => {
      const start = new Date(b.start_time);
      const end = new Date(b.end_time);
      return sum + (end.getTime() - start.getTime());
    }, 0);

    const averageDuration = bookings.length > 0
      ? Math.round(totalDuration / bookings.length / 60000)
      : 0;

    const roomCounts: Record<string, number> = {};
    bookings.forEach(b => {
      const roomName = Array.isArray(b.rooms) ? b.rooms[0]?.name : b.rooms?.name;
      if (roomName) {
        roomCounts[roomName] = (roomCounts[roomName] || 0) + 1;
      }
    });

    const topRoom = Object.entries(roomCounts).sort(([, a], [, b]) => b - a)[0]?.[0] || '-';

    const dailyBookings: Record<string, number> = {};
    bookings.forEach(b => {
      const date = new Date(b.start_time).toLocaleDateString('it-IT');
      dailyBookings[date] = (dailyBookings[date] || 0) + 1;
    });

    const bookingTrend = Object.entries(dailyBookings)
      .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
      .slice(-30)
      .map(([date, count]) => ({ date, count }));

    const roomUsage = Object.entries(roomCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([room, bookings]) => ({ room, bookings }));

    setStats({
      totalBookings,
      upcomingBookings,
      totalParticipants,
      averageDuration,
      topRoom,
      bookingTrend,
      roomUsage,
    });

    setLoading(false);
  };

  if (loading || !stats) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setTimeRange('month')}
          className={`px-4 py-2 rounded-lg font-medium transition ${
            timeRange === 'month'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Ultimo Mese
        </button>
        <button
          onClick={() => setTimeRange('quarter')}
          className={`px-4 py-2 rounded-lg font-medium transition ${
            timeRange === 'quarter'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Ultimi 3 Mesi
        </button>
        <button
          onClick={() => setTimeRange('year')}
          className={`px-4 py-2 rounded-lg font-medium transition ${
            timeRange === 'year'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Ultimo Anno
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Prenotazioni Totali</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalBookings}</p>
            </div>
            <BarChart3 className="w-12 h-12 text-blue-500 opacity-20" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Prossime Prenotazioni</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.upcomingBookings}</p>
            </div>
            <Calendar className="w-12 h-12 text-green-500 opacity-20" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Partecipanti Totali</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalParticipants}</p>
            </div>
            <Users className="w-12 h-12 text-purple-500 opacity-20" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-orange-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Durata Media</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.averageDuration}m</p>
            </div>
            <Clock className="w-12 h-12 text-orange-500 opacity-20" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            Sala Più Utilizzata
          </h3>
          <div className="text-center py-8">
            <p className="text-4xl font-bold text-blue-600 mb-2">{stats.topRoom}</p>
            <p className="text-gray-600">È la sala che hai prenotato più frequentemente</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Utilizzo per Sala</h3>
          <div className="space-y-3">
            {stats.roomUsage.length === 0 ? (
              <p className="text-gray-600 text-center py-4">Nessun dato disponibile</p>
            ) : (
              stats.roomUsage.map((room, index) => (
                <div key={index}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-medium text-gray-700">{room.room}</span>
                    <span className="text-sm text-gray-600">{room.bookings} prenotazioni</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all"
                      style={{
                        width: `${(room.bookings / Math.max(...stats.roomUsage.map(r => r.bookings), 1)) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {stats.bookingTrend.length > 0 && (
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Tendenza Prenotazioni</h3>
          <div className="flex items-end justify-between h-48 gap-1">
            {stats.bookingTrend.map((item, index) => {
              const maxBookings = Math.max(...stats.bookingTrend.map(b => b.count), 1);
              const height = (item.count / maxBookings) * 100;

              return (
                <div key={index} className="flex flex-col items-center flex-1 gap-2">
                  <div className="w-full bg-blue-500 rounded-t transition-all hover:bg-blue-600" style={{ height: `${height}%` }} />
                  <span className="text-xs text-gray-600">{item.date}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
