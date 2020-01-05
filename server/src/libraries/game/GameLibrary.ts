import ServerGame from './ServerGame'
import ServerPlayer from '../players/ServerPlayer'
import OutgoingMessageHandlers from '../../handlers/OutgoingMessageHandlers'

export default class GameLibrary {
	games: ServerGame[]

	constructor() {
		this.games = []
	}

	public createOwnedGame(owner: ServerPlayer, name: string): ServerGame {
		const game = ServerGame.newOwnedInstance(owner, name)
		this.games.push(game)
		return game
	}

	private destroyGame(game: ServerGame): void {
		game.players.forEach(playerInGame => OutgoingMessageHandlers.notifyAboutGameShutdown(playerInGame.player))

		this.games.splice(this.games.indexOf(game), 1)
	}

	public destroyOwnedGame(id: string, player: ServerPlayer): void {
		if (!id) { throw 'Missing game ID' }

		const game = this.games.find(game => game.id === id)
		if (!game || game.owner.id !== player.id) { throw 'Invalid game ID' }

		this.destroyGame(game)
	}
}
