import { apiRequest } from './queryClient';
import type { 
  GameState, 
  PlayerState,
  GameEventState 
} from '@shared/schema';

// Create a new game
export async function createGame(): Promise<number> {
  const res = await apiRequest('POST', '/api/games', {});
  const data = await res.json();
  return data.gameId;
}

// Add a player to the game
export async function addPlayer(gameId: number, name: string): Promise<PlayerState> {
  const res = await apiRequest('POST', `/api/games/${gameId}/players`, { name });
  return await res.json();
}

// Start the game
export async function startGame(gameId: number): Promise<void> {
  await apiRequest('POST', `/api/games/${gameId}/start`, {});
}

// Roll the dice and process turn
export async function rollDice(gameId: number): Promise<GameState & { 
  diceValue?: number, 
  currentCard?: string | null,
  winner?: PlayerState,
  extraTurn?: boolean,
  skippedTurn?: boolean
}> {
  const res = await apiRequest('POST', `/api/games/${gameId}/roll`, {});
  return await res.json();
}

// Reset/restart the game
export async function resetGame(gameId: number): Promise<number> {
  const res = await apiRequest('POST', `/api/games/${gameId}/reset`, {});
  const data = await res.json();
  return data.gameId;
}

// Get the current game state
export async function getGameState(gameId: number): Promise<GameState> {
  const res = await apiRequest('GET', `/api/games/${gameId}`, undefined);
  return await res.json();
}
