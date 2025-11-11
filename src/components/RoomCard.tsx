import { Users, MapPin, Wifi, Monitor, Video, Mic, Repeat } from 'lucide-react';
import type { Database } from '../lib/database.types';

type Room = Database['public']['Tables']['rooms']['Row'];

interface RoomCardProps {
  room: Room;
  onSelect: (room: Room) => void;
  onSelectRecurring?: (room: Room) => void;
}

const equipmentIcons: Record<string, typeof Wifi> = {
  'WiFi': Wifi,
  'Monitor TV': Monitor,
  'Proiettore': Video,
  'Video conferenza': Video,
  'Microfoni': Mic,
  'Sistema audio': Mic,
};

export function RoomCard({ room, onSelect, onSelectRecurring }: RoomCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100">
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4">
        <h3 className="text-xl font-bold text-white">{room.name}</h3>
      </div>

      <div className="p-6 space-y-4">
        <div className="flex items-center gap-4 text-gray-700">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            <span className="font-medium">{room.capacity} persone</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-blue-600" />
            <span className="font-medium">{room.floor}</span>
          </div>
        </div>

        <div>
          <p className="text-sm font-semibold text-gray-700 mb-2">Attrezzature:</p>
          <div className="flex flex-wrap gap-2">
            {room.equipment.map((eq) => {
              const Icon = equipmentIcons[eq] || Wifi;
              return (
                <div
                  key={eq}
                  className="flex items-center gap-1 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm"
                >
                  <Icon className="w-4 h-4" />
                  <span>{eq}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => onSelect(room)}
            className="flex-1 bg-blue-600 text-white py-2.5 px-4 rounded-lg font-medium hover:bg-blue-700 transition"
          >
            Prenota Sala
          </button>
          {onSelectRecurring && (
            <button
              onClick={() => onSelectRecurring(room)}
              className="flex-1 bg-purple-50 text-purple-600 py-2.5 px-4 rounded-lg font-medium hover:bg-purple-100 transition flex items-center justify-center gap-2"
            >
              <Repeat className="w-4 h-4" />
              Ricorrente
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
