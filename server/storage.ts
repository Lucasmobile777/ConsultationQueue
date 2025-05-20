import { 
  users, type User, type InsertUser,
  games, type Game, type InsertGame,
  players, type Player, type InsertPlayer,
  gameEvents, type GameEvent, type InsertGameEvent,
  type GameState, type PlayerState, type GameEventState,
  CASAS_ESPECIAIS, SPECIAL_CARDS, PLAYER_COLORS
} from "@shared/schema";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Game methods
  createGame(): Promise<Game>;
  getGame(id: number): Promise<Game | undefined>;
  updateGame(id: number, update: Partial<Game>): Promise<Game | undefined>;
  
  // Player methods
  createPlayer(player: InsertPlayer): Promise<Player>;
  getPlayersByGameId(gameId: number): Promise<Player[]>;
  updatePlayer(id: number, update: Partial<Player>): Promise<Player | undefined>;
  
  // Game events
  createGameEvent(event: InsertGameEvent): Promise<GameEvent>;
  getGameEventsByGameId(gameId: number): Promise<GameEvent[]>;
  
  // Game state methods
  getFullGameState(gameId: number): Promise<GameState | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private games: Map<number, Game>;
  private players: Map<number, Player>;
  private gameEvents: Map<number, GameEvent>;
  
  private userCurrentId: number;
  private gameCurrentId: number;
  private playerCurrentId: number;
  private gameEventCurrentId: number;

  constructor() {
    this.users = new Map();
    this.games = new Map();
    this.players = new Map();
    this.gameEvents = new Map();
    
    this.userCurrentId = 1;
    this.gameCurrentId = 1;
    this.playerCurrentId = 1;
    this.gameEventCurrentId = 1;
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userCurrentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  // Game methods
  async createGame(): Promise<Game> {
    const id = this.gameCurrentId++;
    
    // Shuffle cards
    const pilhaCartas = [...SPECIAL_CARDS];
    this.shuffleArray(pilhaCartas);
    
    const game: Game = {
      id,
      status: "waiting",
      currentTurn: 0,
      currentPlayer: 0,
      pilhaCartas,
      casasEspeciais: CASAS_ESPECIAIS
    };
    
    this.games.set(id, game);
    return game;
  }
  
  async getGame(id: number): Promise<Game | undefined> {
    return this.games.get(id);
  }
  
  async updateGame(id: number, update: Partial<Game>): Promise<Game | undefined> {
    const game = this.games.get(id);
    if (!game) return undefined;
    
    const updatedGame = { ...game, ...update };
    this.games.set(id, updatedGame);
    return updatedGame;
  }
  
  // Player methods
  async createPlayer(insertPlayer: InsertPlayer): Promise<Player> {
    const id = this.playerCurrentId++;
    // Make sure required properties have default values
    const player: Player = { 
      ...insertPlayer, 
      id,
      position: insertPlayer.position ?? 0,
      perdeuTurno: insertPlayer.perdeuTurno ?? false
    };
    this.players.set(id, player);
    return player;
  }
  
  async getPlayersByGameId(gameId: number): Promise<Player[]> {
    return Array.from(this.players.values())
      .filter(player => player.gameId === gameId)
      .sort((a, b) => a.order - b.order);
  }
  
  async updatePlayer(id: number, update: Partial<Player>): Promise<Player | undefined> {
    const player = this.players.get(id);
    if (!player) return undefined;
    
    const updatedPlayer = { ...player, ...update };
    this.players.set(id, updatedPlayer);
    return updatedPlayer;
  }
  
  // Game events
  async createGameEvent(insertEvent: InsertGameEvent): Promise<GameEvent> {
    const id = this.gameEventCurrentId++;
    const event: GameEvent = { ...insertEvent, id };
    this.gameEvents.set(id, event);
    return event;
  }
  
  async getGameEventsByGameId(gameId: number): Promise<GameEvent[]> {
    return Array.from(this.gameEvents.values())
      .filter(event => event.gameId === gameId)
      .sort((a, b) => b.timestamp - a.timestamp); // Newest first
  }
  
  // Game state methods
  async getFullGameState(gameId: number): Promise<GameState | undefined> {
    const game = await this.getGame(gameId);
    if (!game) return undefined;
    
    const players = await this.getPlayersByGameId(gameId);
    const events = await this.getGameEventsByGameId(gameId);
    
    // Create empty tabuleiro with 30 spaces
    const tabuleiro = Array(30).fill("");
    
    const playerStates: PlayerState[] = players.map(p => ({
      id: p.id,
      name: p.name,
      position: p.position,
      perdeuTurno: p.perdeuTurno,
      color: p.color,
      order: p.order
    }));
    
    const eventStates: GameEventState[] = events.map(e => ({
      id: e.id,
      message: e.message,
      type: e.type as 'dice' | 'move' | 'card' | 'special',
      timestamp: e.timestamp
    }));
    
    return {
      id: game.id,
      status: game.status as 'waiting' | 'active' | 'completed',
      currentTurn: game.currentTurn,
      currentPlayer: game.currentPlayer,
      players: playerStates,
      events: eventStates,
      tabuleiro,
      pilhaCartas: game.pilhaCartas as string[],
      casasEspeciais: game.casasEspeciais as Record<number, string>,
      currentCard: null
    };
  }
  
  // Helper methods
  private shuffleArray<T>(array: T[]): void {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }
}

export const storage = new MemStorage();
