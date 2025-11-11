import { useState } from 'react';
import { X, Calendar, Clock, Users, Repeat } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import type { Database } from '../lib/database.types';

type Room = Database['public']['Tables']['rooms']['Row'];

interface RecurringBookingModalProps {
  room: Room | null;
  onClose: () => void;
  onSuccess: () => void;
}

type RecurrenceType = 'daily' | 'weekly' | 'biweekly' | 'monthly';

const DAYS_OF_WEEK = ['Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato', 'Domenica'];

export function RecurringBookingModal({ room, onClose, onSuccess }: RecurringBookingModalProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showRecurring, setShowRecurring] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startTime: '',
    endTime: '',
    participants: 1,
    recurrenceType: 'weekly' as RecurrenceType,
    endDate: '',
    daysOfWeek: [0, 2, 4], // Default: Monday, Wednesday, Friday
  });

  if (!room) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!user) {
      setError('Devi essere autenticato');
      setLoading(false);
      return;
    }

    if (!formData.startTime || !formData.endTime) {
      setError('Specifica orari validi');
      setLoading(false);
      return;
    }

    if (formData.participants > room.capacity) {
      setError(`I partecipanti superano la capacità (${room.capacity})`);
      setLoading(false);
      return;
    }

    if (!formData.endDate) {
      setError('Specifica la data di fine');
      setLoading(false);
      return;
    }

    const { error: insertError } = await supabase
      .from('recurring_bookings')
      .insert({
        user_id: user.id,
        room_id: room.id,
        title: formData.title,
        description: formData.description,
        start_time: formData.startTime,
        end_time: formData.endTime,
        participants_count: formData.participants,
        recurrence_type: formData.recurrenceType,
        recurrence_end_date: formData.endDate,
        days_of_week: formData.recurrenceType === 'weekly' || formData.recurrenceType === 'biweekly'
          ? formData.daysOfWeek
          : [],
      });

    if (insertError) {
      setError('Errore nella creazione della prenotazione ricorrente');
      setLoading(false);
      return;
    }

    onSuccess();
    onClose();
  };

  const toggleDay = (dayIndex: number) => {
    setFormData(prev => ({
      ...prev,
      daysOfWeek: prev.daysOfWeek.includes(dayIndex)
        ? prev.daysOfWeek.filter(d => d !== dayIndex)
        : [...prev.daysOfWeek, dayIndex].sort(),
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-gradient-to-r from-blue-500 to-blue-600 p-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-white">Prenotazione Ricorrente - {room.name}</h2>
          <button
            onClick={onClose}
            className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Titolo Riunione
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Es: Team Meeting Settimanale"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Descrizione (opzionale)
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={2}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <Clock className="w-4 h-4 inline mr-1" />
                Ora Inizio
              </label>
              <input
                type="time"
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <Clock className="w-4 h-4 inline mr-1" />
                Ora Fine
              </label>
              <input
                type="time"
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <Users className="w-4 h-4 inline mr-1" />
              Partecipanti
            </label>
            <input
              type="number"
              value={formData.participants}
              onChange={(e) => setFormData({ ...formData, participants: parseInt(e.target.value) })}
              min={1}
              max={room.capacity}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="border-t border-gray-200 pt-6">
            <button
              type="button"
              onClick={() => setShowRecurring(!showRecurring)}
              className="w-full flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition font-medium text-blue-700"
            >
              <span className="flex items-center gap-2">
                <Repeat className="w-5 h-5" />
                Configura Ricorrenza
              </span>
              <span>{showRecurring ? '−' : '+'}</span>
            </button>

            {showRecurring && (
              <div className="mt-4 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Tipo di Ricorrenza
                  </label>
                  <select
                    value={formData.recurrenceType}
                    onChange={(e) => setFormData({ ...formData, recurrenceType: e.target.value as RecurrenceType })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="daily">Ogni Giorno</option>
                    <option value="weekly">Settimanale</option>
                    <option value="biweekly">Ogni Due Settimane</option>
                    <option value="monthly">Mensile</option>
                  </select>
                </div>

                {(formData.recurrenceType === 'weekly' || formData.recurrenceType === 'biweekly') && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Giorni della Settimana
                    </label>
                    <div className="grid grid-cols-7 gap-2">
                      {DAYS_OF_WEEK.map((day, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => toggleDay(index)}
                          className={`p-2 rounded-lg font-medium transition text-sm ${
                            formData.daysOfWeek.includes(index)
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          }`}
                        >
                          {day.substring(0, 3)}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <Calendar className="w-4 h-4 inline mr-1" />
                    Data di Fine
                  </label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    required
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            )}
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-200 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-300 transition"
            >
              Annulla
            </button>
            <button
              type="submit"
              disabled={loading || !showRecurring}
              className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creazione...' : 'Crea Ricorrenza'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
