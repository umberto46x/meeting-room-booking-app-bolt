import { Lightbulb, Check, AlertTriangle } from 'lucide-react';
import type { Database } from '../lib/database.types';

type Room = Database['public']['Tables']['rooms']['Row'];

interface RoomSuggestionsProps {
  selectedRoom: Room;
  participantCount: number;
  allRooms: Room[];
}

export function RoomSuggestions({ selectedRoom, participantCount, allRooms }: RoomSuggestionsProps) {
  const utilizationPercent = (participantCount / selectedRoom.capacity) * 100;
  const isOverCapacity = participantCount > selectedRoom.capacity;
  const hasExcessCapacity = utilizationPercent < 30 && allRooms.length > 1;

  if (!isOverCapacity && !hasExcessCapacity) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-green-900">Scelta Ottimale</p>
            <p className="text-sm text-green-700 mt-1">
              {selectedRoom.name} è appropriata per {participantCount} partecipanti ({Math.round(utilizationPercent)}% capacità).
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (isOverCapacity) {
    const suggestedRooms = allRooms
      .filter(r => r.capacity >= participantCount && r.id !== selectedRoom.id)
      .sort((a, b) => a.capacity - b.capacity)
      .slice(0, 3);

    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-start gap-3 mb-3">
          <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-red-900">Capacità Insufficiente</p>
            <p className="text-sm text-red-700 mt-1">
              {selectedRoom.name} può contenere solo {selectedRoom.capacity} persone.
            </p>
          </div>
        </div>

        {suggestedRooms.length > 0 && (
          <div className="ml-8 space-y-2">
            <p className="text-sm font-medium text-gray-900">Sale consigliate:</p>
            {suggestedRooms.map(room => (
              <div key={room.id} className="text-sm text-gray-700 flex items-center gap-2">
                <span className="w-2 h-2 bg-red-600 rounded-full" />
                <span>{room.name} ({room.capacity} posti)</span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (hasExcessCapacity) {
    const betterRooms = allRooms
      .filter(
        r =>
          r.capacity >= participantCount &&
          r.capacity < selectedRoom.capacity &&
          r.id !== selectedRoom.id
      )
      .sort((a, b) => a.capacity - b.capacity)
      .slice(0, 2);

    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start gap-3 mb-3">
          <Lightbulb className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-yellow-900">Possibile Ottimizzazione</p>
            <p className="text-sm text-yellow-700 mt-1">
              Stai utilizzando solo il {Math.round(utilizationPercent)}% della capacità di {selectedRoom.name}.
            </p>
          </div>
        </div>

        {betterRooms.length > 0 && (
          <div className="ml-8 space-y-2">
            <p className="text-sm font-medium text-gray-900">Sale più adatte:</p>
            {betterRooms.map(room => {
              const utilPercent = (participantCount / room.capacity) * 100;
              return (
                <div key={room.id} className="text-sm text-gray-700 flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-yellow-600 rounded-full" />
                    {room.name} ({room.capacity} posti)
                  </span>
                  <span className="text-xs text-gray-600">{Math.round(utilPercent)}% utilizzo</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  return null;
}
