import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { GameState } from '@shared/schema';

interface GameControlsProps {
  gameState: GameState | null;
  onAddPlayer: (name: string) => void;
  onStartGame: () => void;
  onResetGame: () => void;
  isLoading: boolean;
}

export default function GameControls({ 
  gameState, 
  onAddPlayer, 
  onStartGame, 
  onResetGame,
  isLoading 
}: GameControlsProps) {
  const [playerCount, setPlayerCount] = useState(2);
  const [playerNames, setPlayerNames] = useState<string[]>(Array(4).fill(''));
  
  const handleAddPlayer = (index: number) => {
    if (playerNames[index] && playerNames[index].trim() !== '') {
      onAddPlayer(playerNames[index]);
      
      // Clear the input
      const newPlayerNames = [...playerNames];
      newPlayerNames[index] = '';
      setPlayerNames(newPlayerNames);
    }
  };
  
  const handlePlayerNameChange = (index: number, value: string) => {
    const newPlayerNames = [...playerNames];
    newPlayerNames[index] = value;
    setPlayerNames(newPlayerNames);
  };
  
  const existingPlayers = gameState?.players || [];
  const canStartGame = existingPlayers.length >= 2;
  const gameIsWaiting = gameState?.status === 'waiting';
  
  return (
    <div className="bg-white rounded-xl shadow-lg p-4 mb-6">
      <h2 className="font-poppins font-semibold text-xl mb-4 text-darkbg border-b pb-2">Controles do Jogo</h2>
      
      {/* Game Status */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-600">Status:</span>
          <span className="px-3 py-1 bg-primary text-white rounded-full text-sm">
            {!gameState ? 'Inicializando' : 
             gameState.status === 'waiting' ? 'Esperando jogadores' :
             gameState.status === 'active' ? 'Em andamento' : 'Finalizado'}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Turno:</span>
          <span className="font-medium">{gameState?.currentTurn || 0}</span>
        </div>
      </div>
      
      {/* Start/Reset Game */}
      <div className="space-y-3 mb-4">
        <Button
          className="w-full bg-primary hover:bg-opacity-90 text-white font-poppins font-medium"
          onClick={onStartGame}
          disabled={!canStartGame || !gameIsWaiting || isLoading}
        >
          Iniciar Jogo
        </Button>
        <Button
          className="w-full bg-error bg-opacity-90 hover:bg-opacity-100 text-white font-poppins font-medium"
          onClick={onResetGame}
          disabled={isLoading}
        >
          Reiniciar
        </Button>
      </div>
      
      {/* Number of Players */}
      <div className="mb-4">
        <Label className="block text-sm font-medium text-gray-700 mb-1">Número de Jogadores</Label>
        <div className="flex space-x-2">
          {[2, 3, 4].map(count => (
            <button
              key={count}
              className={`flex-1 py-2 border rounded-md text-center transition-all hover:bg-gray-100 ${playerCount === count ? 'bg-primary text-white' : ''}`}
              onClick={() => setPlayerCount(count)}
              disabled={gameState && gameState.status !== 'waiting'}
            >
              {count}
            </button>
          ))}
        </div>
      </div>
      
      {/* Player Names */}
      {gameIsWaiting && (
        <div className="space-y-3 mb-6">
          {Array.from({ length: playerCount }).map((_, i) => {
            const existingPlayer = existingPlayers[i];
            
            return (
              <div key={i} className="player-input">
                <Label className="block text-sm font-medium text-gray-700 mb-1">
                  Jogador {i + 1} {existingPlayer && `(${existingPlayer.name})`}
                </Label>
                {!existingPlayer ? (
                  <div className="flex space-x-2">
                    <Input
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
                      placeholder="Nome do jogador"
                      value={playerNames[i]}
                      onChange={(e) => handlePlayerNameChange(i, e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddPlayer(i)}
                    />
                    <Button
                      size="sm"
                      onClick={() => handleAddPlayer(i)}
                      disabled={!playerNames[i] || isLoading}
                    >
                      Adicionar
                    </Button>
                  </div>
                ) : (
                  <div className="px-3 py-2 bg-gray-100 rounded-md">
                    {existingPlayer.name}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
