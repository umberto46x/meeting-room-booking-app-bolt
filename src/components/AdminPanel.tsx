import { useEffect, useState } from 'react';
import { Settings, Plus, Trash2, Edit2, X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Database } from '../lib/database.types';

type Room = Database['public']['Tables']['rooms']['Row'];

interface RoomForm {
  name: string;
  capacity: number;
  floor: string;
  equipment: string[];
}

const availableEquipment = [
  'WiFi',
  'Proiettore',
  'Monitor TV',
  'Lavagna',
  'Video conferenza',
  'Microfoni',
  'Sistema audio',
  'Tavolo riunioni',
];

export function AdminPanel() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState<RoomForm>({
    name: '',
    capacity: 1,
    floor: 'Piano 1',
    equipment: [],
  });

  useEffect(() => {
    loadRooms();
  }, []);

  const loadRooms = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('rooms')
      .select('*')
      .order('name');

    if (!error && data) {
      setRooms(data);
    }
    setLoading(false);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      capacity: 1,
      floor: 'Piano 1',
      equipment: [],
    });
    setEditingRoom(null);
    setShowForm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      alert('Il nome della sala è obbligatorio');
      return;
    }

    if (editingRoom) {
      const { error } = await supabase
        .from('rooms')
        .update({
          name: formData.name,
          capacity: formData.capacity,
          floor: formData.floor,
          equipment: formData.equipment,
        })
        .eq('id', editingRoom.id);

      if (!error) {
        loadRooms();
        resetForm();
      }
    } else {
      const { error } = await supabase
        .from('rooms')
        .insert({
          name: formData.name,
          capacity: formData.capacity,
          floor: formData.floor,
          equipment: formData.equipment,
        });

      if (!error) {
        loadRooms();
        resetForm();
      }
    }
  };

  const deleteRoom = async (id: string) => {
    if (!confirm('Sei sicuro di voler eliminare questa sala?')) return;

    const { error } = await supabase
      .from('rooms')
      .delete()
      .eq('id', id);

    if (!error) {
      loadRooms();
    }
  };

  const handleEditRoom = (room: Room) => {
    setEditingRoom(room);
    setFormData({
      name: room.name,
      capacity: room.capacity,
      floor: room.floor,
      equipment: room.equipment,
    });
    setShowForm(true);
  };

  const toggleEquipment = (equipment: string) => {
    setFormData(prev => ({
      ...prev,
      equipment: prev.equipment.includes(equipment)
        ? prev.equipment.filter(e => e !== equipment)
        : [...prev.equipment, equipment],
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="bg-purple-600 p-3 rounded-xl">
            <Settings className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Pannello Amministrativo</h1>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900">Gestione Sale</h2>
            <button
              onClick={() => {
                resetForm();
                setShowForm(true);
              }}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition font-medium"
            >
              <Plus className="w-5 h-5" />
              Aggiungi Sala
            </button>
          </div>

          {showForm && (
            <form onSubmit={handleSubmit} className="bg-gray-50 p-6 rounded-lg mb-6 space-y-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {editingRoom ? 'Modifica Sala' : 'Nuova Sala'}
                </h3>
                <button
                  type="button"
                  onClick={resetForm}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nome Sala
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Capacità
                  </label>
                  <input
                    type="number"
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) })}
                    min={1}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Piano
                  </label>
                  <input
                    type="text"
                    value={formData.floor}
                    onChange={(e) => setFormData({ ...formData, floor: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Attrezzature
                </label>
                <div className="flex flex-wrap gap-2">
                  {availableEquipment.map((eq) => (
                    <button
                      key={eq}
                      type="button"
                      onClick={() => toggleEquipment(eq)}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium transition ${
                        formData.equipment.includes(eq)
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      {eq}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition"
                >
                  {editingRoom ? 'Salva Modifiche' : 'Crea Sala'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-400 transition"
                >
                  Annulla
                </button>
              </div>
            </form>
          )}

          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Nome</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Capacità</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Piano</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Attrezzature</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Azioni</th>
                  </tr>
                </thead>
                <tbody>
                  {rooms.map((room) => (
                    <tr key={room.id} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="py-3 px-4 text-gray-900 font-medium">{room.name}</td>
                      <td className="py-3 px-4 text-gray-600">{room.capacity} persone</td>
                      <td className="py-3 px-4 text-gray-600">{room.floor}</td>
                      <td className="py-3 px-4 text-gray-600 text-sm">
                        <div className="flex flex-wrap gap-1">
                          {room.equipment.map((eq) => (
                            <span
                              key={eq}
                              className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs"
                            >
                              {eq}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditRoom(room)}
                            className="flex items-center gap-1 text-blue-600 hover:text-blue-700 font-medium"
                          >
                            <Edit2 className="w-4 h-4" />
                            Modifica
                          </button>
                          <button
                            onClick={() => deleteRoom(room.id)}
                            className="flex items-center gap-1 text-red-600 hover:text-red-700 font-medium"
                          >
                            <Trash2 className="w-4 h-4" />
                            Elimina
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
