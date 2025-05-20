import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { PlayerState } from "@shared/schema";

interface WinnerModalProps {
  isOpen: boolean;
  winner: PlayerState;
  onNewGame: () => void;
}

export default function WinnerModal({ isOpen, winner, onNewGame }: WinnerModalProps) {
  return (
    <Dialog open={isOpen}>
      <DialogContent className="max-w-md p-6 text-center">
        <div className="mb-4">
          <i className="material-icons text-6xl text-accent">emoji_events</i>
        </div>
        
        <h2 className="text-2xl font-poppins font-bold text-primary mb-2">Parabéns!</h2>
        <p className="text-xl mb-4"><span className="font-bold">{winner.name}</span> venceu a Corrida Maluca!</p>
        
        <div className="flex space-x-4 justify-center mt-6">
          <Button
            className="bg-primary hover:bg-opacity-90 text-white font-poppins font-medium"
            onClick={onNewGame}
          >
            Novo Jogo
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
