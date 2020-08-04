import express from 'express'
import ServerGame from '../game/models/ServerGame'
import ServerPlayer from '../game/players/ServerPlayer'
import IncomingMessageHandlers from '../game/handlers/IncomingMessageHandlers'
import OutgoingMessageHandlers from '../game/handlers/OutgoingMessageHandlers'
import ConnectionEstablishedHandler from '../game/handlers/ConnectionEstablishedHandler'
import ServerTemplateCardDeck from '../game/models/ServerTemplateCardDeck'
import EditorDeckDatabase from '../database/EditorDeckDatabase'
import PlayerLibrary from '../game/players/PlayerLibrary'
import GameLibrary from '../game/libraries/GameLibrary'
import {colorizeId} from '../utils/Utils'

const router = express.Router()

router.ws('/:gameId', async (ws, req) => {
	const currentGame: ServerGame = GameLibrary.games.find(game => game.id === req.params.gameId)
	const currentPlayer: ServerPlayer = await PlayerLibrary.getPlayerByJwtToken(req.cookies['playerToken'])
	if (!currentGame || !currentPlayer) {
		OutgoingMessageHandlers.notifyAboutInvalidGameID(ws)
		ws.close()
		return
	}

	if (currentGame.isStarted) {
		OutgoingMessageHandlers.notifyAboutGameAlreadyStarted(ws)
		ws.close()
		return
	}

	if (currentGame.players.find(playerInGame => playerInGame.player === currentPlayer)) {
		OutgoingMessageHandlers.notifyAboutDuplicatedConnection(ws)
		ws.close()
		return
	}

	const deckId = req.query.deckId
	if (!deckId) {
		OutgoingMessageHandlers.notifyAboutMissingDeckId(ws)
		ws.close()
		return
	}

	const deck = await EditorDeckDatabase.selectEditorDeckByIdForPlayer(deckId, currentPlayer)
	if (!deck) {
		OutgoingMessageHandlers.notifyAboutInvalidDeck(ws)
		ws.close()
		return
	}

	currentPlayer.disconnect()
	currentPlayer.registerConnection(ws)

	const currentPlayerInGame = currentGame.addPlayer(currentPlayer, ServerTemplateCardDeck.fromEditorDeck(currentGame, deck))

	ws.on('message', (rawMsg: string) => {
		const msg = JSON.parse(rawMsg)
		const handler = IncomingMessageHandlers[msg.type]
		if (!handler) {
			OutgoingMessageHandlers.notifyAboutInvalidMessageType(ws, msg.type)
			return
		}

		try {
			handler(msg.data, currentGame, currentPlayerInGame)
		} catch (e) {
			console.error(`An unexpected error occurred in game ${colorizeId(currentGame.id)}. It will be shut down.`, e)
			currentGame.forceShutdown('An error occurred')
		}
	})

	ws.on('close', () => {
		currentGame.removePlayer(currentPlayer)
		ConnectionEstablishedHandler.onPlayerDisconnected(currentGame, currentPlayer)
	})

	OutgoingMessageHandlers.notifyAboutInitRequested(currentPlayer)
})

module.exports = router
