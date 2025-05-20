import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';

interface DiceRollerProps {
  onRollDice: () => void;
  diceValue: number | null;
  gameActive: boolean;
  isLoading: boolean;
}

export default function DiceRoller({ 
  onRollDice, 
  diceValue, 
  gameActive,
  isLoading
}: DiceRollerProps) {
  const [isRolling, setIsRolling] = useState(false);
  
  const handleRollClick = () => {
    if (!gameActive || isLoading || isRolling) return;
    
    setIsRolling(true);
    onRollDice();
    
    // After animation completes, reset rolling state
    setTimeout(() => {
      setIsRolling(false);
    }, 600);
  };
  
  // Update rolling state when diceValue changes
  useEffect(() => {
    if (diceValue !== null) {
      setIsRolling(false);
    }
  }, [diceValue]);
  
  return (
    <div className="bg-white rounded-xl shadow-lg p-4 mb-6">
      <h2 className="font-poppins font-semibold text-xl mb-4 text-darkbg border-b pb-2">Dado</h2>
      
      <div className="flex flex-col items-center">
        <div 
          className={`dice w-24 h-24 bg-white border-2 border-gray-300 rounded-xl flex items-center justify-center mb-4 relative shadow-md ${isRolling ? 'rolling' : ''}`}
          style={{
            animation: isRolling ? 'diceRoll 0.5s ease-in-out' : 'none'
          }}
        >
          <span className="text-4xl font-bold text-primary">{diceValue !== null ? diceValue : '?'}</span>
          {/* Dice Dots (for visual representation) */}
          <div className="absolute grid grid-cols-3 grid-rows-3 w-full h-full p-2 opacity-20">
            <div className="dice-dot rounded-full bg-primary m-1"></div>
            <div className="dice-dot rounded-full bg-primary m-1"></div>
            <div className="dice-dot rounded-full bg-primary m-1"></div>
            <div className="dice-dot rounded-full bg-primary m-1"></div>
            <div className="dice-dot rounded-full bg-primary m-1"></div>
            <div className="dice-dot rounded-full bg-primary m-1"></div>
            <div className="dice-dot rounded-full bg-primary m-1"></div>
          </div>
        </div>
        
        <Button
          className="bg-accent hover:bg-opacity-90 text-white font-poppins font-medium flex items-center"
          onClick={handleRollClick}
          disabled={!gameActive || isLoading || isRolling}
        >
          <i className="material-icons mr-1">casino</i> Jogar Dado
        </Button>
      </div>
    </div>
  );
}
