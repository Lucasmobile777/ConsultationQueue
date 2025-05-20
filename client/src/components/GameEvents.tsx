import { useEffect, useRef } from 'react';
import { GameEventState } from '@shared/schema';

interface GameEventsProps {
  events: GameEventState[];
}

export default function GameEvents({ events }: GameEventsProps) {
  const eventLogRef = useRef<HTMLDivElement>(null);
  
  // Auto-scroll to the latest event
  useEffect(() => {
    if (eventLogRef.current) {
      eventLogRef.current.scrollTop = 0;
    }
  }, [events]);
  
  // Get event border color based on type
  const getEventBorderColor = (type: string) => {
    switch (type) {
      case 'dice':
        return 'border-primary';
      case 'move':
        return 'border-secondary';
      case 'card':
        return 'border-accent';
      case 'special':
        return 'border-warning';
      default:
        return 'border-gray-300';
    }
  };
  
  return (
    <div className="bg-white rounded-xl shadow-lg p-4 h-64 overflow-y-auto">
      <h2 className="font-poppins font-semibold text-xl mb-2 text-darkbg sticky top-0 bg-white pb-2 border-b">Eventos do Jogo</h2>
      
      <div ref={eventLogRef} className="space-y-2 mt-2">
        {events.map(event => (
          <div 
            key={event.id}
            className={`p-2 bg-gray-50 rounded-md text-sm border-l-4 ${getEventBorderColor(event.type)}`}
          >
            {event.message}
          </div>
        ))}
        
        {events.length === 0 && (
          <div className="p-2 text-center text-gray-400 italic">
            Nenhum evento registrado.
          </div>
        )}
      </div>
    </div>
  );
}
