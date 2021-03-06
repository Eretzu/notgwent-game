import ServerPlayerInGame from '../players/ServerPlayerInGame'
import ServerGame from '../models/ServerGame'
import ServerPlayer from '../players/ServerPlayer'
import IncomingMessageHandlers from '../handlers/IncomingMessageHandlers'
import CardPlayedMessage from '@shared/models/network/CardPlayedMessage'
import CardTargetMessage from '@shared/models/network/CardTargetMessage'
import Utils from '../../utils/Utils'
import ServerTemplateCardDeck from '../models/ServerTemplateCardDeck'
import GameTurnPhase from '@shared/enums/GameTurnPhase'
import CardLibrary from '../libraries/CardLibrary'
import ServerCard from '../models/ServerCard'
import CardType from '@shared/enums/CardType'
import {GenericActionMessageType} from '@shared/models/network/messageHandlers/ClientToServerMessageTypes'

export default class ServerBotPlayerInGame extends ServerPlayerInGame {
	constructor(game: ServerGame, player: ServerPlayer) {
		super(game, player)
		this.initialized = true
	}

	public startMulligan(): void {
		setTimeout(() => {
			this.finishMulligan()
		})
	}

	public startTurn(): void {
		super.startTurn()

		setTimeout(() => {
			this.botTakesTheirTurn()
		}, 0)
	}

	private botTakesTheirTurn(): void {
		const botTotalPower = this.game.board.getTotalPlayerPower(this)
		const opponentTotalPower = this.opponent ? this.game.board.getTotalPlayerPower(this.opponent) : 0

		const botWonRound = botTotalPower > opponentTotalPower && this.opponent && this.opponent.roundEnded
		const botLostRound = opponentTotalPower > botTotalPower + 30 && this.morale > 1
		const botHasGoodLead = botTotalPower > opponentTotalPower + 15 && this.morale > 1

		if (botHasGoodLead && !botWonRound) {
			while (this.hasAnySpellPlays()) {
				this.botPlaysCard(true)
			}
		}

		if (botWonRound || botLostRound || botHasGoodLead) {
			this.botEndsTurn()
			return
		}

		try {
			while ((this.canPlayUnitCard() || (this.hasHighValueSpellPlays()) && this.game.turnPhase === GameTurnPhase.DEPLOY)) {
				this.botPlaysCard(false)
			}
		} catch (e) {
			console.error('Unknown AI error', e)
		}
		this.botEndsTurn()
	}

	private botPlaysCard(spellsOnly: boolean): void {
		const baseCards = spellsOnly ? this.cardHand.spellCards : this.cardHand.allCards

		const cards = Utils.sortCards(baseCards)
			.filter(card => card.targeting.getValidCardPlayTargets(this).length > 0)
			.map(card => ({
				card: card,
				bestExpectedValue: this.getBestExpectedValue(card)
			}))
			.sort((a, b) => b.bestExpectedValue - a.bestExpectedValue)

		const selectedCard = cards[0].card

		const validRows = this.game.board.rows
			.filter(row => row.owner === this)
			.filter(row => !row.isFull())
			.reverse()

		const distanceFromFront = 0
		const targetRow = validRows[Math.min(distanceFromFront, validRows.length - 1)]
		const cardPlayerMessage = CardPlayedMessage.fromCardOnRow(selectedCard, targetRow.index, targetRow.cards.length)
		IncomingMessageHandlers[GenericActionMessageType.CARD_PLAY](cardPlayerMessage, this.game, this)

		while (this.game.cardPlay.cardResolveStack.hasCards()) {
			this.botChoosesTarget()
		}
	}

	private botChoosesTarget(): void {
		const validTargets = this.game.cardPlay.getValidTargets()
			.sort((a, b) => b.expectedValue - a.expectedValue)
		const cardTargetMessage = new CardTargetMessage(validTargets[0])
		IncomingMessageHandlers[GenericActionMessageType.CARD_TARGET](cardTargetMessage, this.game, this)
	}

	private botEndsTurn(): void {
		IncomingMessageHandlers[GenericActionMessageType.TURN_END](null, this.game, this)
	}

	private getBestExpectedValue(card: ServerCard): number {
		const targets = card.targeting.getDeployEffectTargets()

		const cardBaseValue = card.type === CardType.SPELL ? card.stats.baseSpellCost * 2 : card.stats.basePower
		const spellExtraValue = this.cardHand.unitCards.length <= 2 ? 1 : 0

		if (targets.length === 0) {
			return card.botEvaluation.expectedValue - cardBaseValue + spellExtraValue
		}
		const bestTargetingValue = targets.sort((a, b) => b.expectedValue - a.expectedValue)[0].expectedValue || 0
		return bestTargetingValue + card.botEvaluation.expectedValue - cardBaseValue + spellExtraValue
	}

	private canPlayUnitCard(): boolean {
		return this.cardHand.unitCards.filter(card => card.stats.unitCost <= this.unitMana).length > 0
	}

	private hasHighValueSpellPlays(): boolean {
		return Utils.sortCards(this.cardHand.spellCards)
			.filter(card => card.targeting.getValidCardPlayTargets(this).length > 0)
			.map(card => ({
				card: card,
				bestExpectedValue: this.getBestExpectedValue(card)
			}))
			.filter(tuple => tuple.bestExpectedValue > 0)
			.length > 0
	}

	private hasAnySpellPlays(): boolean {
		return Utils.sortCards(this.cardHand.spellCards)
			.filter(card => card.targeting.getValidCardPlayTargets(this).length > 0)
			.length > 0
	}

	static newInstance(game: ServerGame, player: ServerPlayer, cardDeck: ServerTemplateCardDeck): ServerBotPlayerInGame {
		const playerInGame = new ServerBotPlayerInGame(game, player)
		playerInGame.leader = CardLibrary.instantiateByInstance(game, cardDeck.leader)
		playerInGame.cardDeck.instantiateFrom(cardDeck)
		return playerInGame
	}
}
