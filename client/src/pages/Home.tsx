import { useState, useEffect } from "react";
import GameBoard from "@/components/GameBoard";
import GameControls from "@/components/GameControls";
import DiceRoller from "@/components/DiceRoller";
import PlayerProfiles from "@/components/PlayerProfiles";
import GameEvents from "@/components/GameEvents";
import CardDeck from "@/components/CardDeck";
import InstructionsModal from "@/components/InstructionsModal";
import WinnerModal from "@/components/WinnerModal";
import { useGame } from "@/lib/hooks/useGame";
import { PlayerState } from "@shared/schema";

export default function Home() {
  const { 
    gameState, 
    startNewGame, 
    addPlayer, 
    startGame, 
    rollDice, 
    resetGame,
    isLoading 
  } = useGame();
  
  const [showInstructions, setShowInstructions] = useState(true);
  
  // Show instructions when component mounts
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowInstructions(true);
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Get current player
  const currentPlayer = gameState?.players[gameState.currentPlayer];
  
  // Get next player
  const nextPlayerIndex = gameState?.players ? 
    (gameState.currentPlayer + 1) % gameState.players.length : 0;
  const nextPlayer = gameState?.players[nextPlayerIndex];
  
  // Check if there's a winner
  const winner = gameState?.status === 'completed' ? currentPlayer : null;
  
  return (
    <div className="bg-lightbg font-roboto min-h-screen">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Game Header */}
        <header className="mb-8 text-center">
          <h1 className="text-4xl md:text-5xl font-poppins font-bold text-primary mb-2">Corrida Maluca</h1>
          <p className="text-darkbg text-lg">O jogo de tabuleiro mais divertido!</p>
        </header>

        {/* Game Board and Controls Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Game Status and Controls */}
          <div className="lg:col-span-3 order-2 lg:order-1">
            <GameControls 
              gameState={gameState}
              onAddPlayer={addPlayer}
              onStartGame={startGame}
              onResetGame={resetGame}
              isLoading={isLoading}
            />
            
            <DiceRoller 
              onRollDice={rollDice}
              diceValue={gameState?.diceValue || null}
              gameActive={gameState?.status === 'active'}
              isLoading={isLoading}
            />
            
            <GameEvents events={gameState?.events || []} />
          </div>

          {/* Game Board */}
          <div className="lg:col-span-6 order-1 lg:order-2">
            <GameBoard 
              players={gameState?.players || []} 
              specialTiles={gameState?.casasEspeciais || {}}
            />
            
            {/* Current Player and Turn Info */}
            <div className="mt-6 bg-white rounded-xl shadow-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-poppins font-medium text-darkbg">Turno do Jogador</h3>
                  <div className="flex items-center mt-1">
                    {currentPlayer && (
                      <>
                        <div className="w-6 h-6 rounded-full mr-2" style={{ backgroundColor: currentPlayer.color }}></div>
                        <span className="font-medium">{currentPlayer.name}</span>
                      </>
                    )}
                  </div>
                </div>
                
                <div className="text-center">
                  <h3 className="text-lg font-poppins font-medium text-darkbg">Posição Atual</h3>
                  <div className="mt-1 font-medium">
                    Casa <span>{currentPlayer ? currentPlayer.position + 1 : 1}</span>
                  </div>
                </div>
                
                <div className="text-right">
                  <h3 className="text-lg font-poppins font-medium text-darkbg">Próximo Jogador</h3>
                  <div className="flex items-center justify-end mt-1">
                    {nextPlayer && (
                      <>
                        <span className="font-medium mr-2">{nextPlayer.name}</span>
                        <div className="w-6 h-6 rounded-full" style={{ backgroundColor: nextPlayer.color }}></div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Player Profiles and Card Section */}
          <div className="lg:col-span-3 order-3">
            <PlayerProfiles 
              players={gameState?.players || []} 
              currentPlayerIndex={gameState?.currentPlayer || 0}
            />
            
            <CardDeck 
              currentCard={gameState?.currentCard} 
              cardsRemaining={gameState?.pilhaCartas.length || 0}
            />
          </div>
        </div>
        
        {/* Modals */}
        <InstructionsModal 
          isOpen={showInstructions} 
          onClose={() => setShowInstructions(false)} 
        />
        
        {winner && (
          <WinnerModal 
            isOpen={!!winner} 
            winner={winner} 
            onNewGame={resetGame}
          />
        )}
      </div>
    </div>
  );
}
