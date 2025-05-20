import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertPlayerSchema, 
  PLAYER_COLORS, 
  CASAS_ESPECIAIS, 
  SPECIAL_CARDS 
} from "@shared/schema";
import { z } from "zod";
import { fromZodError } from "zod-validation-error";

export async function registerRoutes(app: Express): Promise<Server> {
  // put application routes here
  // prefix all routes with /api

  // Game creation
  app.post("/api/games", async (req, res) => {
    try {
      const game = await storage.createGame();
      res.json({ gameId: game.id });
    } catch (error) {
      res.status(500).json({ message: "Failed to create game" });
    }
  });

  // Add players to game
  app.post("/api/games/:gameId/players", async (req, res) => {
    try {
      const gameId = parseInt(req.params.gameId);
      const game = await storage.getGame(gameId);
      
      if (!game) {
        return res.status(404).json({ message: "Game not found" });
      }
      
      if (game.status !== "waiting") {
        return res.status(400).json({ message: "Cannot add players to an active game" });
      }
      
      // Validate player data
      const schema = z.object({
        name: z.string().min(1).max(20),
      });
      
      const validated = schema.parse(req.body);
      
      // Get existing players to determine order
      const existingPlayers = await storage.getPlayersByGameId(gameId);
      
      if (existingPlayers.length >= 4) {
        return res.status(400).json({ message: "Maximum 4 players allowed" });
      }
      
      const playerOrder = existingPlayers.length;
      const playerColor = PLAYER_COLORS[playerOrder];
      
      const player = await storage.createPlayer({
        gameId,
        name: validated.name,
        position: 0,
        perdeuTurno: false,
        color: playerColor,
        order: playerOrder
      });
      
      res.json(player);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid player data" });
      }
      res.status(500).json({ message: "Failed to add player" });
    }
  });

  // Start game
  app.post("/api/games/:gameId/start", async (req, res) => {
    try {
      const gameId = parseInt(req.params.gameId);
      const game = await storage.getGame(gameId);
      
      if (!game) {
        return res.status(404).json({ message: "Game not found" });
      }
      
      const players = await storage.getPlayersByGameId(gameId);
      
      if (players.length < 2) {
        return res.status(400).json({ message: "At least 2 players are required to start the game" });
      }
      
      // Update game to active state
      const updatedGame = await storage.updateGame(gameId, {
        status: "active",
        currentPlayer: 0,
        currentTurn: 1
      });
      
      // Create game started event
      await storage.createGameEvent({
        gameId,
        message: "Jogo iniciado!",
        type: "special",
        timestamp: Date.now()
      });
      
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to start game" });
    }
  });

  // Get game state
  app.get("/api/games/:gameId", async (req, res) => {
    try {
      const gameId = parseInt(req.params.gameId);
      const gameState = await storage.getFullGameState(gameId);
      
      if (!gameState) {
        return res.status(404).json({ message: "Game not found" });
      }
      
      res.json(gameState);
    } catch (error) {
      res.status(500).json({ message: "Failed to get game state" });
    }
  });

  // Roll dice and process turn
  app.post("/api/games/:gameId/roll", async (req, res) => {
    try {
      const gameId = parseInt(req.params.gameId);
      const game = await storage.getGame(gameId);
      
      if (!game) {
        return res.status(404).json({ message: "Game not found" });
      }
      
      if (game.status !== "active") {
        return res.status(400).json({ message: "Game is not active" });
      }
      
      const players = await storage.getPlayersByGameId(gameId);
      const currentPlayer = players[game.currentPlayer];
      
      // Check if player lost their turn
      if (currentPlayer.perdeuTurno) {
        // Create event for lost turn
        await storage.createGameEvent({
          gameId,
          message: `${currentPlayer.name} perdeu o turno!`,
          type: "special",
          timestamp: Date.now()
        });
        
        // Reset perdeuTurno flag
        await storage.updatePlayer(currentPlayer.id, {
          perdeuTurno: false
        });
        
        // Move to next player
        const nextPlayerIndex = (game.currentPlayer + 1) % players.length;
        await storage.updateGame(gameId, {
          currentPlayer: nextPlayerIndex,
          currentTurn: game.currentTurn + 1
        });
        
        const gameState = await storage.getFullGameState(gameId);
        return res.json({
          ...gameState,
          skippedTurn: true
        });
      }
      
      // Roll dice (1-6)
      const diceValue = Math.floor(Math.random() * 6) + 1;
      
      // Create dice roll event
      await storage.createGameEvent({
        gameId,
        message: `${currentPlayer.name} tirou ${diceValue} no dado!`,
        type: "dice",
        timestamp: Date.now()
      });
      
      // Calculate new position
      let newPosition = Math.min(currentPlayer.position + diceValue, 29);
      
      // Create movement event
      await storage.createGameEvent({
        gameId,
        message: `${currentPlayer.name} avançou para a casa ${newPosition + 1}`,
        type: "move",
        timestamp: Date.now()
      });
      
      // Update player position
      await storage.updatePlayer(currentPlayer.id, {
        position: newPosition
      });
      
      // Variable to track current card if drawn
      let currentCard = null;
      
      // Check if position is a special space
      const specialTiles = game.casasEspeciais as Record<number, string>;
      if (specialTiles[newPosition]) {
        const effect = specialTiles[newPosition];
        
        await storage.createGameEvent({
          gameId,
          message: `${currentPlayer.name} caiu em uma casa especial: ${getEffectName(effect)}`,
          type: "special",
          timestamp: Date.now()
        });
        
        // Apply special effects
        switch (effect) {
          case "avance_2": {
            newPosition = Math.min(newPosition + 2, 29);
            await storage.createGameEvent({
              gameId,
              message: `${currentPlayer.name} avançou 2 casas adicionais para a casa ${newPosition + 1}!`,
              type: "special",
              timestamp: Date.now()
            });
            await storage.updatePlayer(currentPlayer.id, {
              position: newPosition
            });
            break;
          }
          case "volte_3": {
            newPosition = Math.max(newPosition - 3, 0);
            await storage.createGameEvent({
              gameId,
              message: `${currentPlayer.name} voltou 3 casas para a casa ${newPosition + 1}!`,
              type: "special",
              timestamp: Date.now()
            });
            await storage.updatePlayer(currentPlayer.id, {
              position: newPosition
            });
            break;
          }
          case "perde_turno": {
            await storage.createGameEvent({
              gameId,
              message: `${currentPlayer.name} perderá o próximo turno!`,
              type: "special",
              timestamp: Date.now()
            });
            await storage.updatePlayer(currentPlayer.id, {
              perdeuTurno: true
            });
            break;
          }
          case "troque": {
            // Find another player to swap with
            const otherPlayers = players.filter(p => p.id !== currentPlayer.id);
            if (otherPlayers.length > 0) {
              // Randomly select another player
              const randomIndex = Math.floor(Math.random() * otherPlayers.length);
              const otherPlayer = otherPlayers[randomIndex];
              
              // Swap positions
              await storage.createGameEvent({
                gameId,
                message: `${currentPlayer.name} trocou de lugar com ${otherPlayer.name}!`,
                type: "special",
                timestamp: Date.now()
              });
              
              await storage.updatePlayer(currentPlayer.id, {
                position: otherPlayer.position
              });
              
              await storage.updatePlayer(otherPlayer.id, {
                position: newPosition
              });
              
              newPosition = otherPlayer.position;
            }
            break;
          }
          case "puxe_carta": {
            // Get the cards from the game
            let pilhaCartas = [...(game.pilhaCartas as string[])];
            
            if (pilhaCartas.length === 0) {
              // Reshuffle if no cards left
              pilhaCartas = [...SPECIAL_CARDS];
              shuffleArray(pilhaCartas);
            }
            
            // Draw a card
            const card = pilhaCartas.pop() || "";
            currentCard = card;
            
            await storage.createGameEvent({
              gameId,
              message: `${currentPlayer.name} puxou a carta: ${card}`,
              type: "card",
              timestamp: Date.now()
            });
            
            // Update game with new card pile
            await storage.updateGame(gameId, {
              pilhaCartas
            });
            
            // Apply card effect
            switch (card) {
              case "Avance 3 casas": {
                newPosition = Math.min(newPosition + 3, 29);
                await storage.createGameEvent({
                  gameId,
                  message: `${currentPlayer.name} avançou 3 casas para a casa ${newPosition + 1}!`,
                  type: "card",
                  timestamp: Date.now()
                });
                await storage.updatePlayer(currentPlayer.id, {
                  position: newPosition
                });
                break;
              }
              case "Jogue novamente": {
                await storage.createGameEvent({
                  gameId,
                  message: `${currentPlayer.name} ganhou um novo turno!`,
                  type: "card",
                  timestamp: Date.now()
                });
                // Don't move to next player (handled below)
                const gameState = await storage.getFullGameState(gameId);
                return res.json({
                  ...gameState,
                  extraTurn: true,
                  diceValue,
                  currentCard
                });
              }
              case "Volte 2 casas": {
                newPosition = Math.max(newPosition - 2, 0);
                await storage.createGameEvent({
                  gameId,
                  message: `${currentPlayer.name} voltou 2 casas para a casa ${newPosition + 1}!`,
                  type: "card",
                  timestamp: Date.now()
                });
                await storage.updatePlayer(currentPlayer.id, {
                  position: newPosition
                });
                break;
              }
              case "Troque de lugar com o líder": {
                // Find the player in the lead
                const leader = [...players].sort((a, b) => b.position - a.position)[0];
                
                if (leader.id !== currentPlayer.id) {
                  await storage.createGameEvent({
                    gameId,
                    message: `${currentPlayer.name} trocou de lugar com o líder ${leader.name}!`,
                    type: "card",
                    timestamp: Date.now()
                  });
                  
                  await storage.updatePlayer(currentPlayer.id, {
                    position: leader.position
                  });
                  
                  await storage.updatePlayer(leader.id, {
                    position: newPosition
                  });
                  
                  newPosition = leader.position;
                }
                break;
              }
            }
            break;
          }
        }
      }
      
      // Check if the player won
      if (newPosition >= 29) {
        // Game completed
        await storage.updateGame(gameId, {
          status: "completed"
        });
        
        await storage.createGameEvent({
          gameId,
          message: `${currentPlayer.name} venceu o jogo!`,
          type: "special",
          timestamp: Date.now()
        });
        
        const gameState = await storage.getFullGameState(gameId);
        return res.json({
          ...gameState,
          winner: currentPlayer,
          diceValue,
          currentCard
        });
      }
      
      // Move to next player if not an extra turn
      const nextPlayerIndex = (game.currentPlayer + 1) % players.length;
      await storage.updateGame(gameId, {
        currentPlayer: nextPlayerIndex,
        currentTurn: game.currentTurn + 1
      });
      
      const gameState = await storage.getFullGameState(gameId);
      res.json({
        ...gameState,
        diceValue,
        currentCard
      });
    } catch (error) {
      console.error("Error processing turn:", error);
      res.status(500).json({ message: "Failed to process turn" });
    }
  });

  // Reset game
  app.post("/api/games/:gameId/reset", async (req, res) => {
    try {
      const gameId = parseInt(req.params.gameId);
      const game = await storage.getGame(gameId);
      
      if (!game) {
        return res.status(404).json({ message: "Game not found" });
      }
      
      // Create a new game
      const newGame = await storage.createGame();
      
      // Get existing players
      const players = await storage.getPlayersByGameId(gameId);
      
      // Add players to new game
      for (const player of players) {
        await storage.createPlayer({
          gameId: newGame.id,
          name: player.name,
          position: 0,
          perdeuTurno: false,
          color: player.color,
          order: player.order
        });
      }
      
      // Create reset event
      await storage.createGameEvent({
        gameId: newGame.id,
        message: "Jogo reiniciado!",
        type: "special",
        timestamp: Date.now()
      });
      
      res.json({ gameId: newGame.id });
    } catch (error) {
      res.status(500).json({ message: "Failed to reset game" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}

// Helper functions
function getEffectName(effect: string): string {
  switch (effect) {
    case "avance_2":
      return "Avance 2 casas";
    case "volte_3":
      return "Volte 3 casas";
    case "perde_turno":
      return "Perde o próximo turno";
    case "troque":
      return "Troque de lugar";
    case "puxe_carta":
      return "Puxe uma carta";
    default:
      return effect;
  }
}

function shuffleArray<T>(array: T[]): void {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}
