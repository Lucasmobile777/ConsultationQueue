import { PlayerState } from "@shared/schema";

interface GameBoardProps {
  players: PlayerState[];
  specialTiles: Record<number, string>;
}

export default function GameBoard({ players, specialTiles }: GameBoardProps) {
  // Create an array of 30 positions for the board
  const boardPositions = Array.from({ length: 30 }, (_, i) => i);
  
  // Get special tile icon based on effect
  const getSpecialTileIcon = (effect: string) => {
    switch (effect) {
      case "avance_2":
        return <i className="material-icons text-white text-xs">arrow_forward</i>;
      case "volte_3":
        return <i className="material-icons text-white text-xs">arrow_back</i>;
      case "perde_turno":
        return <i className="material-icons text-white text-xs">hourglass_empty</i>;
      case "troque":
        return <i className="material-icons text-white text-xs">swap_horiz</i>;
      case "puxe_carta":
        return <i className="material-icons text-white text-xs">view_carousel</i>;
      default:
        return null;
    }
  };
  
  // Get special tile style based on effect
  const getSpecialTileStyle = (effect: string) => {
    switch (effect) {
      case "avance_2":
        return "bg-secondary bg-opacity-20 border-secondary";
      case "volte_3":
        return "bg-error bg-opacity-20 border-error";
      case "perde_turno":
        return "bg-warning bg-opacity-20 border-warning";
      case "troque":
        return "bg-primary bg-opacity-20 border-primary";
      case "puxe_carta":
        return "bg-accent bg-opacity-20 border-accent";
      default:
        return "bg-gray-100";
    }
  };
  
  // Get special tile badge style based on effect
  const getSpecialTileBadgeStyle = (effect: string) => {
    switch (effect) {
      case "avance_2":
        return "bg-secondary";
      case "volte_3":
        return "bg-error";
      case "perde_turno":
        return "bg-warning";
      case "troque":
        return "bg-primary";
      case "puxe_carta":
        return "bg-accent";
      default:
        return "bg-gray-400";
    }
  };
  
  return (
    <div className="relative bg-white rounded-xl shadow-lg p-4 overflow-hidden">
      <h2 className="font-poppins font-semibold text-xl mb-4 text-darkbg">Tabuleiro</h2>
      
      <div className="game-board grid grid-cols-6 gap-2 p-2">
        {boardPositions.map((position) => {
          const isSpecial = position in specialTiles;
          const effect = isSpecial ? specialTiles[position] : "";
          const isFinish = position === 29;
          
          return (
            <div 
              key={position}
              className={`board-tile relative ${isFinish ? 'bg-success bg-opacity-30 border-2 border-success' : isSpecial ? `${getSpecialTileStyle(effect)} border` : 'bg-gray-100 border'} rounded-lg aspect-square flex items-center justify-center`}
              data-tile-index={position}
              data-special={isSpecial ? effect : undefined}
            >
              <span className="text-lg font-semibold">{position + 1}</span>
              
              {/* Special tile indicator */}
              {(isSpecial || isFinish) && (
                <div className={`absolute -top-1 -right-1 w-5 h-5 ${isFinish ? 'bg-success' : getSpecialTileBadgeStyle(effect)} rounded-full flex items-center justify-center`}>
                  {isFinish ? (
                    <i className="material-icons text-white text-xs">emoji_events</i>
                  ) : (
                    getSpecialTileIcon(effect)
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      {/* Player Tokens on Board */}
      <div className="player-tokens absolute top-0 left-0 w-full h-full pointer-events-none">
        {players.map((player) => {
          // Calculate token position on the board based on player position
          const row = Math.floor(player.position / 6);
          const col = player.position % 6;
          
          // Calculate position from top and left based on grid position
          // The actual percentages need to be calculated based on the grid layout
          const topPercentage = (row * 16.6) + 15; // Adjust these numbers based on actual grid size
          const leftPercentage = (col * 16.6) + 8;
          
          // Offset player tokens slightly to avoid overlap
          const offsetTop = player.order % 2 ? 0 : 5;
          const offsetLeft = player.order > 1 ? 5 : 0;
          
          return (
            <div 
              key={player.id}
              className="player-token absolute w-8 h-8 rounded-full flex items-center justify-center text-white font-bold shadow-md"
              style={{
                backgroundColor: player.color,
                top: `${topPercentage + offsetTop}%`,
                left: `${leftPercentage + offsetLeft}%`
              }}
              data-player={player.order + 1}
              data-position={player.position}
            >
              J{player.order + 1}
            </div>
          );
        })}
      </div>
    </div>
  );
}
