import { PlayerState } from '@shared/schema';

interface PlayerProfilesProps {
  players: PlayerState[];
  currentPlayerIndex: number;
}

export default function PlayerProfiles({ players, currentPlayerIndex }: PlayerProfilesProps) {
  return (
    <div className="bg-white rounded-xl shadow-lg p-4 mb-6">
      <h2 className="font-poppins font-semibold text-xl mb-4 text-darkbg border-b pb-2">Jogadores</h2>
      
      <div className="space-y-4">
        {players.map((player, index) => {
          const isCurrentPlayer = index === currentPlayerIndex;
          const bgColorStyle = { backgroundColor: `${player.color}10` }; // Add transparency
          
          return (
            <div 
              key={player.id} 
              className="player-profile flex items-center p-3 rounded-lg" 
              style={bgColorStyle}
            >
              <div 
                className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold mr-3"
                style={{ backgroundColor: player.color }}
              >
                J{player.order + 1}
              </div>
              <div className="flex-1">
                <h3 className="font-medium">{player.name}</h3>
                <div className="flex items-center text-sm text-gray-600">
                  <span>Posição: <b>Casa {player.position + 1}</b></span>
                </div>
              </div>
              <div 
                className="bg-white rounded-full px-3 py-1 text-xs font-medium"
                style={{ color: player.color }}
              >
                {isCurrentPlayer ? 'Jogando' : player.perdeuTurno ? 'Perde Turno' : 'Aguardando'}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
