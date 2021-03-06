import express, {Response} from 'express'
import RequirePlayerTokenMiddleware from '../middleware/RequirePlayerTokenMiddleware'
import ServerPlayer from '../game/players/ServerPlayer'
import ServerEditorDeck from '../game/models/ServerEditorDeck'
import EditorDeck from '@shared/models/EditorDeck'
import EditorDeckDatabase from '../database/EditorDeckDatabase'
import AsyncHandler from '../utils/AsyncHandler'
import DeckUtils from '../utils/DeckUtils'
import { v4 as uuidv4 } from 'uuid'
import SharedDeckDatabase from '../database/SharedDeckDatabase'
import {generateShortId} from '../utils/Utils'

const router = express.Router()

router.use(RequirePlayerTokenMiddleware)

router.get('/', AsyncHandler(async(req, res: Response) => {
	const player = req['player'] as ServerPlayer
	const decks = await EditorDeckDatabase.selectEditorDecksForPlayer(player)
	if (!decks) {
		res.json([])
		return
	}

	const populatedDecks = decks.map(deck => DeckUtils.populateDeck(deck))
	res.json(populatedDecks)
}))

router.get('/:deckId', AsyncHandler(async(req, res: Response) => {
	const player = req['player'] as ServerPlayer
	const deckId = req.params.deckId
	const deck = await EditorDeckDatabase.selectEditorDeckByIdForPlayer(deckId, player)
	if (!deck) {
		throw { status: 404, error: 'Deck not found' }
	}

	const populatedDeck = DeckUtils.populateDeck(deck)
	res.json(populatedDeck)
}))

router.post('/:deckId/share', AsyncHandler(async(req, res: Response) => {
	const deckId = req.params.deckId
	const deck = await EditorDeckDatabase.selectEditorDeckById(deckId)
	if (!deck) {
		throw { status: 404, error: 'Deck not found' }
	}

	const code = generateShortId(8)
	const deckInserted = await SharedDeckDatabase.insertSharedDeck(code, deck)
	if (!deckInserted) {
		throw { status: 500, error: 'Generic database error' }
	}

	res.json({
		data: code
	})
}))

router.post('/', AsyncHandler(async(req, res: Response) => {
	const player = req['player'] as ServerPlayer
	const sharedDeckId = req.body.sharedCode
	let deck
	const deckId = uuidv4()
	if (sharedDeckId) {
		deck = await SharedDeckDatabase.selectSharedDeckById(sharedDeckId)
	} else {
		deck = ServerEditorDeck.newDeck()
	}
	const success = deck ? await EditorDeckDatabase.insertEditorDeck(player, deckId, deck) : false

	res.status(success ? 200 : 400)
	if (deck) {
		deck.id = deckId
	}
	res.json({
		deck: success ? deck : undefined
	})
}))

router.put('/:deckId', AsyncHandler(async(req, res: Response) => {
	const deckId = req.params.deckId
	const deckData = req.body as EditorDeck
	const player = req['player'] as ServerPlayer

	const success = await EditorDeckDatabase.insertEditorDeck(player, deckId, deckData)

	res.status(success ? 204 : 400)
	res.send()
}))

router.delete('/:deckId', AsyncHandler(async(req, res: Response) => {
	const deckId = req.params.deckId
	const player = req['player'] as ServerPlayer

	if (!deckId || deckId === 'undefined') {
		throw { status: 400, error: 'Missing deck ID' }
	}

	await EditorDeckDatabase.deleteEditorDeck(deckId, player)
	res.status(204)
	res.send()
}))

module.exports = router
