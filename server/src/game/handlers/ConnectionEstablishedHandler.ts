import ServerGame from '../models/ServerGame'
import ServerPlayerInGame from '../players/ServerPlayerInGame'
import GameLibrary from '../libraries/GameLibrary'
import ServerPlayer from '../players/ServerPlayer'
import VoidPlayerInGame from '../utils/VoidPlayerInGame'
import ServerBotPlayer from '../AI/ServerBotPlayer'
import Constants from '@shared/Constants'

export default {
	onPlayerConnected(game: ServerGame, playerInGame: ServerPlayerInGame): void {
		const initializedPlayers = game.players.filter(playerInGame => playerInGame.initialized)
		if (initializedPlayers.length < Constants.PLAYERS_PER_GAME) {
			return
		}

		game.start()
	},

	onPlayerDisconnected(game: ServerGame, player: ServerPlayer): void {
		const humanPlayersInGame = game.players.filter(playerInGame => playerInGame !== VoidPlayerInGame.for(game) && !(playerInGame.player instanceof ServerBotPlayer))
		if (humanPlayersInGame.length === 0) {
			game.forceShutdown('No human players left')
			return
		}

		if (game.players.length > 1) {
			return
		}

		game.finish(game.players[0], 'Opponent disconnected')
	}
}
