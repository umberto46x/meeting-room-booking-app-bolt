import { useEffect, useState } from 'react';
import { LogOut, Calendar, DoorOpen, CalendarDays, Settings, BarChart3 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useAdmin } from '../hooks/useAdmin';
import { RoomCard } from './RoomCard';
import { BookingModal } from './BookingModal';
import { RecurringBookingModal } from './RecurringBookingModal';
import { MyBookings } from './MyBookings';
import { CalendarView } from './CalendarView';
import { RoomSearch } from './RoomSearch';
import { NotificationBell } from './NotificationBell';
import { AnalyticsDashboard } from './AnalyticsDashboard';
import type { Database } from '../lib/database.types';

type Room = Database['public']['Tables']['rooms']['Row'];

interface DashboardProps {
  onAdminAccess?: () => void;
}

export function Dashboard({ onAdminAccess }: DashboardProps) {
  const { user, signOut } = useAuth();
  const { isAdmin } = useAdmin();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [filteredRooms, setFilteredRooms] = useState<Room[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [selectedRoomRecurring, setSelectedRoomRecurring] = useState<Room | null>(null);
  const [activeTab, setActiveTab] = useState<'rooms' | 'bookings' | 'calendar' | 'analytics'>('rooms');
  const [refreshKey, setRefreshKey] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRooms();
  }, []);

  useEffect(() => {
    setFilteredRooms(rooms);
  }, [rooms]);

  const loadRooms = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('rooms')
      .select('*')
      .order('name');

    if (!error && data) {
      setRooms(data);
      setFilteredRooms(data);
    }
    setLoading(false);
  };

  const handleBookingSuccess = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <header className="bg-white shadow-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 p-2 rounded-lg">
                <DoorOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Sistema Prenotazione Sale</h1>
                <p className="text-sm text-gray-600">{user?.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <NotificationBell />
              {isAdmin && (
                <button
                  onClick={onAdminAccess}
                  className="flex items-center gap-2 bg-purple-50 text-purple-600 px-4 py-2 rounded-lg hover:bg-purple-100 transition font-medium"
                >
                  <Settings className="w-4 h-4" />
                  Amministrazione
                </button>
              )}
              <button
                onClick={() => signOut()}
                className="flex items-center gap-2 bg-red-50 text-red-600 px-4 py-2 rounded-lg hover:bg-red-100 transition font-medium"
              >
                <LogOut className="w-4 h-4" />
                Esci
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 flex gap-4 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('rooms')}
            className={`pb-4 px-2 font-semibold transition border-b-2 ${
              activeTab === 'rooms'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <DoorOpen className="w-5 h-5 inline mr-2" />
            Sale Disponibili
          </button>

          <button
            onClick={() => setActiveTab('bookings')}
            className={`pb-4 px-2 font-semibold transition border-b-2 ${
              activeTab === 'bookings'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <Calendar className="w-5 h-5 inline mr-2" />
            Le Mie Prenotazioni
          </button>

          <button
            onClick={() => setActiveTab('calendar')}
            className={`pb-4 px-2 font-semibold transition border-b-2 ${
              activeTab === 'calendar'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <CalendarDays className="w-5 h-5 inline mr-2" />
            Calendario
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            className={`pb-4 px-2 font-semibold transition border-b-2 ${
              activeTab === 'analytics'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <BarChart3 className="w-5 h-5 inline mr-2" />
            Statistiche
          </button>
        </div>

        {activeTab === 'rooms' ? (
          <>
            {!loading && <RoomSearch rooms={rooms} onFilter={setFilteredRooms} />}
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredRooms.length > 0 ? (
                  filteredRooms.map((room) => (
                    <RoomCard
                      key={room.id}
                      room={room}
                      onSelect={setSelectedRoom}
                      onSelectRecurring={setSelectedRoomRecurring}
                    />
                  ))
                ) : (
                  <div className="col-span-full text-center py-12">
                    <p className="text-gray-600 text-lg">Nessuna sala corrisponde ai filtri selezionati</p>
                  </div>
                )}
              </div>
            )}
          </>
        ) : activeTab === 'bookings' ? (
          <MyBookings onRefresh={refreshKey} />
        ) : activeTab === 'calendar' ? (
          <CalendarView />
        ) : (
          <AnalyticsDashboard />
        )}
      </main>

      {selectedRoom && (
        <BookingModal
          room={selectedRoom}
          onClose={() => setSelectedRoom(null)}
          onSuccess={handleBookingSuccess}
          allRooms={rooms}
        />
      )}

      {selectedRoomRecurring && (
        <RecurringBookingModal
          room={selectedRoomRecurring}
          onClose={() => setSelectedRoomRecurring(null)}
          onSuccess={handleBookingSuccess}
        />
      )}
    </div>
  );
}
