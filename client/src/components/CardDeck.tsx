interface CardDeckProps {
  currentCard: string | null;
  cardsRemaining: number;
}

export default function CardDeck({ currentCard, cardsRemaining }: CardDeckProps) {
  const getCardDescription = (card: string) => {
    switch (card) {
      case "Avance 3 casas":
        return "Avance o seu peão 3 casas no tabuleiro.";
      case "Jogue novamente":
        return "Ganhe um turno extra para jogar novamente.";
      case "Volte 2 casas":
        return "Volte o seu peão 2 casas no tabuleiro.";
      case "Troque de lugar com o líder":
        return "Troque de posição com o jogador que está na frente.";
      default:
        return "Aplique o efeito indicado na carta.";
    }
  };
  
  return (
    <div className="bg-white rounded-xl shadow-lg p-4">
      <h2 className="font-poppins font-semibold text-xl mb-4 text-darkbg border-b pb-2">Cartas</h2>
      
      {/* Current Card */}
      <div className="mb-6 relative">
        <h3 className="text-sm font-medium text-gray-600 mb-2">Carta Atual:</h3>
        {currentCard ? (
          <div className="card relative bg-gradient-to-br from-accent to-primary p-4 rounded-lg h-48 shadow-lg">
            <div className="absolute inset-1 bg-white rounded-lg p-4 flex flex-col justify-between">
              <div className="bg-accent bg-opacity-10 py-1 px-3 rounded-md w-max">
                <span className="text-xs font-bold text-accent">AÇÃO ESPECIAL</span>
              </div>
              <div className="text-center my-auto">
                <h3 className="text-xl font-poppins font-bold text-primary mb-2">{currentCard}</h3>
                <p className="text-gray-600 text-sm">{getCardDescription(currentCard)}</p>
              </div>
              <div className="flex justify-end">
                <div className="bg-accent text-white text-xs font-bold py-1 px-2 rounded-md">CARTA</div>
              </div>
            </div>
          </div>
        ) : (
          <div className="card relative bg-gray-100 p-4 rounded-lg h-48 shadow-lg flex items-center justify-center">
            <p className="text-gray-400 italic">Nenhuma carta puxada</p>
          </div>
        )}
      </div>
      
      {/* Card Pile */}
      <div className="flex justify-center">
        <div className="relative">
          <div className="card-pile">
            {/* Stacked cards (visual representation) */}
            <div className="absolute transform rotate-6 -translate-y-1 translate-x-1.5 bg-gradient-to-br from-accent to-primary rounded-lg h-28 w-40 shadow-sm"></div>
            <div className="absolute transform rotate-3 -translate-y-0.5 translate-x-1 bg-gradient-to-br from-accent to-primary rounded-lg h-28 w-40 shadow-sm"></div>
            <div className="relative bg-gradient-to-br from-accent to-primary rounded-lg h-28 w-40 shadow-md flex items-center justify-center">
              <div className="absolute inset-1 bg-white rounded-lg flex items-center justify-center">
                <span className="text-xl font-poppins font-bold text-primary">?</span>
              </div>
            </div>
          </div>
          <div className="text-center mt-3">
            <span className="text-sm text-gray-600">Cartas restantes: <b>{cardsRemaining}</b></span>
          </div>
        </div>
      </div>
    </div>
  );
}
