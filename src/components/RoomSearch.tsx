import { useState } from 'react';
import { Search, Users, MapPin, Filter, X } from 'lucide-react';
import type { Database } from '../lib/database.types';

type Room = Database['public']['Tables']['rooms']['Row'];

interface RoomSearchProps {
  rooms: Room[];
  onFilter: (filtered: Room[]) => void;
}

export function RoomSearch({ rooms, onFilter }: RoomSearchProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [minCapacity, setMinCapacity] = useState(0);
  const [selectedEquipment, setSelectedEquipment] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  const allEquipment = Array.from(
    new Set(rooms.flatMap(room => room.equipment))
  ).sort();

  const applyFilters = () => {
    let filtered = rooms;

    if (searchTerm.trim()) {
      filtered = filtered.filter(room =>
        room.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        room.floor.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (minCapacity > 0) {
      filtered = filtered.filter(room => room.capacity >= minCapacity);
    }

    if (selectedEquipment.length > 0) {
      filtered = filtered.filter(room =>
        selectedEquipment.every(eq => room.equipment.includes(eq))
      );
    }

    onFilter(filtered);
  };

  const toggleEquipment = (equipment: string) => {
    const updated = selectedEquipment.includes(equipment)
      ? selectedEquipment.filter(e => e !== equipment)
      : [...selectedEquipment, equipment];

    setSelectedEquipment(updated);
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
  };

  const handleCapacityChange = (value: number) => {
    setMinCapacity(value);
  };

  const resetFilters = () => {
    setSearchTerm('');
    setMinCapacity(0);
    setSelectedEquipment([]);
    onFilter(rooms);
  };

  const activeFilters = (searchTerm.length > 0 ? 1 : 0) +
    (minCapacity > 0 ? 1 : 0) +
    selectedEquipment.length;

  return (
    <div className="space-y-4 mb-6">
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Cerca sala per nome o piano..."
            value={searchTerm}
            onChange={(e) => {
              handleSearchChange(e.target.value);
              applyFilters();
            }}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
          />
        </div>

        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-4 py-3 rounded-lg font-medium transition ${
            showFilters || activeFilters > 0
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          <Filter className="w-5 h-5" />
          {activeFilters > 0 && <span className="ml-1">{activeFilters}</span>}
        </button>

        {activeFilters > 0 && (
          <button
            onClick={resetFilters}
            className="flex items-center gap-2 px-4 py-3 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition font-medium"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {showFilters && (
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
          <div className="space-y-6">
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                <Users className="w-4 h-4" />
                Capacità Minima
              </label>
              <div className="flex gap-2">
                <input
                  type="range"
                  min="0"
                  max="50"
                  value={minCapacity}
                  onChange={(e) => {
                    handleCapacityChange(parseInt(e.target.value));
                    applyFilters();
                  }}
                  className="flex-1"
                />
                <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-lg font-medium min-w-[60px] text-center">
                  {minCapacity > 0 ? `${minCapacity}+` : 'Qualsiasi'}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Attrezzature
              </label>
              <div className="flex flex-wrap gap-2">
                {allEquipment.map((equipment) => (
                  <button
                    key={equipment}
                    onClick={() => {
                      toggleEquipment(equipment);
                    }}
                    onTouchEnd={() => applyFilters()}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition ${
                      selectedEquipment.includes(equipment)
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {equipment}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => {
                applyFilters();
                setShowFilters(false);
              }}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition"
            >
              Applica Filtri
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
