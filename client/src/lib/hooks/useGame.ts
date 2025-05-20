import { useState, useCallback, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createGame, addPlayer, startGame, rollDice, resetGame, getGameState } from '../game';
import type { GameState, PlayerState } from '@shared/schema';
import { useToast } from '@/hooks/use-toast';

export function useGame() {
  const [gameId, setGameId] = useState<number | null>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  // Create a new game when the component mounts
  const createGameMutation = useMutation({
    mutationFn: createGame,
    onSuccess: (newGameId) => {
      setGameId(newGameId);
      queryClient.invalidateQueries({ queryKey: [`/api/games/${newGameId}`] });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível criar um novo jogo.",
        variant: "destructive"
      });
    }
  });
  
  // Initialize the game on component mount
  useEffect(() => {
    createGameMutation.mutate();
  }, []);
  
  // Query the game state
  const { data: gameState, isLoading: isLoadingGameState } = useQuery({
    queryKey: gameId ? [`/api/games/${gameId}`] : ['none'],
    enabled: !!gameId,
    refetchInterval: 2000, // Poll for updates every 2 seconds
  });
  
  // Add a player to the game
  const addPlayerMutation = useMutation({
    mutationFn: (name: string) => addPlayer(gameId!, name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/games/${gameId}`] });
      toast({
        title: "Sucesso",
        description: "Jogador adicionado com sucesso!"
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível adicionar o jogador.",
        variant: "destructive"
      });
    }
  });
  
  // Start the game
  const startGameMutation = useMutation({
    mutationFn: () => startGame(gameId!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/games/${gameId}`] });
      toast({
        title: "Jogo iniciado!",
        description: "O jogo foi iniciado com sucesso."
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível iniciar o jogo.",
        variant: "destructive"
      });
    }
  });
  
  // Roll the dice
  const rollDiceMutation = useMutation({
    mutationFn: () => rollDice(gameId!),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: [`/api/games/${gameId}`] });
      
      // If there's a winner
      if (result.winner) {
        toast({
          title: "🏆 Temos um vencedor!",
          description: `${result.winner.name} venceu o jogo!`
        });
      }
      
      // If turn was skipped
      if (result.skippedTurn) {
        toast({
          title: "Turno pulado",
          description: "O jogador perdeu esse turno."
        });
      }
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível jogar o dado.",
        variant: "destructive"
      });
    }
  });
  
  // Reset the game
  const resetGameMutation = useMutation({
    mutationFn: () => resetGame(gameId!),
    onSuccess: (newGameId) => {
      setGameId(newGameId);
      queryClient.invalidateQueries({ queryKey: [`/api/games/${newGameId}`] });
      toast({
        title: "Jogo reiniciado",
        description: "O jogo foi reiniciado com sucesso."
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível reiniciar o jogo.",
        variant: "destructive"
      });
    }
  });
  
  // Start a new game
  const startNewGame = useCallback(() => {
    createGameMutation.mutate();
  }, []);
  
  // Add a player
  const handleAddPlayer = useCallback((name: string) => {
    if (!gameId) return;
    addPlayerMutation.mutate(name);
  }, [gameId]);
  
  // Start the game
  const handleStartGame = useCallback(() => {
    if (!gameId) return;
    startGameMutation.mutate();
  }, [gameId]);
  
  // Roll the dice
  const handleRollDice = useCallback(() => {
    if (!gameId) return;
    rollDiceMutation.mutate();
  }, [gameId]);
  
  // Reset the game
  const handleResetGame = useCallback(() => {
    if (!gameId) return;
    resetGameMutation.mutate();
  }, [gameId]);
  
  const isLoading = 
    createGameMutation.isPending || 
    addPlayerMutation.isPending || 
    startGameMutation.isPending || 
    rollDiceMutation.isPending || 
    resetGameMutation.isPending ||
    isLoadingGameState;
  
  // Combine the base game state with any additional data from mutations
  const enhancedGameState = gameState 
    ? {
        ...gameState,
        diceValue: rollDiceMutation.data?.diceValue,
        currentCard: rollDiceMutation.data?.currentCard
      }
    : null;
  
  return {
    gameState: enhancedGameState,
    startNewGame,
    addPlayer: handleAddPlayer,
    startGame: handleStartGame,
    rollDice: handleRollDice,
    resetGame: handleResetGame,
    isLoading
  };
}
