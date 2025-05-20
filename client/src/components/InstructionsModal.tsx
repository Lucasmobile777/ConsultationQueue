import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

interface InstructionsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function InstructionsModal({ isOpen, onClose }: InstructionsModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl p-6 max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-2xl font-poppins font-bold text-primary">Como Jogar</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 overflow-y-auto pr-2 flex-grow">
          <div>
            <h3 className="text-lg font-medium mb-1">Objetivo</h3>
            <p>Ser o primeiro jogador a chegar à casa 30 do tabuleiro.</p>
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-1">Preparação</h3>
            <ol className="list-decimal ml-6 space-y-1">
              <li>Selecione o número de jogadores (2-4)</li>
              <li>Digite os nomes dos jogadores</li>
              <li>Clique em "Iniciar Jogo"</li>
            </ol>
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-1">Como Jogar</h3>
            <ol className="list-decimal ml-6 space-y-1">
              <li>Na sua vez, clique no botão "Jogar Dado"</li>
              <li>Seu peão avançará o número de casas indicado no dado</li>
              <li>Se cair em uma casa especial, siga o efeito indicado</li>
              <li>A vez passa para o próximo jogador</li>
            </ol>
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-1">Casas Especiais</h3>
            <ul className="list-disc ml-6 space-y-1">
              <li><span className="text-secondary font-medium">Avance 2 casas:</span> Avance 2 casas adicionais</li>
              <li><span className="text-error font-medium">Volte 3 casas:</span> Volte 3 casas</li>
              <li><span className="text-warning font-medium">Perde Turno:</span> Perde o próximo turno</li>
              <li><span className="text-primary font-medium">Troque:</span> Troca de lugar com outro jogador</li>
              <li><span className="text-accent font-medium">Puxe Carta:</span> Pega uma carta e aplica seu efeito</li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-1">Cartas</h3>
            <ul className="list-disc ml-6 space-y-1">
              <li><span className="font-medium">Avance 3 casas:</span> Avance 3 casas adicionais</li>
              <li><span className="font-medium">Jogue novamente:</span> Ganhe um turno extra</li>
              <li><span className="font-medium">Volte 2 casas:</span> Volte 2 casas</li>
              <li><span className="font-medium">Troque com o líder:</span> Troque de lugar com o jogador à frente</li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-1">Fim do Jogo</h3>
            <p>O primeiro jogador a alcançar ou ultrapassar a casa 30 vence o jogo!</p>
          </div>
        </div>
        
        <DialogFooter className="mt-6">
          <Button
            className="bg-primary hover:bg-opacity-90 text-white font-poppins font-medium"
            onClick={onClose}
          >
            Entendi!
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
