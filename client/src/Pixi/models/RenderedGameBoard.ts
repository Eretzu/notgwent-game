import Constants from '@/shared/Constants'
import GameBoard from '@/shared/models/GameBoard'
import RenderedCardOnBoard from '@/Pixi/models/RenderedCardOnBoard'
import RenderedGameBoardRow from '@/Pixi/models/RenderedGameBoardRow'
import RenderedAttackOrder from '@/Pixi/models/RenderedAttackOrder'
import ClientPlayerInGame from '@/Pixi/models/ClientPlayerInGame'

export default class RenderedGameBoard extends GameBoard {
	rows: RenderedGameBoardRow[]
	isInverted: boolean = false
	queuedAttacks: RenderedAttackOrder[]

	constructor() {
		super()
		this.rows = []
		this.queuedAttacks = []
		for (let i = 0; i < Constants.GAME_BOARD_ROW_COUNT; i++) {
			this.rows.push(new RenderedGameBoardRow())
		}
	}

	public insertCard(card: RenderedCardOnBoard, rowIndex: number, unitIndex: number): void {
		this.rows[rowIndex].insertCard(card, unitIndex)
	}

	public findCardById(cardId: string): RenderedCardOnBoard | null {
		const cards = this.rows.map(row => row.cards).flat()
		return cards.find(cardOnBoard => cardOnBoard.card.id === cardId) || null
	}

	public removeCardById(cardId: string): void {
		const rowWithCard = this.rows.find(row => !!row.cards.find(cardOnBoard => cardOnBoard.card.id === cardId))
		if (!rowWithCard) {
			console.error(`No row includes card ${cardId}`)
			return
		}

		rowWithCard.removeCardById(cardId)
	}

	public getAllCards(): RenderedCardOnBoard[] {
		return this.rows.map(row => row.cards).flat()
	}

	public getCardsOwnedByPlayer(owner: ClientPlayerInGame) {
		return this.getAllCards().filter(unit => unit.owner === owner)
	}

	public clearBoard(): void {
		this.rows.forEach(row => row.clearRow())
	}

	public updateAttackOrders(newAttacks: RenderedAttackOrder[], removedAttacks: RenderedAttackOrder[]): void {
		removedAttacks.forEach(queuedAttack => {
			queuedAttack.destroy()
		})
		this.queuedAttacks = this.queuedAttacks.filter(queuedAttack => !removedAttacks.includes(queuedAttack))
		this.queuedAttacks = this.queuedAttacks.concat(newAttacks)
		newAttacks.forEach(newAttack => {
			newAttack.attacker.preferredAttackTarget = newAttack.target
		})
	}

	public setInverted(isInverted: boolean): void {
		this.isInverted = isInverted
	}
}
